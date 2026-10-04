"use client";
import { useEffect, useState } from "react";
import { SAMPLE_BOARD } from "@/lib/sample";

const short = (c: string) => c.split(" ")[0];

export default function BuildBoard({ realResurrected }: { realResurrected: number }) {
  const [board, setBoard] = useState(SAMPLE_BOARD);
  const [feed, setFeed] = useState<string[]>([]);

  useEffect(() => {
    const names = Object.keys(SAMPLE_BOARD);
    const id = setInterval(() => {
      const c = names[Math.floor(Math.random() * names.length)];
      setBoard((b) => ({ ...b, [c]: b[c] + 1 }));
      setFeed((f) => [`${short(c)} just resurrected a builder`, ...f].slice(0, 6));
    }, 3500);
    return () => clearInterval(id);
  }, []);

  const rows = Object.entries(board).sort((a, b) => b[1] - a[1]);
  return (
    <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold">Resurrection Board</h2>
        <span className="text-xs rounded-full bg-amber-950 text-amber-400 px-2 py-1">SAMPLE DATA</span>
      </div>
      <ol className="flex flex-col gap-1 text-sm">
        {rows.map(([c, n], i) => (
          <li key={c} className="flex justify-between border-t border-neutral-800 py-2">
            <span>{i + 1}. {c}</span><span className="text-emerald-300">{n}</span>
          </li>
        ))}
      </ol>
      <div className="text-sm text-neutral-400 min-h-[110px]">
        {feed.length ? feed.map((f, i) => <p key={f + i}>• {f}</p>) : <p>Waiting for the first resurrection…</p>}
      </div>
      <p className="text-xs text-neutral-500">Real resurrected builders so far: {realResurrected}</p>
    </section>
  );
}