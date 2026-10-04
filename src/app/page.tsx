import Landing from "../components/Landing";
import { getCounts } from "@/lib/stats";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tutorial Graveyard: Bury it. Build it." };

export default async function Home() {
  const n = await getCounts();
  return <Landing buried={n.buried} pledged={n.pledged} />;
}