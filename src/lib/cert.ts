import { db } from "./db";
import { UNLOCK_AT } from "./config";

export async function loadCert(code: string) {
  const { data: sub } = await db.from("submissions").select("repo_url,score,created_at")
    .eq("card_code", code).eq("passed", true).order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (!sub) return null;
  const [{ data: c }, { data: reg }, { count }] = await Promise.all([
    db.from("cards").select("epitaph,college").eq("code", code).maybeSingle(),
    db.from("registrations").select("name,college").eq("card_code", code).maybeSingle(),
    db.from("registrations").select("id", { count: "exact", head: true }).eq("ref_code", code),
  ]);
  return {
    code,
    name: String(reg?.name ?? "A Builder"),
    college: String(reg?.college || c?.college || ""),
    deceased: String(c?.epitaph?.deceased ?? "an unfinished tutorial"),
    repo: String(sub.repo_url),
    repoName: String(sub.repo_url).split("/").slice(-2).join("/"),
    score: Number(sub.score),
    date: new Date(sub.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
    builder: (count ?? 0) >= UNLOCK_AT,
  };
}