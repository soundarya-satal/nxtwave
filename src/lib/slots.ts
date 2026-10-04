import { db } from "./db";
import { SLOTS } from "./config";

export async function slotUsage() {
  return Promise.all(
    SLOTS.map(async (s) => {
      const { count } = await db.from("registrations").select("id", { count: "exact", head: true }).eq("slot", s.id);
      const taken = count ?? 0;
      return { ...s, taken, left: Math.max(0, s.cap - taken) };
    })
  );
}