import { db } from "@/lib/db";
import { allow } from "@/lib/rateLimit";
import { IDEA_PACK, UNLOCK_AT } from "@/lib/config";

export async function GET(req: Request) {
  if (!(await allow(req, "pb", 600, 120))) return Response.json({ error: "slow down" }, { status: 429 });
  const code = new URL(req.url).searchParams.get("code")?.slice(0, 12) ?? "";
  const { data } = await db.from("registrations").select("name").eq("ref_code", code).order("created_at");
  const names = (data ?? []).map((r) => {
    const p = String(r.name).trim().split(/\s+/);
    return p.length > 1 ? `${p[0]} ${p[p.length - 1][0]}.` : p[0];
  });
  const unlocked = names.length >= UNLOCK_AT;
  return Response.json({ count: names.length, need: UNLOCK_AT, names, unlocked, pack: unlocked ? IDEA_PACK : null });
}