"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { COLLEGES } from "@/lib/colleges";
import { getTrack, type Track } from "@/lib/client";

type Slot = { id: string; label: string; left: number };
const input = "rounded-xl bg-neutral-900 border border-neutral-700 px-4 py-3 outline-none focus:border-emerald-400 w-full";

export default function RegisterForm({ slots }: { slots: Slot[] }) {
  const [f, setF] = useState({ name: "", email: "", whatsapp: "", college: "", year_branch: "", promise: "", slot: "" });
  const [ids, setIds] = useState({ card: "", ref: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState<{ slot: string; message: string } | null>(null);
  const tr = useRef<Track | null>(null);
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    const t = getTrack();
    tr.current = t;
    const q = new URLSearchParams(location.search);
    let own = ""; try { own = localStorage.getItem("tg_card") ?? ""; } catch {}
    setIds({ card: q.get("card") || own, ref: q.get("ref") || t.ref });
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr("");
    const t = tr.current ?? getTrack();
    try {
      const r = await fetch("/api/register", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...f, ...ids, variant: t.variant, utm: t.utm }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Something went wrong.");
      setDone({ slot: j.slot, message: j.message });
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Something went wrong.");
    }
    setBusy(false);
  }

  if (done)
    return (
      <div className="w-full max-w-md flex flex-col gap-5 text-center">
        <div className="text-5xl">🪦➡️🌱</div>
        <h1 className="text-2xl font-bold">Your seat is held.</h1>
        <p className="text-neutral-300">{done.slot}. Reply YES on WhatsApp to confirm it.</p>
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 text-left text-sm text-neutral-300">
          <p className="text-xs text-amber-400 mb-2">DEMO: this WhatsApp message is mocked and was not actually sent.</p>
          {done.message}
        </div>
        {ids.card ? (
          <Link href={`/card/${ids.card}`} className="rounded-full bg-emerald-400 text-neutral-950 font-semibold py-3">
            Back to my tombstone: bring 3 pallbearers
          </Link>
        ) : (
          <Link href="/bury" className="rounded-full bg-emerald-400 text-neutral-950 font-semibold py-3">
            Bury your tutorial and get your pallbearer link
          </Link>
        )}
      </div>
    );

  return (
    <form onSubmit={submit} className="w-full max-w-md flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Hold your seat</h1>
      <p className="text-sm text-neutral-400">Free workshop: Build Your First AI Project in 60 Minutes.</p>
      <input required className={input} placeholder="Full name" value={f.name} maxLength={80} onChange={(e) => set("name", e.target.value)} />
      <input required type="email" className={input} placeholder="Email" value={f.email} maxLength={120} onChange={(e) => set("email", e.target.value)} />
      <input required inputMode="numeric" className={input} placeholder="WhatsApp number (10 digits)" value={f.whatsapp} maxLength={16} onChange={(e) => set("whatsapp", e.target.value)} />
      <input required list="colleges" className={input} placeholder="College" value={f.college} maxLength={80} onChange={(e) => set("college", e.target.value)} />
      <datalist id="colleges">{COLLEGES.map((c) => <option key={c} value={c} />)}</datalist>
      <input className={input} placeholder="Year and branch, e.g. 4th year CSE" value={f.year_branch} maxLength={60} onChange={(e) => set("year_branch", e.target.value)} />
      <div>
        <input className={input} placeholder="One line you promise yourself, e.g. I will ship one AI project" value={f.promise} maxLength={140} onChange={(e) => set("promise", e.target.value)} />
        <p className="text-xs text-neutral-500 mt-1">We will quote this back in your reminder.</p>
      </div>
      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm text-neutral-300 mb-1">Pick your slot</legend>
        {slots.map((s) => (
          <label key={s.id} className={`flex items-center justify-between rounded-xl border px-4 py-3 ${f.slot === s.id ? "border-emerald-400 bg-emerald-950" : "border-neutral-700 bg-neutral-900"} ${s.left <= 0 ? "opacity-40" : ""}`}>
            <span><input type="radio" name="slot" className="mr-3" disabled={s.left <= 0} checked={f.slot === s.id} onChange={() => set("slot", s.id)} />{s.label}</span>
            <span className="text-xs text-neutral-400">{s.left <= 0 ? "Full" : `${s.left} seats left`}</span>
          </label>
        ))}
      </fieldset>
      {err && <p className="text-sm text-red-400">{err}</p>}
      <button disabled={busy || !f.slot} className="rounded-full bg-emerald-400 text-neutral-950 font-semibold py-3 disabled:opacity-50">
        {busy ? "Holding your seat…" : "Hold my seat"}
      </button>
      <p className="text-xs text-neutral-500">
        Your seat is held until you confirm on WhatsApp. We use your details only for this workshop. If you came through a friend&apos;s
        link, your first name appears on their tombstone as a pallbearer. Your name, email, college and phone are never sent to the AI.
      </p>
    </form>
  );
}