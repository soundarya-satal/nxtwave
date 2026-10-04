"use client";
import { useEffect, useState } from "react";

type D = { count: number; need: number; names: string[]; unlocked: boolean; pack: string[] | null };

export default function Pallbearers({ code }: { code: string }) {
  const [d, setD] = useState<D | null>(null);

  useEffect(() => {
    const load = () => fetch(`/api/pallbearers?code=${code}`).then((r) => r.json()).then(setD).catch(() => {});
    load();
    const id = setInterval(load, 15000); // refresh every 15 seconds
    return () => clearInterval(id);
  }, [code]);

  if (!d) return null;
  return (
    <div className="max-w-sm w-full rounded-2xl border border-neutral-800 bg-neutral-900 p-5 flex flex-col gap-3">
      <p className="font-semibold">Pallbearers: {Math.min(d.count, d.need)} of {d.need}</p>
      <div className="flex gap-2">
        {Array.from({ length: d.need }).map((_, i) => (
          <div key={i} className={`h-2 flex-1 rounded ${i < d.count ? "bg-emerald-400" : "bg-neutral-700"}`} />
        ))}
      </div>
      <p className="text-sm text-neutral-400">
        {d.count ? `Carrying this one: ${d.names.join(", ")}` : "No pallbearers yet. Friends who hold a seat through your link will appear here."}
      </p>
      {d.unlocked && d.pack ? (
        <div className="text-sm text-neutral-200">
          <p className="inline-block rounded-full bg-emerald-900 text-emerald-300 px-3 py-1 text-xs mb-2">Community Builder badge unlocked</p>
          <p className="font-semibold mb-1">Your project-idea pack</p>
          <ul className="list-disc pl-5 text-neutral-300">{d.pack.map((x) => <li key={x}>{x}</li>)}</ul>
        </div>
      ) : (
        <p className="text-xs text-neutral-500">Bring {d.need} pallbearers to unlock the project-idea pack and a Community Builder badge on your certificate.</p>
      )}
    </div>
  );
}