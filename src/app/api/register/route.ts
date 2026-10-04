import { db, logEvent } from "@/lib/db";
import { allow } from "@/lib/rateLimit";
import { normaliseCollege } from "@/lib/colleges";
import { SLOTS, WORKSHOP } from "@/lib/config";
import { slotUsage } from "@/lib/slots";

export async function POST(req: Request) {
  if (!(await allow(req, "register", 600, 8)))
    return Response.json({ error: "Too many attempts. Try again in a few minutes." }, { status: 429 });

  const b = await req.json().catch(() => ({}));
  const s = (v: unknown, n: number) => String(v ?? "").trim().slice(0, n);
  const name = s(b.name, 80);
  const email = s(b.email, 120).toLowerCase();
  let wa = s(b.whatsapp, 20).replace(/\D/g, "");
  if (wa.length === 12 && wa.startsWith("91")) wa = wa.slice(2);
  const college = normaliseCollege(s(b.college, 80));
  const promise = s(b.promise, 140);
  const slot = SLOTS.find((x) => x.id === b.slot);

  if (name.length < 2) return Response.json({ error: "Please enter your name." }, { status: 400 });
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return Response.json({ error: "Please enter a valid email." }, { status: 400 });
  if (!/^[6-9]\d{9}$/.test(wa)) return Response.json({ error: "Enter a 10-digit Indian WhatsApp number." }, { status: 400 });
  if (!college) return Response.json({ error: "Please enter your college." }, { status: 400 });
  if (!slot) return Response.json({ error: "Please pick a slot." }, { status: 400 });

  const usage = (await slotUsage()).find((u) => u.id === slot.id)!;
  if (usage.left <= 0) return Response.json({ error: `${slot.label} is full. Please pick the other slot.` }, { status: 409 });

  // Referral checks: codes must be real cards, and you can't refer yourself.
  const exists = async (c: string) =>
    c ? !!(await db.from("cards").select("code").eq("code", c).maybeSingle()).data : false;
  let card: string | null = s(b.card, 12);
  let ref: string | null = s(b.ref, 12);
  if (!(await exists(card))) card = null;
  if (!(await exists(ref))) ref = null;
  let selfReferral = false;
  if (ref && ref === card) { ref = null; selfReferral = true; }

  const { error } = await db.from("registrations").insert({
    card_code: card, ref_code: ref, name, email, whatsapp: wa, college,
    year_branch: s(b.year_branch, 60), promise, slot: slot.id, status: "held",
    variant: s(b.variant, 20) || null, utm: s(b.utm, 40) || null,
  });
  if (error) {
    if (error.code === "23505")
      return Response.json({ error: "This email or WhatsApp number is already registered." }, { status: 409 });
    return Response.json({ error: "Could not hold your seat. Please try again." }, { status: 500 });
  }

  // MOCKED messages: written to the database, never actually sent.
  const first = name.split(" ")[0];
  const confirm = `Hi ${first}, your seat for "${WORKSHOP}" on ${slot.label} is held. Reply YES to confirm.${promise ? ` You promised yourself: "${promise}"` : ""}`;
  const reminder = `Reminder (scheduled, not sent): ${first}, the workshop starts soon.${promise ? ` You said: "${promise}" Let's make it true.` : ""}`;
  await db.from("message_log").insert([
    { channel: "whatsapp-MOCK", to_contact: wa, body: confirm },
    { channel: "email-MOCK", to_contact: email, body: reminder },
  ]);
  await logEvent({ type: "register", variant: s(b.variant, 20), utm: s(b.utm, 40), college });

  return Response.json({ ok: true, slot: slot.label, message: confirm, selfReferral });
}