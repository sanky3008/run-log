import { NextRequest, NextResponse } from "next/server";
import { exchangeCode, saveTokens } from "@/lib/whoop/tokens";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const expectedState = req.cookies.get("whoop_oauth_state")?.value;

  if (!code || !state || state !== expectedState) {
    return NextResponse.json({ error: "invalid oauth callback" }, { status: 400 });
  }

  const tokens = await exchangeCode(code);
  await saveTokens(tokens);

  const res = NextResponse.redirect(new URL("/?authorized=1", process.env.NEXT_PUBLIC_SITE_URL));
  res.cookies.delete("whoop_oauth_state");
  return res;
}
