import { NextRequest, NextResponse } from "next/server";
import { syncRange } from "@/lib/ingest";

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  if (req.nextUrl.searchParams.get("secret") !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const start = req.nextUrl.searchParams.get("start") ?? "2020-01-01T00:00:00.000Z";
  const end = req.nextUrl.searchParams.get("end") ?? undefined;
  const counts = await syncRange(start, end);
  return NextResponse.json({ status: "ok", counts });
}
