import Link from "next/link";

export const metadata = { title: "Reviewer guide | Tutorial Graveyard" };

const box = "rounded-2xl border border-neutral-800 bg-neutral-900 p-5 flex flex-col gap-2";
const a = "text-emerald-300 underline";

export default function Guide() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex justify-center px-5 py-10">
      <div className="w-full max-w-xl flex flex-col gap-5">
        <h1 className="text-2xl font-bold">Reviewer guide: a 3-minute tour</h1>
        <p className="text-neutral-400">
          Tutorial Graveyard is the campaign for NxtWave&apos;s free workshop, &quot;Build Your First AI Project in 60 Minutes&quot;.
          Students bury an unfinished course as an AI tombstone, then resurrect it by building. Follow the steps in order.
        </p>

        <section className={box}>
          <h2 className="font-semibold">Student journey</h2>
          <ol className="list-decimal pl-5 text-sm text-neutral-300 flex flex-col gap-1">
            <li><Link className={a} href="/bury">Bury a tutorial</Link>: answer 5 questions and get an AI-written tombstone.</li>
            <li>On your card: download or share the image, and see the college counter.</li>
            <li>Click <b>Hold my seat</b> on your card and register (the WhatsApp confirmation is mocked).</li>
            <li>Open your card link in a private window and register there: you appear as a pallbearer, and 3 unlock the idea pack.</li>
            <li><Link className={a} href="/build">Build room</Link>: checkpoints and the hint bot (the board is sample data).</li>
            <li><Link className={a} href="/resurrect">Resurrect</Link>: submit a public GitHub repo to get a score and certificate.</li>
          </ol>
        </section>

        <section className={box}>
          <h2 className="font-semibold">Host and admin views</h2>
          <p className="text-sm text-neutral-300">
            <Link className={a} href="/admin">/admin</Link> shows the funnel, the A/B test, colleges and referrals.{" "}
            <Link className={a} href="/build/host">/build/host</Link> shows the live stuck count (log in at /admin first).
            The demo password is in the submission form.
          </p>
        </section>

        <section className={box}>
          <h2 className="font-semibold">What is real and what is not</h2>
          <ul className="list-disc pl-5 text-sm text-neutral-300 flex flex-col gap-1">
            <li><b>Real:</b> quiz, epitaphs, cards, registration, seat cap, pallbearers, repo scoring, certificate, checkpoints, hint bot.</li>
            <li><b>Mocked:</b> WhatsApp and email messages are only logged, never sent.</li>
            <li><b>Sample data:</b> the Resurrection Board and feed, and the demo numbers on /admin.</li>
          </ul>
        </section>

        <Link href="/" className="text-sm text-neutral-500 underline">Back to the app</Link>
      </div>
    </main>
  );
}