import { createHash } from "crypto";
import { db } from "./db";

export function ipHash(req: Request): string {
  const ip = (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  return createHash("sha256").update(ip + (process.env.ADMIN_PASSWORD ?? "salt")).digest("hex").slice(0, 24);
}

// true = allowed. Fails open if the database is down, so users aren't blocked by our own error.
export async function allow(req: Request, bucket: string, windowSecs: number, limit: number): Promise<boolean> {
  const { data, error } = await db.rpc("hit_rate", {
    p_key: `${bucket}:${ipHash(req)}`, p_window_secs: windowSecs, p_limit: limit,
  });
  return error ? true : data === true;
}