import { createHash } from "crypto";
import { cookies } from "next/headers";

export const adminToken = () =>
  createHash("sha256").update("tg-admin:" + (process.env.ADMIN_PASSWORD ?? "")).digest("hex");

export async function isAdmin() {
  if (!process.env.ADMIN_PASSWORD) return false;
  return (await cookies()).get("tg_admin")?.value === adminToken();
}