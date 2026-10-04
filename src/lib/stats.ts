import { db } from "./db";

// "X buried, Y pledged": college-level if we have it, otherwise everyone.
export async function getCounts(college?: string | null) {
  if (college) {
    const { data } = await db.from("college_stats").select("buried,pledged").eq("college", college).maybeSingle();
    if (data) return { label: college, buried: Number(data.buried), pledged: Number(data.pledged) };
  }
  const [c, r] = await Promise.all([
    db.from("cards").select("code", { count: "exact", head: true }),
    db.from("registrations").select("id", { count: "exact", head: true }),
  ]);
  return { label: "All colleges", buried: c.count ?? 0, pledged: r.count ?? 0 };
}