"use client";
import { useState } from "react";

export default function HintBot() {
  const [text, setText] = useState("");
  const [minute, setMinute] = useState(30);
  const [hint, setHint] = useState("");
  const [busy, setBusy] = useState(false);

  async function ask() {
    setBusy(true); setHint("");
    try {
      const r = await fetch("/api/hint", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ stuck: text, minute }) });
      setHint((await r.json()).hint);
    } catch { setHint("Could not reach the hint bot. Try again."); }
    setBusy(false);
  }

  return (
    <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 flex flex-col gap-3">
      <h2 className="font-semibold">Stuck? Get a nudge</h2>
      <textarea rows={3} maxLength={300} value={text} onChange={(e) => setText(e.target.value)}
        placeholder="What did you try and what happened?"
        className="rounded-xl bg-neutral-950 border border-neutral-700 p-3 text-sm outline-none focus:border-emerald-400" />
      <div className="flex gap-2">
        <select value={minute} onChange={(e) => setMinute(Number(e.target.value))} className="rounded-xl bg-neutral-950 border border-neutral-700 px-3 text-sm">
          {[15, 30, 45, 60].map((m) => <option key={m} value={m}>Minute {m}</option>)}
        </select>
        <button onClick={ask} disabled={busy || text.trim().length < 5} className="flex-1 rounded-full bg-emerald-400 text-neutral-950 font-semibold py-2 disabled:opacity-50">
          {busy ? "Thinking…" : "Give me a nudge"}
        </button>
      </div>
      {hint && <p className="text-sm text-neutral-200 rounded-xl bg-neutral-950 p-3">{hint}</p>}
      <p className="text-xs text-neutral-500">Only the text above is sent to Google&apos;s Gemini. It nudges and never gives the full answer.</p>
    </section>
  );
}