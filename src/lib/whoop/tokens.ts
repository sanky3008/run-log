import { sql } from "drizzle-orm";
import { db } from "../db";

const TOKEN_URL = "https://api.prod.whoop.com/oauth/oauth2/token";
// Whoop refresh tokens are single-use: refreshing invalidates the old pair,
// so the read-check-refresh-persist sequence must never run concurrently.
const REFRESH_MARGIN_MS = 5 * 60 * 1000;

let inProcessLock: Promise<string> | null = null;

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope?: string;
}

export async function exchangeCode(code: string): Promise<TokenResponse> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: process.env.WHOOP_CLIENT_ID!,
      client_secret: process.env.WHOOP_CLIENT_SECRET!,
      redirect_uri: process.env.WHOOP_REDIRECT_URI!,
    }),
  });
  if (!res.ok) throw new Error(`Token exchange failed: ${res.status} ${await res.text()}`);
  return res.json();
}

export async function saveTokens(tokens: TokenResponse, whoopUserId?: number) {
  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);
  await db.execute(sql`
    INSERT INTO oauth_tokens (id, whoop_user_id, access_token, refresh_token, expires_at, scope, updated_at)
    VALUES (1, ${whoopUserId ?? null}, ${tokens.access_token}, ${tokens.refresh_token}, ${expiresAt.toISOString()}, ${tokens.scope ?? null}, now())
    ON CONFLICT (id) DO UPDATE SET
      whoop_user_id = COALESCE(EXCLUDED.whoop_user_id, oauth_tokens.whoop_user_id),
      access_token = EXCLUDED.access_token,
      refresh_token = EXCLUDED.refresh_token,
      expires_at = EXCLUDED.expires_at,
      scope = COALESCE(EXCLUDED.scope, oauth_tokens.scope),
      updated_at = now()
  `);
}

export async function getValidAccessToken(): Promise<string> {
  if (inProcessLock) return inProcessLock;
  inProcessLock = refreshIfNeeded().finally(() => {
    inProcessLock = null;
  });
  return inProcessLock;
}

async function refreshIfNeeded(): Promise<string> {
  return db.transaction(async (tx) => {
    const rows = await tx.execute(sql`SELECT * FROM oauth_tokens WHERE id = 1 FOR UPDATE`);
    const row = rows.rows[0] as
      | { access_token: string; refresh_token: string; expires_at: Date }
      | undefined;
    if (!row) throw new Error("Not authorized with Whoop yet — visit /api/auth/whoop");

    if (new Date(row.expires_at).getTime() - Date.now() > REFRESH_MARGIN_MS) {
      return row.access_token;
    }

    const res = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: row.refresh_token,
        client_id: process.env.WHOOP_CLIENT_ID!,
        client_secret: process.env.WHOOP_CLIENT_SECRET!,
        scope: "offline",
      }),
    });
    if (!res.ok) {
      throw new Error(`Token refresh failed (${res.status}): ${await res.text()} — re-authorize via /api/auth/whoop`);
    }
    const tokens: TokenResponse = await res.json();
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);
    await tx.execute(sql`
      UPDATE oauth_tokens
      SET access_token = ${tokens.access_token},
          refresh_token = ${tokens.refresh_token},
          expires_at = ${expiresAt.toISOString()},
          updated_at = now()
      WHERE id = 1
    `);
    return tokens.access_token;
  });
}
