import BuildBoard from "../../components/BuildBoard";
import Checkpoints from "../../components/Checkpoints";
import HintBot from "../../components/HintBot";
import { getCounts } from "@/lib/stats";

export const dynamic = "force-dynamic";
export const metadata = { title: "Build | Tutorial Graveyard" };

export default async function Build() {
  const n = await getCounts();
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex justify-center px-5 py-8">
      <div className="w-full max-w-md flex flex-col gap-5">
        <h1 className="text-2xl font-bold">Live build room</h1>
        <p className="text-xs text-amber-400">DEMO: the board and feed use SAMPLE data. Checkpoint clicks and hints are real.</p>
        <Checkpoints />
        <HintBot />
        <BuildBoard realResurrected={n.resurrected} />
      </div>
    </main>
  );
}