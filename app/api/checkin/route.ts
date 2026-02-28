import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateCosmicCheckinInsight } from "@/lib/ai";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const { mood, energy, cosmicEnergy, reflection } = await req.json();

  const profile = await db.profile.findUnique({
    where: { userId: session.user.id },
  });

  const recentCheckins = await db.dailyCheckin.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 7,
  });

  let aiInsight: string | null = null;
  if (profile) {
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

  // Calculate streak
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < checkins.length; i++) {
    const checkinDate = new Date(checkins[i].createdAt);
    checkinDate.setHours(0, 0, 0, 0);
    const expectedDate = new Date(today);
    expectedDate.setDate(expectedDate.getDate() - i);

    if (checkinDate.getTime() === expectedDate.getTime()) {
      streak++;
    } else {
      break;
    }
  }

  return NextResponse.json({ checkins, streak });
}
