"use client";
import { useState } from "react";

export default function ShareButtons({ code, what }: { code: string; what: string }) {
  const [copied, setCopied] = useState(false);
  const url = () => `${location.origin}/card/${code}`;
  const text = `I just buried "${what}". Send this to the friend who's been saying "we should build an AI project" since 2024.`;

  const whatsapp = () => window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${url()}`)}`, "_blank");
  const share = async () => {
    if (!navigator.share) return whatsapp();
    try { await navigator.share({ title: "Tutorial Graveyard", text, url: url() }); } catch {}
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(url()); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
  };
  const btn = "rounded-full border border-neutral-700 px-4 py-3 text-sm text-center";

  return (
    <div className="max-w-sm w-full grid grid-cols-2 gap-3">
      <button onClick={whatsapp} className={`${btn} bg-emerald-400 text-neutral-950 font-semibold border-emerald-400`}>Share on WhatsApp</button>
      <button onClick={share} className={btn}>More share options</button>
      <a href={`/api/card/${code}`} download={`tombstone-${code}.png`} className={btn}>Download image</a>
      <button onClick={copy} className={btn}>{copied ? "Link copied" : "Copy link"}</button>
    </div>
  );
}