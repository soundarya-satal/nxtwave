import { ImageResponse } from "next/og";
import { loadCert } from "@/lib/cert";

export async function GET(_req: Request, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;
  const c = await loadCert(code);
  if (!c) return new Response("Not found", { status: 404 });
  const muted = "#8b949e";

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#0b0d10", padding: 28 }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "4px solid #2f6f4a", borderRadius: 24, padding: "0 70px", color: "#e8e6e1" }}>
          <div style={{ display: "flex", fontSize: 24, letterSpacing: 8, color: "#7d8590" }}>TUTORIAL GRAVEYARD</div>
          <div style={{ display: "flex", fontSize: 58, marginTop: 14, color: "#7ee2a0" }}>Resurrection Certificate</div>
          <div style={{ display: "flex", fontSize: 26, color: muted, marginTop: 34 }}>This certifies that</div>
          <div style={{ display: "flex", fontSize: 64, marginTop: 8, textAlign: "center" }}>{c.name}</div>
          <div style={{ display: "flex", fontSize: 26, color: muted, marginTop: 18, textAlign: "center" }}>
            {`brought back "${c.deceased}" by building a real AI project`}
          </div>
          <div style={{ display: "flex", fontSize: 34, marginTop: 10 }}>{c.repoName}</div>
          <div style={{ display: "flex", alignItems: "center", marginTop: 30 }}>
            <div style={{ display: "flex", padding: "8px 24px", borderRadius: 999, background: "#1f3a2a", color: "#7ee2a0", fontSize: 28 }}>{`Score ${c.score}/100`}</div>
            {c.builder ? (
              <div style={{ display: "flex", marginLeft: 16, padding: "8px 24px", borderRadius: 999, background: "#3a2f12", color: "#f2c94c", fontSize: 28 }}>Community Builder</div>
            ) : null}
          </div>
          <div style={{ display: "flex", fontSize: 22, color: muted, marginTop: 30 }}>{`${c.college ? c.college + " · " : ""}${c.date}`}</div>
        </div>
      </div>
    ),
    { width: 1200, height: 850, headers: { "Cache-Control": "public, max-age=300" } }
  );
}