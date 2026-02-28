import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateDailyInsight } from "@/lib/ai";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const profile = await db.profile.findUnique({
    where: { userId: session.user.id },
  });

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, image: true },
  });

  // Generate daily insight if profile exists
  let dailyInsight = "";
  if (profile?.onboardingComplete) {
    const recentCheckins = await db.dailyCheckin.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    const recentJournals = await db.journal.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 3,
    });

    try {
      dailyInsight = await generateDailyInsight(
        {
          sunSign: profile.sunSign || undefined,
          moonSign: profile.moonSign || undefined,
          risingSign: profile.risingSign || undefined,
          values: profile.values,
          blindSpots: profile.blindSpots,
          shadows: profile.shadows,
          personalitySummary: profile.personalitySummary,
        },
        recentCheckins,
        recentJournals
      );
    } catch {
      dailyInsight = "";
    }
  }

  return NextResponse.json({ profile, user, dailyInsight });
}
