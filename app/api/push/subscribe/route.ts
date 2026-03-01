import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const { subscription } = await req.json();

  if (!subscription?.endpoint) {
    return NextResponse.json({ error: "Subscription non valida" }, { status: 400 });
  }

  // Upsert — if the user already has a subscription, update it
  const existing = await db.pushSubscription.findFirst({
    where: { userId: session.user.id },
  });

  if (existing) {
    await db.pushSubscription.update({
      where: { id: existing.id },
      data: { subscription, active: true },
    });
  } else {
    await db.pushSubscription.create({
      data: {
        userId: session.user.id,
        subscription,
        active: true,
      },
    });
  }

  return NextResponse.json({ subscribed: true });
}

// GET: return VAPID public key
export async function GET() {
  return NextResponse.json({
    vapidPublicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "",
  });
}
