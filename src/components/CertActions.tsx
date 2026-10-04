"use client";
import { useEffect, useState } from "react";

type P = { code: string; deceased: string; repo: string; score: number; builder: boolean };

export default function CertActions({ code, deceased, repo, score, builder }: P) {
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);
  useEffect(() => { setOrigin(location.origin); }, []);

  const post = `I buried "${deceased}" in the Tutorial Graveyard. Then I brought it back.

I built and shipped an AI project: ${repo}
It scored ${score}/100 on an automated review of the working demo and README, the AI component, the scope, and my own explanation of a design choice.${builder ? "\n\nI also earned the Community Builder badge by bringing 3 friends along." : ""}

Everyone has a tutorial they meant to finish. This time I finished one.

Bury yours: ${origin}/?src=linkedin
#BuildInPublic #AI #NxtWave`;

  const copy = async () => {
    try { await navigator.clipboard.writeText(post); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
  };
  const btn = "rounded-full border border-neutral-700 px-4 py-3 text-sm text-center";

  return (
    <div className="w-full max-w-2xl flex flex-col gap-3">
      <p className="font-semibold">Your LinkedIn post (edit it before you share)</p>
      <textarea readOnly value={post} rows={10} className="rounded-xl bg-neutral-900 border border-neutral-700 p-4 text-sm text-neutral-200" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button onClick={copy} className={`${btn} bg-emerald-400 text-neutral-950 font-semibold border-emerald-400`}>{copied ? "Copied" : "Copy post"}</button>
        <a target="_blank" rel="noreferrer" className={btn}
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${origin}/certificate/${code}`)}`}>Open LinkedIn</a>
        <a href={`/api/cert/${code}`} download={`certificate-${code}.png`} className={btn}>Download certificate</a>
      </div>
      <p className="text-xs text-neutral-500">LinkedIn no longer pre-fills text from a link, so copy the post first, then paste it there.</p>
    </div>
  );
}