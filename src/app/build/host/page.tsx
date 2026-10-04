import { isAdmin } from "@/lib/adminAuth";
import { redirect } from "next/navigation";
import HostStuck from "@/components/HostStuck";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function Host() {
  if (!(await isAdmin())) redirect("/admin");
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex justify-center px-5 py-8">
      <HostStuck />
    </main>
  );
}