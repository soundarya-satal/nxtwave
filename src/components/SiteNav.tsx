"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function SiteNav() {
  const [card, setCard] = useState("");
  useEffect(() => { try { setCard(localStorage.getItem("tg_card") ?? ""); } catch { } }, []);
  const link = "text-sm text-neutral-400 hover:text-neutral-100";

  return (
    <nav className="w-full border-b border-neutral-900 bg-neutral-950/90">
      <div className="mx-auto max-w-4xl flex items-center justify-between px-5 py-3">
        <Link href="/" className="font-semibold text-neutral-100">
          <span className="hidden sm:inline">🪦 Tutorial Graveyard</span>
          <span className="sm:hidden">🪦</span>
        </Link>
        <div className="flex items-center gap-4">
          {card ? <Link href={`/card/${card}`} className={link}>My tombstone</Link>
            : <Link href="/bury" className="text-sm rounded-full bg-emerald-400 text-neutral-950 font-semibold px-3 py-1">Bury yours</Link>}
          <Link href="/build" className={link}>Build</Link>
          <Link href="/resurrect" className={link}>Resurrect</Link>
        </div>
      </div>
    </nav>
  );
}