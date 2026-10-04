import RegisterForm from "../../components/RegisterForm";
import { slotUsage } from "@/lib/slots";

export const dynamic = "force-dynamic";
export const metadata = { title: "Hold my seat | Tutorial Graveyard" };

export default async function Register() {
  const slots = (await slotUsage()).map(({ id, label, left }) => ({ id, label, left }));
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex justify-center px-5 py-10">
      <RegisterForm slots={slots} />
    </main>
  );
}