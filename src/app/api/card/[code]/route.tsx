import { ImageResponse } from "next/og";
import { db } from "@/lib/db";
import { getCounts } from "@/lib/stats";

export async function GET(req: Request, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;
  const { data: c } = await db.from("cards").select("*").eq("code", code).maybeSingle();
  if (!c) return new Response("Not found", { status: 404 });
  const n = await getCounts(c.college);
  const { data: pb } = await db.from("registrations").select("name").eq("ref_code", code).order("created_at").limit(4);
  const names = (pb ?? []).map((r) => String(r.name).trim().split(/\s+/)[0]).join(", ");

  const e = c.epitaph;
  const host = new URL(req.url).host;
  const muted = "#8b949e";

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", background: "#0b0d10", color: "#e8e6e1", padding: "56px 0 44px" }}>
        <div style={{ display: "flex", fontSize: 26, letterSpacing: 8, color: "#7d8590" }}>TUTORIAL GRAVEYARD</div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: 860, flex: 1, marginTop: 36, padding: "110px 64px 40px", background: "linear-gradient(180deg,#2b3038,#161a1f)", border: "4px solid #3d444d", borderTopLeftRadius: 430, borderTopRightRadius: 430 }}>
          <div style={{ display: "flex", fontSize: 24, letterSpacing: 6, color: muted }}>IN LOVING MEMORY OF</div>
          <div style={{ display: "flex", justifyContent: "center", textAlign: "center", fontSize: 52, marginTop: 20 }}>{e.deceased}</div>
          <div style={{ display: "flex", fontSize: 27, color: muted, marginTop: 16 }}>{e.lived}</div>
          <div style={{ display: "flex", width: 120, height: 3, background: "#4a525c", margin: "30px 0" }} />
          <div style={{ display: "flex", justifyContent: "center", textAlign: "center", fontSize: 32, lineHeight: 1.4 }}>{e.epitaph}</div>
          <div style={{ display: "flex", justifyContent: "center", textAlign: "center", fontSize: 26, color: "#a8b3a0", marginTop: 26 }}>{`Cause of death: ${e.cause}`}</div>
          <div style={{ display: "flex", marginTop: 32, padding: "10px 28px", borderRadius: 999, background: "#1f3a2a", color: "#7ee2a0", fontSize: 28 }}>{`Diagnosis: ${c.diagnosis}`}</div>
          {names ? <div style={{ display: "flex", marginTop: 18, fontSize: 24, color: muted }}>{`Pallbearers: ${names}`}</div> : null}
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 30 }}>
          <div style={{ display: "flex", fontSize: 34 }}>{`${n.buried} buried · ${n.pledged} pledged to resurrect`}</div>
          <div style={{ display: "flex", fontSize: 24, color: "#7d8590", marginTop: 8 }}>{`${n.label} · Bury yours at ${host}`}</div>
        </div>
      </div>
    ),
    { width: 1080, height: 1350, headers: { "Cache-Control": "public, max-age=300" } }
  );
}