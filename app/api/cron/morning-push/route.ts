import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateMorningPushMessage } from "@/lib/ai";
import webpush from "web-push";

// Configure web-push with VAPID keys
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    "mailto:info@unconsciousness.vercel.app",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export async function GET(req: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    return NextResponse.json({ error: "VAPID keys non configurate" }, { status: 500 });
  }

  // Get all active push subscriptions with their user profiles
  const subscriptions = await db.pushSubscription.findMany({
    where: { active: true },
    include: {
      user: {
        include: { profile: true },
      },
    },
  });

  let sent = 0;
  let failed = 0;

  for (const sub of subscriptions) {
    const profile = sub.user.profile;
    if (!profile?.onboardingComplete) continue;

    try {
      // Generate personalized message with Haiku
      const body = await generateMorningPushMessage({
        sunSign: profile.sunSign || undefined,
        moonSign: profile.moonSign || undefined,
        risingSign: profile.risingSign || undefined,
      });

      const payload = JSON.stringify({
        title: "✦ Il tuo cielo oggi",
        body,
        url: "/oggi",
      });

      await webpush.sendNotification(
        sub.subscription as unknown as webpush.PushSubscription,
        payload
      );
      sent++;
    } catch (error) {
      failed++;
      // If subscription is expired/invalid, deactivate it
      if (error instanceof webpush.WebPushError && error.statusCode === 410) {
        await db.pushSubscription.update({
          where: { id: sub.id },
          data: { active: false },
        });
      }
    }
  }

  return NextResponse.json({
    message: `Push notifications sent: ${sent}, failed: ${failed}`,
    sent,
    failed,
    total: subscriptions.length,
  });
}
