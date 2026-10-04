import ResurrectForm from "../../components/ResurrectForm";

export const metadata = { title: "Resurrect it | Tutorial Graveyard" };
export default function Resurrect() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex justify-center px-5 py-10">
      <ResurrectForm />
    </main>
  );
}