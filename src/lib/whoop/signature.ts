import { createHmac, timingSafeEqual } from "crypto";

export function verifyWhoopSignature(rawBody: string, signature: string | null, timestamp: string | null): boolean {
  if (!signature || !timestamp) return false;
  const expected = createHmac("sha256", process.env.WHOOP_CLIENT_SECRET!)
    .update(timestamp + rawBody)
    .digest("base64");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}
