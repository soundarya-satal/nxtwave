"use client";
import { useEffect, useState } from "react";
import { getTrack } from "@/lib/client";
import { MINUTES } from "@/lib/sample";

const OPTS = [["on_track", "On track"], ["stuck", "Stuck"], ["done", "Done"]] as const;

export default function Checkpoints() {
  const [sid, setSid] = useState("");
  const [sel, setSel] = useState<Record<number, string>>({});
  useEffect(() => { setSid(getTrack().session); }, []);

  async function pick(minute: number, status: string) {
    setSel((s) => ({ ...s, [minute]: status }));
    fetch("/api/checkpoint", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session: sid, minute, status }),
    }).catch(() => {});
  }

  return (
    <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 flex flex-col gap-3">
      <h2 className="font-semibold">Checkpoints</h2>
      {MINUTES.map((m) => (
        <div key={m} className="flex items-center gap-2">
          <span className="w-14 text-sm text-neutral-400">{m} min</span>
          {OPTS.map(([k, l]) => (
            <button key={k} onClick={() => pick(m, k)}
              className={`flex-1 rounded-full border px-2 py-2 text-xs ${sel[m] === k ? (k === "stuck" ? "border-amber-400 bg-amber-950" : "border-emerald-400 bg-emerald-950") : "border-neutral-700"}`}>
              {l}
            </button>
          ))}
        </div>
      ))}
    </section>
  );
}