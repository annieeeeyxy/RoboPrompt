export const AUTH_COOKIE_NAME = "roboprompt_session";

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Session cookie value derived from the shared password — never store the raw password in a cookie. */
export async function computeSessionToken(password: string): Promise<string> {
  return sha256Hex(`roboprompt-session:${password}`);
}

/**
 * Constant-time string comparison. `middleware.ts` runs on the Edge runtime,
 * where `node:crypto`'s `timingSafeEqual` isn't available, so this is plain
 * JS rather than a Node built-in — used for both the cookie check (the
 * session token IS the secret, so a timing leak there is a password-free
 * bypass) and the password check in `/api/auth`.
 */
export function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}
