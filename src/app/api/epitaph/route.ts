import { createHash, randomBytes } from "crypto";
import { db, logEvent } from "@/lib/db";
import { allow } from "@/lib/rateLimit";
import { generateEpitaph, type Epitaph } from "@/lib/epitaph";
import { normaliseCollege } from "@/lib/colleges";
import { diagnose } from "@/lib/diagnosis";

export const maxDuration = 60;

export async function POST(req: Request) {
  if (!(await allow(req, "epitaph", 600, 5)))
    return Response.json({ error: "Too many tombstones for now. Try again in a few minutes." }, { status: 429 });

  const b = await req.json().catch(() => ({}));
  const s = (v: unknown, n: number) => String(v ?? "").trim().slice(0, n);
  const i = { what: s(b.what, 120), progress: s(b.progress, 80), when: s(b.when, 40), why: s(b.why, 120) };
  if (!i.what) return Response.json({ error: "Tell us what you started." }, { status: 400 });

  // Cache: identical answers reuse an earlier AI epitaph (saves free-tier quota)
  const hash = createHash("sha256").update(Object.values(i).join("|").toLowerCase()).digest("hex").slice(0, 32);
  const { data: hit } = await db.from("cards").select("epitaph").eq("input_hash", hash).eq("source", "ai").limit(1).maybeSingle();

  let best: Epitaph, others: Epitaph[] = [], source: string, note = "";
  if (hit) {
    best = hit.epitaph; source = "ai"; note = "cache hit";
  } else {
    const r = await generateEpitaph(i); // only the 4 intention fields reach the model
    best = r.best; others = r.others; source = r.source; note = r.note;
  }

  const code = randomBytes(4).toString("hex");
  const diagnosis = diagnose(i.why, i.what);
  const college = normaliseCollege(s(b.college, 80)) || null;
  const { error } = await db.from("cards").insert({
    code, what: i.what, progress: i.progress, when_text: i.when, why: i.why, diagnosis,
    epitaph: best, source, college, input_hash: hash,
    variant: s(b.variant, 20) || null, utm: s(b.utm, 40) || null,
  });
  if (error) return Response.json({ error: "Could not save your tombstone." }, { status: 500 });

  await logEvent({ type: "epitaph", variant: s(b.variant, 20), utm: s(b.utm, 40), college: college ?? undefined });
  return Response.json({ code, diagnosis, epitaph: best, others, source, note });
}