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
