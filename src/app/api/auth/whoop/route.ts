import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";

const SCOPES = "offline read:workout read:recovery read:sleep read:cycles read:profile read:body_measurement";

export function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get("secret") !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const state = randomBytes(16).toString("hex");
  const url = new URL("https://api.prod.whoop.com/oauth/oauth2/auth");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", process.env.WHOOP_CLIENT_ID!);
  url.searchParams.set("redirect_uri", process.env.WHOOP_REDIRECT_URI!);
  url.searchParams.set("scope", SCOPES);
  url.searchParams.set("state", state);

  const res = NextResponse.redirect(url);
  res.cookies.set("whoop_oauth_state", state, { httpOnly: true, secure: true, maxAge: 600 });
  return res;
}
