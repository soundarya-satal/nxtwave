"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getTrack, track } from "@/lib/client";

const HOOK = `Send this to the friend who's been saying "we should build an AI project" since 2024.`;
const COPY: Record<string, { h: string; p: string }> = {
  relatable: {
    h: "Everyone has a tutorial they meant to finish.",
    p: "Final-year students aren't short on intentions. They're surrounded by unfinished ones. Give yours a proper burial, then build something real in 60 minutes.",
  },
  humour: {
    h: "That 58-hour course is dead. Let's hold the funeral.",
    p: "Bury your abandoned tutorial with a deadpan, AI-written tombstone. Then bring it back by building a real AI project in 60 minutes.",
  },
};

export default function Landing({ buried, pledged }: { buried: number; pledged: number }) {
  const [variant, setVariant] = useState("");

  useEffect(() => {
    const t = getTrack();
    setVariant(t.variant);
    try {
      if (!sessionStorage.getItem("tg_visit")) { sessionStorage.setItem("tg_visit", "1"); track("visit", t); }
    } catch { track("visit", t); }
  }, []);

  const forward = () => {
    const url = `${location.origin}/?src=wa-forward`;
    window.open(`https://wa.me/?text=${encodeURIComponent(`${HOOK} ${url}`)}`, "_blank");
  };
  const c = COPY[variant];

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center px-5 py-12 text-center">
      <div className="max-w-xl w-full flex flex-col items-center gap-6">
        <div className="text-5xl">🪦</div>
        <p className="text-xs tracking-[0.3em] text-neutral-500">TUTORIAL GRAVEYARD</p>
        <div className="min-h-[190px] flex flex-col gap-4">
          {c && (<>
            <h1 className="text-3xl sm:text-4xl font-bold leading-tight">{c.h}</h1>
            <p className="text-neutral-400">{c.p}</p>
          </>)}
        </div>
        <Link href="/bury" className="w-full sm:w-auto rounded-full bg-emerald-400 text-neutral-950 font-semibold px-8 py-4">
          Bury yours (60 seconds)
        </Link>
        <p className="text-sm text-neutral-500">{buried} buried so far · {pledged} pledged to resurrect</p>

        <div className="mt-6 w-full rounded-2xl border border-neutral-800 bg-neutral-900 p-5 flex flex-col gap-3">
          <p className="text-neutral-300 italic">{HOOK}</p>
          <button onClick={forward} className="rounded-full border border-emerald-400 text-emerald-300 py-3 font-medium">
            Forward to that friend on WhatsApp
          </button>
        </div>
        <p className="text-xs text-neutral-600">We only joke about the course. Never about you.</p>
      </div>
    </main>
  );
}