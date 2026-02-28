import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateDailyInsight } from "@/lib/ai";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const { mood, energy, responses } = await req.json();

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
    aiInsight = await generateDailyInsight(
      {
        values: profile.values,
        blindSpots: profile.blindSpots,
        personalitySummary: profile.personalitySummary,
      },
      recentCheckins
    );
  }

  const checkin = await db.dailyCheckin.create({
    data: {
      userId: session.user.id,
      mood,
      energy,
      responses: responses || {},
      aiInsight,
    },
  });

  return NextResponse.json({ checkin });
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

  return NextResponse.json({ checkins });
}
