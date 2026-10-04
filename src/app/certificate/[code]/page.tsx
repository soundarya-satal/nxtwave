import Link from "next/link";
import { notFound } from "next/navigation";
import { loadCert } from "@/lib/cert";
import CertActions from "../../../components/CertActions";

export const dynamic = "force-dynamic";
type P = { params: Promise<{ code: string }> };

export async function generateMetadata({ params }: P) {
  const { code } = await params;
  const c = await loadCert(code);
  if (!c) return {};
  const title = `${c.name} resurrected "${c.deceased}"`;
  const description = "Built a real AI project. Bury yours, then build it.";
  return {
    title, description,
    openGraph: { title, description, images: [`/api/cert/${code}`] },
    twitter: { card: "summary_large_image", title, description, images: [`/api/cert/${code}`] },
  };
}

export default async function Certificate({ params }: P) {
  const { code } = await params;
  const c = await loadCert(code);
  if (!c) notFound();
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center px-5 py-8 gap-5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/api/cert/${code}`} alt="Resurrection Certificate" className="w-full max-w-2xl rounded-2xl border border-neutral-800" />
      <CertActions code={code} deceased={c.deceased} repo={c.repo} score={c.score} builder={c.builder} />
      <Link href={`/card/${code}`} className="text-sm text-neutral-400 underline">← Back to my tombstone</Link>
      <Link href="/" className="text-sm text-neutral-500 underline">Bury another tutorial</Link>
    </main>
  );
}