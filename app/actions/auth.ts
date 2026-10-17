"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { COOKIE_NAME, SESSION_MAX_AGE, createSessionToken, passwordMatches } from "@/lib/auth";

// Only allow redirecting to a page on THIS site (blocks "//evil.com" tricks).
function safeNext(value: string): string {
  return value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/\\") ? value : "/";
}

function backToLogin(error: string, next: string): never {
  const q = new URLSearchParams({ error });
  if (next !== "/") q.set("next", next);
  redirect(`/login?${q.toString()}`);
}

export async function login(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const next = safeNext(String(formData.get("next") ?? "/"));

  const expected = process.env.APP_PASSWORD;
  const secret = process.env.SESSION_SECRET;
  if (!expected || !secret) {
    backToLogin("Login isn't configured yet: APP_PASSWORD and SESSION_SECRET must be set.", next);
  }

  if (!(await passwordMatches(password, expected, secret))) {
    // A short pause makes guessing passwords in bulk much slower.
    await new Promise((resolve) => setTimeout(resolve, 800));
    backToLogin("Wrong password.", next);
  }

  cookies().set(COOKIE_NAME, await createSessionToken(secret), {
    httpOnly: true, // JavaScript in the page can't read this cookie
    secure: process.env.NODE_ENV === "production", // HTTPS only when live
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  redirect(next);
}

export async function logout() {
  cookies().delete(COOKIE_NAME);
  redirect("/login");
}
