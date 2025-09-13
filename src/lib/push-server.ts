import webpush from "web-push";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";

// Configure VAPID only when all env vars are present. If missing, leave webpush unconfigured
// so that importing this module doesn't throw during build/deploy.
const vapidSubject = process.env.VAPID_SUBJECT;
const vapidPublic = process.env.VAPID_PUBLIC_KEY;
const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
if (vapidSubject && vapidPublic && vapidPrivate) {
  try {
    webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate);
  } catch (e) {
    // swallow errors during setup to avoid breaking build/runtime in environments without keys
    console.warn("web-push VAPID setup failed:", e);
  }
} else {
  // Optionally log in dev only
  if (process.env.NODE_ENV !== "production") {
    console.warn("VAPID keys not set; push notifications disabled.");
  }
}

export async function sendToAll(payload: { title: string; body: string; url?: string }) {
  if (!vapidSubject || !vapidPublic || !vapidPrivate) {
    // VAPID not configured — noop
    return;
  }
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