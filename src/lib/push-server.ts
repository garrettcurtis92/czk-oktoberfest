import webpush from "web-push";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

export async function sendToAll(payload: { title: string; body: string; url?: string }) {
  const subs = await db.select().from(subscriptions);
  await Promise.all(subs.map(async (s) => {
    try {
      const subscription = { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } };
      // web-push types expect a PushSubscription-like shape; assert via unknown to avoid explicit `any`
      await webpush.sendNotification(subscription as unknown as webpush.PushSubscription, JSON.stringify(payload), { timeout: 5000 });
    } catch (err: unknown) {
      const statusCode = (err as { statusCode?: number })?.statusCode;
      if (statusCode === 404 || statusCode === 410) {
        await db.delete(subscriptions).where(eq(subscriptions.endpoint, s.endpoint));
      }
    }
  }));
}