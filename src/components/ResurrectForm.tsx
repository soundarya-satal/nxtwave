"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

const MAX = { demo_readme: 40, ai_component: 25, scope: 15, explanation: 20 } as const;
const LABEL = { demo_readme: "Working demo + README", ai_component: "AI component", scope: "Sensible scope", explanation: "Your explanation" } as const;
type K = keyof typeof MAX;
type R = {
  code: string; scored: boolean; passed: boolean; score: number; parts: Record<K, number>;
  summary: string; strengths: string[]; improvements: string[]; commit_note: string;
};
const input = "rounded-xl bg-neutral-900 border border-neutral-700 px-4 py-3 outline-none focus:border-emerald-400 w-full";

export default function ResurrectForm() {
  const [f, setF] = useState({ email: "", repo: "", explanation: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [res, setRes] = useState<R | null>(null);
  const [card, setCard] = useState("");
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));
  useEffect(() => { try { setCard(localStorage.getItem("tg_card") ?? ""); } catch { } }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(""); setRes(null);
    try {
      const r = await fetch("/api/resurrect", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Something went wrong.");
      setRes(j);
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Something went wrong.");
    }
    setBusy(false);
  }

  return (
    <div className="w-full max-w-md flex flex-col gap-5">
      <form onSubmit={submit} className="flex flex-col gap-4">
        <Link href={card ? `/card/${card}` : "/"} className="text-sm text-neutral-400 hover:text-neutral-100">
          ← {card ? "My tombstone" : "Home"}
        </Link>
        <h1 className="text-2xl font-bold">Resurrect it</h1>
        <p className="text-sm text-neutral-400">Submit what you built to get instant feedback and your Resurrection Certificate.</p>
        <input required type="email" className={input} placeholder="The email you held your seat with" value={f.email} maxLength={120} onChange={(e) => set("email", e.target.value)} />
        <input required className={input} placeholder="Public GitHub repo, https://github.com/you/project" value={f.repo} maxLength={200} onChange={(e) => set("repo", e.target.value)} />
        <textarea required rows={4} className={input} maxLength={600} value={f.explanation} onChange={(e) => set("explanation", e.target.value)}
          placeholder="Explain one choice you made, e.g. why this model or library, or how you shaped the prompt." />
        {err && <p className="text-sm text-red-400">{err}</p>}
        <button disabled={busy} className="rounded-full bg-emerald-400 text-neutral-950 font-semibold py-3 disabled:opacity-60">
          {busy ? "Reading your repo… (up to 30 seconds)" : "Submit for review"}
        </button>
        <p className="text-xs text-neutral-500">
          Your README, file list and explanation are sent to Google&apos;s Gemini for scoring. Your name, email and college are not.
          The reviewer can&apos;t run your code, so it judges what the repo shows.
        </p>
      </form>

      {res && (
        <div className={`rounded-2xl border p-5 flex flex-col gap-3 ${res.passed ? "border-emerald-700 bg-emerald-950/40" : "border-neutral-800 bg-neutral-900"}`}>
          <p className="text-lg font-bold">{res.passed ? `Resurrected! ${res.score}/100` : res.scored ? `${res.score}/100: not quite there yet` : "Almost ready"}</p>
          <p className="text-sm text-neutral-300">{res.summary}</p>
          {res.scored && (
            <div className="flex flex-col gap-2">
              {(Object.keys(MAX) as K[]).map((k) => (
                <div key={k}>
                  <div className="flex justify-between text-xs text-neutral-400"><span>{LABEL[k]}</span><span>{res.parts[k]}/{MAX[k]}</span></div>
                  <div className="h-2 rounded bg-neutral-800"><div className="h-2 rounded bg-emerald-400" style={{ width: `${(res.parts[k] / MAX[k]) * 100}%` }} /></div>
                </div>
              ))}
            </div>
          )}
          {res.strengths.length > 0 && <ul className="list-disc pl-5 text-sm text-neutral-300">{res.strengths.map((s) => <li key={s}>{s}</li>)}</ul>}
          {res.improvements.length > 0 && (
            <div className="text-sm"><p className="font-semibold mb-1">To improve</p>
              <ul className="list-disc pl-5 text-neutral-300">{res.improvements.map((s) => <li key={s}>{s}</li>)}</ul></div>
          )}
          {res.commit_note && <p className="text-xs text-neutral-500">Commit timing (a soft signal, not scored): {res.commit_note}</p>}
          {res.passed && (
            <Link href={`/certificate/${res.code}`} className="rounded-full bg-emerald-400 text-neutral-950 font-semibold py-3 text-center">Get my certificate</Link>
          )}
        </div>
      )}
    </div>
  );
}