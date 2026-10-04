export type Track = { variant: string; utm: string; ref: string; session: string };

export function getTrack(): Track {
  const get = (k: string) => { try { return localStorage.getItem(k) ?? ""; } catch { return ""; } };
  const put = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch {} };
  let variant = get("tg_variant");
  if (variant !== "relatable" && variant !== "humour") {
    variant = Math.random() < 0.5 ? "relatable" : "humour";
    put("tg_variant", variant);
  }
  const q = new URLSearchParams(location.search);
  const src = q.get("src"); if (src) put("tg_utm", src.slice(0, 40));
  const ref = q.get("ref"); if (ref) put("tg_ref", ref.slice(0, 12));
  let session = get("tg_sid");
  if (!session) { session = Math.random().toString(36).slice(2, 12); put("tg_sid", session); }
  return { variant, utm: get("tg_utm"), ref: get("tg_ref"), session };
}

export function track(type: string, t: Track) {
  fetch("/api/event", {
    method: "POST", headers: { "Content-Type": "application/json" }, keepalive: true,
    body: JSON.stringify({ type, variant: t.variant, utm: t.utm, session: t.session }),
  }).catch(() => {});
}