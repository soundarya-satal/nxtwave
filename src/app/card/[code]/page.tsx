import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCounts } from "@/lib/stats";
import { DIAG_LINE } from "@/lib/diagnosis";
import ShareButtons from "../../../components/ShareButtons";
import RegisterCTA from "@/components/RegisterCTA";
import Pallbearers from "@/components/Pallbearers";
import CardBottomLinks from "@/components/CardBottomLinks";

export const dynamic = "force-dynamic";
type P = { params: Promise<{ code: string }> };

const load = async (code: string) =>
  (await db.from("cards").select("code,what,college,diagnosis,epitaph").eq("code", code).maybeSingle()).data;

export async function generateMetadata({ params }: P) {
  const { code } = await params;
  const c = await load(code);
  if (!c) return {};
  const title = `Here lies ${c.epitaph.deceased}`;
  const description = "Bury your unfinished tutorial. Then build it in 60 minutes.";
  return {
    title, description,
    openGraph: { title, description, images: [`/api/card/${code}`] },
    twitter: { card: "summary_large_image", title, description, images: [`/api/card/${code}`] },
  };
}

export default async function CardPage({ params }: P) {
  const { code } = await params;
  const c = await load(code);
  if (!c) notFound();
  const n = await getCounts(c.college);

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center px-5 py-8 gap-5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/api/card/${code}`} alt={`Tombstone for ${c.epitaph.deceased}`} className="w-full max-w-sm rounded-2xl border border-neutral-800" />
      <div className="max-w-sm w-full text-center flex flex-col gap-2">
        <p className="font-semibold">{c.diagnosis}</p>
        <p className="text-sm text-neutral-400">{DIAG_LINE[c.diagnosis]}</p>
        <p className="text-sm text-neutral-500">{n.label}: {n.buried} buried · {n.pledged} pledged · {n.resurrected} resurrected</p>
      </div>
      <ShareButtons code={code} what={c.what} />
      <div className="max-w-sm w-full rounded-2xl border border-emerald-900 bg-emerald-950/40 p-5 text-center flex flex-col gap-3">
        <p className="font-semibold">Now resurrect it.</p>
        <p className="text-sm text-neutral-300">Free workshop: Build Your First AI Project in 60 Minutes.</p>
        <RegisterCTA code={code} />
      </div>
      <Pallbearers code={code} />
      <CardBottomLinks code={code} />
    </main>
  );
}