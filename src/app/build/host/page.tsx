import HostStuck from "@/components/HostStuck";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default function Host() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex justify-center px-5 py-8">
      <HostStuck />
    </main>
  );
}