import { db } from "./db";

// "X buried, Y pledged, Z resurrected": college-level if we have it, otherwise everyone.
export async function getCounts(college?: string | null) {
  if (college) {
    const { data } = await db.from("college_stats").select("buried,pledged,resurrected").eq("college", college).maybeSingle();
    if (data) return { label: college, buried: Number(data.buried), pledged: Number(data.pledged), resurrected: Number(data.resurrected ?? 0) };
  }
  const [c, r, s] = await Promise.all([
    db.from("cards").select("code", { count: "exact", head: true }),
    db.from("registrations").select("id", { count: "exact", head: true }),
    db.from("submissions").select("card_code").eq("passed", true).limit(5000),
  ]);
  return {
    label: "All colleges", buried: c.count ?? 0, pledged: r.count ?? 0,
    resurrected: new Set((s.data ?? []).map((x) => x.card_code)).size,
  };
}