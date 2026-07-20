import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, computeSessionToken, timingSafeEqualStr } from "@/lib/auth";
import { BASE_PATH, withoutBasePath } from "@/lib/basePath";

export async function proxy(req: NextRequest) {
  const sitePassword = process.env.SITE_PASSWORD;

  // No password configured: fail closed in production (nothing should be
  // reachable until it's set), fail open in local dev so testing isn't
  // blocked before the env var is set up.
  if (!sitePassword) {
    if (process.env.NODE_ENV !== "production") return NextResponse.next();
    return blockedResponse(req);
  }

  const cookie = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  const expected = await computeSessionToken(sitePassword);

  if (cookie && timingSafeEqualStr(cookie, expected)) {
    return NextResponse.next();
  }

  return blockedResponse(req);
}

function blockedResponse(req: NextRequest) {
  const appPathname = withoutBasePath(req.nextUrl.pathname);
  if (appPathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const loginUrl = new URL(`${BASE_PATH}/login`, req.url);
  loginUrl.searchParams.set("redirect", appPathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/try/:path*",
    "/agent/:path*",
    "/api/classify/:path*",
    "/api/chat/:path*",
    "/api/generate/:path*",
    "/api/agent/:path*",
  ],
};
