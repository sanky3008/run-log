import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { verifyWhoopSignature } from "@/lib/whoop/signature";
import { handleWebhookEvent } from "@/lib/ingest";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const ok = verifyWhoopSignature(
    rawBody,
    req.headers.get("x-whoop-signature"),
    req.headers.get("x-whoop-signature-timestamp"),
  );
  if (!ok) return NextResponse.json({ error: "bad signature" }, { status: 401 });

  const event = JSON.parse(rawBody) as { user_id: number; id: string | number; type: string; trace_id: string };

  const inserted = await db
    .insert(schema.webhookEvents)
    .values({ traceId: event.trace_id, type: event.type, resourceId: String(event.id) })
    .onConflictDoNothing()
    .returning({ traceId: schema.webhookEvents.traceId });
  if (inserted.length === 0) {
    return NextResponse.json({ status: "duplicate" }); // already processed this trace_id
  }

  try {
    const handled = await handleWebhookEvent(event.type, String(event.id));
    await db
      .insert(schema.webhookEvents)
      .values({ traceId: event.trace_id, type: event.type, resourceId: String(event.id), status: handled ? "processed" : "ignored" })
      .onConflictDoUpdate({
        target: schema.webhookEvents.traceId,
        set: { status: handled ? "processed" : "ignored" },
      });
    return NextResponse.json({ status: handled ? "processed" : "ignored" });
  } catch (err) {
    console.error("webhook processing failed", event, err);
    // Drop the dedupe row so Whoop's retry (5x over ~1h) gets reprocessed
    await db.delete(schema.webhookEvents).where(eq(schema.webhookEvents.traceId, event.trace_id));
    return NextResponse.json({ error: "processing failed" }, { status: 500 });
  }
}
