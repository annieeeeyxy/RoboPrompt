/**
 * Accept only internal absolute paths for post-login redirects.
 * Reject protocol URLs, protocol-relative URLs, backslashes, and control chars.
 */
export function normalizeInternalRedirect(
  redirect: string | null | undefined,
  fallback = "/try"
): string {
  if (!redirect) return fallback;
  if (!redirect.startsWith("/")) return fallback;
  if (redirect.startsWith("//")) return fallback;
  if (redirect.includes("\\")) return fallback;
  if (/\r|\n/.test(redirect)) return fallback;
  return redirect;
}