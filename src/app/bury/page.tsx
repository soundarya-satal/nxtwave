import Link from "next/link";
import Quiz from "../../components/Quiz";

export const metadata = { title: "Bury it | Tutorial Graveyard" };
export default function Bury() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex justify-center px-5 py-10">
      <div className="w-full max-w-md flex flex-col gap-6">
        <Link href="/" className="text-sm text-neutral-400 hover:text-neutral-100">← Home</Link>
        <Quiz />
      </div>
    </main>
  );
}
