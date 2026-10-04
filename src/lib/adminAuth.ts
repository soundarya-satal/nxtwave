import { createHash } from "crypto";
import { cookies } from "next/headers";

export const adminToken = () =>
  createHash("sha256").update("tg-admin:" + (process.env.ADMIN_PASSWORD ?? "")).digest("hex");

export async function isAdmin() {
  // If no password is configured, allow open access (e.g. for reviewers).
  // Set ADMIN_PASSWORD in Vercel env vars to require a password.
  if (!process.env.ADMIN_PASSWORD) return true;
  return (await cookies()).get("tg_admin")?.value === adminToken();
}