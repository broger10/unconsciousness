import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const [profile, user, subscription, checkinCount, journalCount] = await Promise.all([
    db.profile.findUnique({ where: { userId: session.user.id } }),
    db.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true, image: true, credits: true },
    }),
    db.subscription.findUnique({
      where: { userId: session.user.id },
      select: { status: true },
    }),
    db.dailyCheckin.count({ where: { userId: session.user.id } }),
    db.journal.count({ where: { userId: session.user.id } }),
  ]);

  return NextResponse.json({
    profile,
    user,
    isPremium: subscription?.status === "active",
    stats: { checkins: checkinCount, journals: journalCount },
  });
}
