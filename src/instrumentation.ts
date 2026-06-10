export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (!process.env.DATABASE_URL) return;

  const cron = (await import("node-cron")).default;
  const { syncRange } = await import("./lib/ingest");

  // Heal missed webhooks + keep the refresh token warm
  cron.schedule("0 */6 * * *", async () => {
    const start = new Date(Date.now() - 7 * 86_400_000).toISOString();
    try {
      const counts = await syncRange(start);
      console.log("[cron] 7-day re-sync ok", counts);
    } catch (err) {
      console.error("[cron] re-sync failed", err);
    }
  });
}
