import { db, logEvent } from "@/lib/db";
import { allow } from "@/lib/rateLimit";
import { askGemini } from "@/lib/gemini";
import { parseRepo, fetchRepo } from "@/lib/github";
import { RUBRIC_PROMPT, RUBRIC_SCHEMA, MAX, PASS_MARK, MIN_AI } from "@/lib/rubric";

export const maxDuration = 60;

const clamp = (v: unknown, max: number) => Math.max(0, Math.min(max, Math.round(Number(v) || 0)));
const strs = (v: unknown, n: number) => (Array.isArray(v) ? v : []).map((x) => String(x).slice(0, 220)).slice(0, n);
const zero = { demo_readme: 0, ai_component: 0, scope: 0, explanation: 0 };

export async function POST(req: Request) {
  const fail = (error: string, status: number) => Response.json({ error }, { status });
  if (!(await allow(req, "submit", 3600, 6))) return fail("Too many submissions. Try again in a while.", 429);

  const b = await req.json().catch(() => ({}));
  const email = String(b.email ?? "").trim().toLowerCase().slice(0, 120);
  const explanation = String(b.explanation ?? "").replace(/[<>]/g, "").trim().slice(0, 600);
  const target = parseRepo(String(b.repo ?? "").slice(0, 200));
  if (!target) return fail("Please paste a public github.com repo link, like https://github.com/you/project.", 400);
  if (explanation.length < 20) return fail("Please explain one choice you made in a sentence or two.", 400);

  // Only people who held a seat from their own tombstone can submit.
  const { data: reg } = await db.from("registrations").select("card_code,college").eq("email", email).maybeSingle();
  if (!reg) return fail("We couldn't find a held seat with that email. Hold your seat first.", 404);
  if (!reg.card_code) return fail("Your seat isn't linked to a tombstone yet. Bury a tutorial, then hold your seat from your card.", 400);
  const code = reg.card_code as string;
  const repoUrl = `https://github.com/${target.owner}/${target.repo}`.toLowerCase();
  const out = (o: object) => Response.json({ code, ...o });
  const save = (row: object) => db.from("submissions").insert({ card_code: code, repo_url: repoUrl, explanation, ...row });

  const { data: done } = await db.from("submissions").select("score").eq("card_code", code).eq("passed", true).limit(1).maybeSingle();
  if (done)
    return out({ scored: false, passed: true, score: done.score, parts: zero, summary: "You have already been resurrected. Your certificate is ready.", strengths: [], improvements: [], commit_note: "" });

  const since = new Date(Date.now() - 86400000).toISOString();
  const { count: tries } = await db.from("submissions").select("id", { count: "exact", head: true }).eq("card_code", code).gte("created_at", since);
  if ((tries ?? 0) >= 5) return fail("5 attempts a day is the limit. Improve the project and try again tomorrow.", 429);

  // Weak anti-copy check: one repo can only earn one certificate.
  const { data: used } = await db.from("submissions").select("card_code").eq("repo_url", repoUrl).eq("passed", true).neq("card_code", code).limit(1).maybeSingle();
  if (used) return fail("That repo has already been used for another certificate. Please submit your own project.", 409);

  const gh = await fetchRepo(target.owner, target.repo);
  if ("error" in gh) return fail(gh.error, 502);

  // Free pre-check: obviously empty repos get instant feedback without using Gemini quota.
  if (gh.readme.trim().length < 150 || gh.files.length < 3) {
    const fb = {
      scored: false, passed: false, score: 0, parts: zero, commit_note: "", strengths: [],
      summary: "This repo isn't ready to be scored yet, but it's close to being a project.",
      improvements: [
        ...(gh.readme.trim().length < 150 ? ["Add a README that says what it does and how to run it (a few lines is enough)."] : []),
        ...(gh.files.length < 3 ? ["Push your actual code files to the repo."] : []),
      ],
    };
    await save({ score: 0, passed: false, source: "precheck", feedback: fb });
    return out(fb);
  }

  const clean = (s: string) => s.replace(/<\/?(repo|explanation)>/gi, "");
  const user = `Today: ${new Date().toISOString().slice(0, 10)}
<repo>
name: ${gh.name}
description: ${clean(gh.description)}
homepage (claimed demo link, not checked): ${clean(gh.homepage) || "none"}
is_fork: ${gh.fork}
language: ${gh.language}
first_commit: ${gh.firstCommit} | last_commit: ${gh.lastCommit} | commits_seen (max 30): ${gh.commitsSeen}
files: ${gh.files.join(", ")}
${clean(gh.manifests)}
README:
${clean(gh.readme)}
</repo>
<explanation>
${clean(explanation)}
</explanation>`;

  let j;
  try { j = await askGemini(RUBRIC_PROMPT, user, RUBRIC_SCHEMA); }
  catch { return fail("The reviewer is busy right now. This attempt was not counted. Try again in a minute.", 503); }

  const parts = {
    demo_readme: clamp(j.demo_readme, MAX.demo_readme), ai_component: clamp(j.ai_component, MAX.ai_component),
    scope: clamp(j.scope, MAX.scope), explanation: clamp(j.explanation, MAX.explanation),
  };
  const score = parts.demo_readme + parts.ai_component + parts.scope + parts.explanation;
  const passed = score >= PASS_MARK && parts.ai_component >= MIN_AI;
  const fb = {
    scored: true, passed, score, parts,
    summary: String(j.summary ?? "").slice(0, 400), strengths: strs(j.strengths, 3),
    improvements: strs(j.improvements, 3), commit_note: String(j.commit_note ?? "").slice(0, 240),
  };
  await save({ score, passed, source: "ai", feedback: fb });
  await logEvent({ type: passed ? "resurrect" : "submit", college: reg.college ?? undefined });
  return out(fb);
}