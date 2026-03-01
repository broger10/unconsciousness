import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateCosmicCheckinInsight } from "@/lib/ai";
import { useCredits } from "@/lib/credits";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const { mood, energy, cosmicEnergy, reflection } = await req.json();

  if (typeof mood !== "number" || mood < 1 || mood > 5 || !Number.isInteger(mood)) {
    return NextResponse.json({ error: "Mood non valido (1-5)" }, { status: 400 });
  }
  if (typeof energy !== "number" || energy < 1 || energy > 5 || !Number.isInteger(energy)) {
    return NextResponse.json({ error: "Energia non valida (1-5)" }, { status: 400 });
  }
  if (cosmicEnergy != null && (typeof cosmicEnergy !== "number" || cosmicEnergy < 1 || cosmicEnergy > 5)) {
    return NextResponse.json({ error: "Energia cosmica non valida (1-5)" }, { status: 400 });
  }
  if (reflection && (typeof reflection !== "string" || reflection.length > 2000)) {
    return NextResponse.json({ error: "Riflessione troppo lunga (max 2000)" }, { status: 400 });
  }

  const profile = await db.profile.findUnique({
    where: { userId: session.user.id },
  });

  const recentCheckins = await db.dailyCheckin.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 7,
  });

  let aiInsight: string | null = null;
  const hasCredits = await useCredits(session.user.id, "checkin_insight");
  if (profile && hasCredits) {
    aiInsight = await generateCosmicCheckinInsight(
      {
        sunSign: profile.sunSign || undefined,
        moonSign: profile.moonSign || undefined,
        risingSign: profile.risingSign || undefined,
      },
      { mood, energy, cosmicEnergy, reflection },
      recentCheckins
    );
  }

  await db.dailyCheckin.create({
    data: {
      userId: session.user.id,
      mood,
      energy,
      cosmicEnergy: cosmicEnergy || null,
      responses: reflection ? { reflection } : {},
      aiInsight,
    },
  });

  return NextResponse.json({ insight: aiInsight });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const checkins = await db.dailyCheckin.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  // Calculate streak — deduplicate by date to handle multiple check-ins per day
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const uniqueDays = [...new Set(
    checkins.map((c) => {
      const d = new Date(c.createdAt);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    })
  )].sort((a, b) => b - a);

  for (let i = 0; i < uniqueDays.length; i++) {
    const expectedDate = new Date(today);
    expectedDate.setDate(expectedDate.getDate() - i);

    if (uniqueDays[i] === expectedDate.getTime()) {
      streak++;
    } else {
      break;
    }
  }

  return NextResponse.json({ checkins, streak });
}
