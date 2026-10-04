"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { COLLEGES } from "@/lib/colleges";
import { WHY_OPTIONS } from "@/lib/diagnosis";
import { getTrack, track, type Track } from "@/lib/client";

type Q = { key: "what" | "progress" | "when"; q: string; ph: string; chips?: string[] };
const QS: Q[] = [
  { key: "what", q: "What did you start and not finish?", ph: "e.g. Python for Everybody on Coursera",
    chips: ["Python course", "DSA sheet", "Portfolio website", "Machine learning course"] },
  { key: "progress", q: "How far did it get?", ph: "e.g. Week 3 of 9, 41 of 455 problems, 6 commits" },
  { key: "when", q: "When did it go quiet?", ph: "e.g. July 2024" },
];

export default function Quiz() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [a, setA] = useState({ what: "", progress: "", when: "", why: "", college: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const tr = useRef<Track | null>(null);
  useEffect(() => { tr.current = getTrack(); }, []);
  const set = (k: string, v: string) => setA((p) => ({ ...p, [k]: v }));

  async function submit() {
    setBusy(true); setErr("");
    const t = tr.current ?? getTrack();
    track("quiz", t);
    try {
      const r = await fetch("/api/epitaph", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...a, variant: t.variant, utm: t.utm }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Something went wrong.");
      try { localStorage.setItem("tg_card", j.code); } catch {}
      router.push(`/card/${j.code}`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong."); setBusy(false);
    }
  }

  const q = QS[step];
  const canNext = step < 3 ? a[q.key].trim().length > 0 : a.why !== "";
  const next = () => canNext && setStep(step + 1);

  return (
    <div className="w-full max-w-md flex flex-col gap-6">
      <div className="flex gap-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded ${i <= step ? "bg-emerald-400" : "bg-neutral-800"}`} />
        ))}
      </div>

      {step < 3 && (<>
        <h1 className="text-2xl font-bold">{q.q}</h1>
        <input autoFocus value={a[q.key]} placeholder={q.ph} maxLength={120}
          onChange={(e) => set(q.key, e.target.value)} onKeyDown={(e) => e.key === "Enter" && next()}
          className="rounded-xl bg-neutral-900 border border-neutral-700 px-4 py-3 outline-none focus:border-emerald-400" />
        {q.chips && (
          <div className="flex flex-wrap gap-2">
            {q.chips.map((c) => (
              <button key={c} onClick={() => set(q.key, c)} className="rounded-full border border-neutral-700 px-3 py-1 text-sm text-neutral-300">{c}</button>
            ))}
          </div>
        )}
      </>)}

      {step === 3 && (<>
        <h1 className="text-2xl font-bold">What got in the way?</h1>
        <div className="flex flex-col gap-2">
          {WHY_OPTIONS.map((o) => (
            <button key={o} onClick={() => set("why", o)}
              className={`text-left rounded-xl border px-4 py-3 ${a.why === o ? "border-emerald-400 bg-emerald-950" : "border-neutral-700 bg-neutral-900"}`}>{o}</button>
          ))}
        </div>
      </>)}

      {step === 4 && (<>
        <h1 className="text-2xl font-bold">Which college is this buried under?</h1>
        <input list="colleges" value={a.college} placeholder="Start typing, or enter your own" maxLength={80}
          onChange={(e) => set("college", e.target.value)}
          className="rounded-xl bg-neutral-900 border border-neutral-700 px-4 py-3 outline-none focus:border-emerald-400" />
        <datalist id="colleges">{COLLEGES.map((c) => <option key={c} value={c} />)}</datalist>
        <p className="text-xs text-neutral-500">
          Optional. It adds your college to the &quot;buried / pledged&quot; counter. The text you typed about the unfinished thing is sent to
          Google&apos;s Gemini to write the epitaph. We never send your name, email, college or phone.
        </p>
      </>)}

      {err && <p className="text-sm text-red-400">{err}</p>}
      <div className="flex gap-3">
        {step > 0 && !busy && <button onClick={() => setStep(step - 1)} className="rounded-full border border-neutral-700 px-5 py-3">Back</button>}
        {step < 4 ? (
          <button onClick={next} disabled={!canNext} className="flex-1 rounded-full bg-emerald-400 text-neutral-950 font-semibold py-3 disabled:opacity-40">Next</button>
        ) : (
          <button onClick={submit} disabled={busy} className="flex-1 rounded-full bg-emerald-400 text-neutral-950 font-semibold py-3 disabled:opacity-60">
            {busy ? "Digging the grave…" : "Hold the funeral"}
          </button>
        )}
      </div>
    </div>
  );
}