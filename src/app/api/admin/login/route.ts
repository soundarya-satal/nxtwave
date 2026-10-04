import { NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "crypto";
import { adminToken } from "@/lib/adminAuth";
import { allow } from "@/lib/rateLimit";

const h = (s: string) => createHash("sha256").update(s).digest();

export async function POST(req: Request) {
  const back = (q = "") => NextResponse.redirect(new URL("/admin" + q, req.url), 303);
  if (!(await allow(req, "adminlogin", 900, 10))) return back("?e=wait");

  const form = await req.formData().catch(() => null);
  const pw = String(form?.get("password") ?? "");
  const real = process.env.ADMIN_PASSWORD ?? "";
  if (!real || !timingSafeEqual(h(pw), h(real))) return back("?e=1");

  const res = back();
  res.cookies.set("tg_admin", adminToken(), {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 8, path: "/",
  });
  return res;
}