import { db } from "@/lib/db";
import { slotUsage } from "@/lib/slots";
import { UNLOCK_AT } from "@/lib/config";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin | Tutorial Graveyard", robots: { index: false, follow: false } };

type F = { k: string; visits: number; quizzes: number; epitaphs: number; registrations: number };
const num = (x: unknown) => Number(x ?? 0);
const pct = (a: number, b: number) => (b ? `${((a / b) * 100).toFixed(1)}%` : "–");
const box = "rounded-2xl border border-neutral-800 bg-neutral-900 p-5";
const th = "text-left font-medium text-neutral-400 py-2 pr-4";
const td = "py-2 pr-4";


function Funnel({ title, rows }: { title: string; rows: F[] }) {
  return (
    <section className={box}>
      <h2 className="font-semibold mb-3">{title}</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr>
            <th className={th}></th><th className={th}>Visits</th><th className={th}>Quizzes</th>
            <th className={th}>Epitaphs</th><th className={th}>Registered</th><th className={th}>Visit→Reg</th>
          </tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.k} className="border-t border-neutral-800">
                <td className={td}>{r.k}</td><td className={td}>{num(r.visits)}</td><td className={td}>{num(r.quizzes)}</td>
                <td className={td}>{num(r.epitaphs)}</td><td className={td}>{num(r.registrations)}</td>
                <td className={td}>{pct(num(r.registrations), num(r.visits))}</td>
              </tr>
            ))}
            {!rows.length && <tr><td className={td} colSpan={6}>No data yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default async function Admin() {

  const head = (t: string) => db.from(t).select("*", { count: "exact", head: true });
  const [v, s, c, ref, cards, ai, regs, viaRef, slots, subs] = await Promise.all([
    db.from("funnel_by_variant").select("*"),
    db.from("funnel_by_source").select("*"),
    db.from("college_stats").select("*"),
    db.from("top_referrers").select("*"),
    head("cards"),
    head("cards").eq("source", "ai"),
    head("registrations"),
    head("registrations").not("ref_code", "is", null),
    slotUsage(),
    db.from("submissions").select("card_code,passed").limit(5000),
  ]);

  const attempts = subs.data ?? [];
  const resurrected = new Set(attempts.filter((x) => x.passed).map((x) => x.card_code)).size;
  const byVisits = (a: F[]) => [...a].sort((x, y) => num(y.visits) - num(x.visits));
  const variants = byVisits((v.data ?? []) as F[]);
  const sources = byVisits((s.data ?? []) as F[]);
  const colleges = [...(c.data ?? [])].sort((a, b) => num(b.buried) - num(a.buried)).slice(0, 15);
  const refs = [...(ref.data ?? [])].sort((a, b) => num(b.pallbearers) - num(a.pallbearers));
  const unlocked = refs.filter((r) => num(r.pallbearers) >= UNLOCK_AT).length;

  const A = variants.find((x) => x.k === "relatable");
  const B = variants.find((x) => x.k === "humour");
  const rate = (x?: F) => (x ? num(x.registrations) / Math.max(1, num(x.visits)) : 0);
  const small = num(A?.visits) < 100 || num(B?.visits) < 100;
  const leader = !A || !B ? "" : rate(A) === rate(B) ? "Tied so far." : rate(A) > rate(B) ? "Relatability hook is ahead." : "Humour hook is ahead.";

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 px-5 py-8 flex justify-center">
      <div className="w-full max-w-4xl flex flex-col gap-5">
        <h1 className="text-2xl font-bold">Tutorial Graveyard: admin</h1>
        <a href="/build/host" className="text-sm text-emerald-300 underline">Open the host view (live stuck count)</a>

        <section className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            ["Buried (cards)", cards.count ?? 0],
            ["AI-written", `${ai.count ?? 0} of ${cards.count ?? 0}`],
            ["Pledged (registered)", regs.count ?? 0],
            ["Via a friend's link", viaRef.count ?? 0],
            ["Resurrected (passed)", `${resurrected} · ${attempts.length} attempts`],
          ].map(([l, x]) => (
            <div key={String(l)} className={box}><p className="text-xs text-neutral-400">{l}</p><p className="text-2xl font-bold">{x}</p></div>
          ))}
        </section>

        <section className={box}>
          <h2 className="font-semibold mb-3">A/B test: relatability vs humour hook</h2>
          <div className="grid grid-cols-2 gap-3">
            {[["Relatability", A], ["Humour", B]].map(([label, x]) => {
              const r = x as F | undefined;
              return (
                <div key={String(label)} className="rounded-xl border border-neutral-800 p-4">
                  <p className="font-medium">{String(label)}</p>
                  <p className="text-sm text-neutral-400">Visits: {num(r?.visits)}</p>
                  <p className="text-sm text-neutral-400">Visit→Quiz: {pct(num(r?.quizzes), num(r?.visits))}</p>
                  <p className="text-sm text-neutral-300">Visit→Registered: {pct(num(r?.registrations), num(r?.visits))}</p>
                </div>
              );
            })}
          </div>
          <p className="text-sm mt-3">{leader} {small && <span className="text-amber-400">Fewer than 100 visits per variant, so this is too early to call a winner.</span>}</p>
        </section>

        <Funnel title="Funnel by hook variant" rows={variants} />
        <Funnel title="Funnel by source (use ?src=name on every link you share)" rows={sources} />

        <section className={box}>
          <h2 className="font-semibold mb-3">By college</h2>
          <table className="w-full text-sm">
            <thead><tr><th className={th}>College</th><th className={th}>Buried</th><th className={th}>Pledged</th></tr></thead>
            <tbody>
              {colleges.map((r) => (
                <tr key={r.college} className="border-t border-neutral-800"><td className={td}>{r.college}</td><td className={td}>{num(r.buried)}</td><td className={td}>{num(r.pledged)}</td></tr>
              ))}
              {!colleges.length && <tr><td className={td} colSpan={3}>No data yet.</td></tr>}
            </tbody>
          </table>
        </section>

        <section className={box}>
          <h2 className="font-semibold mb-1">Referrals</h2>
          <p className="text-sm text-neutral-400 mb-3">
            {viaRef.count ?? 0} of {regs.count ?? 0} registrations came through a pallbearer link. {unlocked} card(s) reached {UNLOCK_AT} pallbearers.
          </p>
          <table className="w-full text-sm">
            <thead><tr><th className={th}>Card</th><th className={th}>College</th><th className={th}>Pallbearers</th></tr></thead>
            <tbody>
              {refs.slice(0, 10).map((r) => (
                <tr key={r.ref_code} className="border-t border-neutral-800"><td className={td}>{r.deceased}</td><td className={td}>{r.college ?? "–"}</td><td className={td}>{num(r.pallbearers)}</td></tr>
              ))}
              {!refs.length && <tr><td className={td} colSpan={3}>No referrals yet.</td></tr>}
            </tbody>
          </table>
        </section>

        <section className={box}>
          <h2 className="font-semibold mb-2">Seats</h2>
          {slots.map((x) => <p key={x.id} className="text-sm text-neutral-300">{x.label}: {x.taken} of {x.cap} held</p>)}
        </section>
      </div>
    </main>
  );
}