import Link from "next/link";
import { isAdmin } from "@/lib/adminAuth";
import { redirect } from "next/navigation";
import HostStuck from "@/components/HostStuck";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function Host() {
  if (!(await isAdmin())) redirect("/admin");
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex justify-center px-5 py-8">
      <div className="w-full max-w-md flex flex-col gap-5">
        <Link href="/admin" className="text-sm text-neutral-400 hover:text-neutral-100">← Back to admin</Link>
        <HostStuck />
      </div>
    </main>
  );
}
