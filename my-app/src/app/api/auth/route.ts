import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { AUTH_COOKIE_NAME, computeSessionToken, timingSafeEqualStr } from "@/lib/auth";

export const runtime = "nodejs";

const RequestSchema = z.object({ password: z.string().min(1) });

export async function POST(req: NextRequest) {
  let body: z.infer<typeof RequestSchema>;
  try {
    body = RequestSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const sitePassword = process.env.SITE_PASSWORD;
  if (!sitePassword) {
    return NextResponse.json({ error: "Site password is not configured" }, { status: 500 });
  }

  if (!timingSafeEqualStr(body.password, sitePassword)) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  const token = await computeSessionToken(body.password);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  return res;
}
