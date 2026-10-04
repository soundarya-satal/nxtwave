import Link from "next/link";

export default function SiteNav() {
  const link = "text-sm text-neutral-400 hover:text-neutral-100";
  return (
    <nav className="w-full border-b border-neutral-900 bg-neutral-950/90">
      <div className="mx-auto max-w-4xl flex items-center justify-between px-5 py-3">
        <Link href="/" className="font-semibold text-neutral-100">🪦 Tutorial Graveyard</Link>
        <div className="flex gap-4">
          <Link href="/bury" className={link}>Bury</Link>
          <Link href="/register" className={link}>Hold a seat</Link>
          <Link href="/build" className={link}>Build</Link>
          <Link href="/resurrect" className={link}>Resurrect</Link>
        </div>
      </div>
    </nav>
  );
}