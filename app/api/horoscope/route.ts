import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateDailyInsight } from "@/lib/ai";
import { useCredits } from "@/lib/credits";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const profile = await db.profile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile?.onboardingComplete) {
    return NextResponse.json({ horoscope: null, date: new Date().toISOString() });
  }

  // Check if we already generated today's horoscope (cached = free)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const existing = await db.insight.findFirst({
    where: {
      userId: session.user.id,
      type: "daily",
      createdAt: { gte: today, lt: tomorrow },
    },
  });

  if (existing) {
    return NextResponse.json({
      horoscope: existing.content,
      cosmicEnergy: existing.urgency || null, // Old insights have urgency=0 default, treat as no data
      date: existing.createdAt.toISOString(),
      cached: true,
    });
  }

  // Credits check — only for new generation (cached is free)
  const hasCredits = await useCredits(session.user.id, "daily_horoscope");
  if (!hasCredits) {
    return NextResponse.json({ horoscope: null, needsUpgrade: true, date: new Date().toISOString() });
  }

  // Parallelize context fetching
  const [recentCheckins, recentJournals] = await Promise.all([
    db.dailyCheckin.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.journal.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
  ]);

  try {
    const result = await generateDailyInsight(
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

    // Cache as daily insight — store cosmicEnergy in urgency field
    await db.insight.create({
      data: {
        userId: session.user.id,
        type: "daily",
        title: `Oroscopo ${today.toLocaleDateString("it-IT")}`,
        content: result.horoscope,
        urgency: result.cosmicEnergy,
        source: "natal",
      },
    });

    return NextResponse.json({
      horoscope: result.horoscope,
      cosmicEnergy: result.cosmicEnergy,
      date: new Date().toISOString(),
      cached: false,
    });
  } catch {
    return NextResponse.json({
      horoscope: null,
      date: new Date().toISOString(),
    });
  }
}
