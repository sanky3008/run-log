/* Hand-signs a synthetic Whoop v2 webhook and POSTs it, since the dashboard
   has no documented test-fire button.

   Usage: WHOOP_CLIENT_SECRET=... npx tsx scripts/fake-webhook.ts [url] [--tamper]
*/
import { createHmac, randomUUID } from "crypto";

const url = process.argv[2] ?? "http://localhost:3000/api/webhooks/whoop";
const tamper = process.argv.includes("--tamper");
const secret = process.env.WHOOP_CLIENT_SECRET;
if (!secret) {
  console.error("Set WHOOP_CLIENT_SECRET");
  process.exit(1);
}

const body = JSON.stringify({
  user_id: 37102838,
  id: process.env.WORKOUT_ID ?? randomUUID(),
  type: "workout.updated",
  trace_id: randomUUID(),
});
const timestamp = String(Date.now());
const signature = createHmac("sha256", tamper ? secret + "x" : secret)
  .update(timestamp + body)
  .digest("base64");

async function main() {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-WHOOP-Signature": signature,
      "X-WHOOP-Signature-Timestamp": timestamp,
    },
    body,
  });
  console.log(res.status, await res.text());
}
main();
