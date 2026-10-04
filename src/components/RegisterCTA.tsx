"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function RegisterCTA({ code }: { code: string }) {
  const [href, setHref] = useState(`/register?ref=${code}`);
  useEffect(() => {
    try {
      if (localStorage.getItem("tg_card") === code) setHref(`/register?card=${code}`);
      else { localStorage.setItem("tg_ref", code); setHref(`/register?ref=${code}`); }
    } catch {}
  }, [code]);
  return <Link href={href} className="rounded-full bg-emerald-400 text-neutral-950 font-semibold py-3">Hold my seat</Link>;
}