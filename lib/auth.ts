// Tiny password-login helpers. Uses the Web Crypto API (crypto.subtle)
// instead of Node's "crypto" module because middleware runs on the "Edge"
// runtime, which only has Web APIs. The same code works in both places.

export const COOKIE_NAME = "embedvault_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days, in seconds

const enc = new TextEncoder();

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// HMAC = a "signature" only someone who knows the secret can produce.
async function hmac(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return toHex(await crypto.subtle.sign("HMAC", key, enc.encode(message)));
}

// Compares two strings in the same amount of time wherever they differ,
// so an attacker can't learn anything from how fast the answer comes back.
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// Signing both passwords first makes them the same length, so the
// comparison doesn't leak how long the real password is.
export async function passwordMatches(input: string, expected: string, secret: string): Promise<boolean> {
  const [a, b] = await Promise.all([hmac(secret, `pw.${input}`), hmac(secret, `pw.${expected}`)]);
  return constantTimeEqual(a, b);
}

// The cookie value is "<expiry time>.<signature of that time>".
// It can't be forged or extended without knowing SESSION_SECRET.
export async function createSessionToken(secret: string): Promise<string> {
  const expires = Date.now() + SESSION_MAX_AGE * 1000;
  return `${expires}.${await hmac(secret, `session.${expires}`)}`;
}

export async function verifySessionToken(token: string | undefined, secret: string | undefined): Promise<boolean> {
  if (!token || !secret) return false; // not configured = locked, never open
  const [expiresStr, signature] = token.split(".");
  const expires = Number(expiresStr);
  if (!signature || !Number.isFinite(expires) || expires < Date.now()) return false;
  return constantTimeEqual(signature, await hmac(secret, `session.${expires}`));
}
