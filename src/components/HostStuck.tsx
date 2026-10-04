"use client";
import { useEffect, useState } from "react";

type D = { rows: { minute: number; on_track: number; stuck: number; done: number }[]; stuckNow: number };

export default function HostStuck() {
  const [d, setD] = useState<D | null>(null);
  useEffect(() => {
    const load = () => fetch("/api/checkpoint").then((r) => r.json()).then(setD).catch(() => {});
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, []);
  if (!d?.rows) return <p>Loading…</p>;
  return (
    <div className="w-full max-w-md flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Host: who is stuck</h1>
      <div className="rounded-2xl border border-amber-700 bg-amber-950/40 p-5">
        <p className="text-xs text-amber-300">Stuck right now (all checkpoints)</p>
        <p className="text-4xl font-bold">{d.stuckNow}</p>
      </div>
      <table className="text-sm w-full">
        <thead><tr className="text-left text-neutral-400"><th className="py-2">Minute</th><th>On track</th><th>Stuck</th><th>Done</th></tr></thead>
        <tbody>{d.rows.map((r) => (
          <tr key={r.minute} className="border-t border-neutral-800"><td className="py-2">{r.minute}</td><td>{r.on_track}</td><td>{r.stuck}</td><td>{r.done}</td></tr>
        ))}</tbody>
      </table>
      <p className="text-xs text-neutral-500">Refreshes every 5 seconds.</p>
    </div>
  );
}