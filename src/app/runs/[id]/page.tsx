import { notFound } from "next/navigation";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getAllContext, joinContext } from "@/lib/analytics";
import { EncounterCard } from "@/components/cards";

export const dynamic = "force-dynamic";

export default async function RunPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();

  const [run] = await db.select().from(schema.workouts).where(eq(schema.workouts.id, id));
  if (!run) notFound();

  const { recoveries, sleeps } = await getAllContext();
  const ctx = joinContext(run, recoveries, sleeps);

  return (
    <div className="flex flex-col gap-3 pop">
      <Link href="/" className="font-pixel text-[9px] hover:bg-ink hover:text-paper w-fit px-1">
        ◀ BACK
      </Link>
      <EncounterCard ctx={ctx} full />
    </div>
  );
}
