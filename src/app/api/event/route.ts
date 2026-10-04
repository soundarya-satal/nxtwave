import { logEvent } from "@/lib/db";
import { allow } from "@/lib/rateLimit";

export async function POST(req: Request) {
  if (!(await allow(req, "event", 600, 60))) return Response.json({ ok: false }, { status: 429 });
  const b = await req.json().catch(() => ({}));
  if (!["visit", "quiz"].includes(b.type)) return Response.json({ ok: false }, { status: 400 });
  const s = (v: unknown, n: number) => String(v ?? "").slice(0, n) || undefined;
  await logEvent({ type: b.type, variant: s(b.variant, 20), utm: s(b.utm, 40), session: s(b.session, 20) });
  return Response.json({ ok: true });
}