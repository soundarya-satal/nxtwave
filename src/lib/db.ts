import { createClient } from "@supabase/supabase-js";

export const db = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!, {
  auth: { persistSession: false },
});

// Log a funnel event. Never lets a logging failure break the page.
export async function logEvent(e: { type: string; variant?: string; utm?: string; college?: string; session?: string }) {
  try {
    await db.from("events").insert(e);
  } catch {}
}