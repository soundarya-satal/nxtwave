import { db } from "@/lib/db";
import { allow } from "@/lib/rateLimit";
import { MINUTES } from "@/lib/sample";

export async function POST(req: Request) {
  if (!(await allow(req, "checkpoint", 600, 40))) return Response.json({ ok: false }, { status: 429 });
  const b = await req.json().catch(() => ({}));
  const session = String(b.session ?? "").slice(0, 20);
  const minute = Number(b.minute);
  const status = String(b.status ?? "");
  if (!session || !(MINUTES as readonly number[]).includes(minute) || !["on_track", "stuck", "done"].includes(status))
    return Response.json({ ok: false }, { status: 400 });
  await db.from("checkpoints").upsert({ session, minute, status }, { onConflict: "session,minute" });
  return Response.json({ ok: true });
}

export async function GET() {
  const { data } = await db.from("checkpoints").select("minute,status").limit(5000);
  const out = MINUTES.map((m) => {
    const rows = (data ?? []).filter((r) => r.minute === m);
    const n = (s: string) => rows.filter((r) => r.status === s).length;
    return { minute: m, on_track: n("on_track"), stuck: n("stuck"), done: n("done") };
  });
  return Response.json({ rows: out, stuckNow: out.reduce((a, r) => a + r.stuck, 0) });
}