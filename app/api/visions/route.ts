import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateVisions } from "@/lib/ai";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const { topic } = await req.json();

  if (!topic || typeof topic !== "string") {
    return NextResponse.json({ error: "Topic richiesto" }, { status: 400 });
  }

  const profile = await db.profile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) {
    return NextResponse.json(
      { error: "Completa prima l'onboarding" },
      { status: 400 }
    );
  }

  const result = await generateVisions(topic, {
    values: profile.values,
    blindSpots: profile.blindSpots,
    strengths: profile.strengths,
    personalitySummary: profile.personalitySummary,
  });

  const sessionId = randomUUID();

  const visions = await Promise.all(
    result.visions.map(
      (
        v: {
          title: string;
          emoji: string;
          narrative: string;
          milestones: string[];
          reasoning: string;
        },
        i: number
      ) =>
        db.vision.create({
          data: {
            userId: session.user!.id!,
            topic,
            versionNumber: i + 1,
            title: v.title,
            emoji: v.emoji || "✨",
            narrative: v.narrative,
            milestones: v.milestones,
            reasoning: v.reasoning,
            sessionId,
          },
        })
    )
  );

  return NextResponse.json({ visions, sessionId });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const visions = await db.vision.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  // Group by sessionId
  const grouped: Record<string, typeof visions> = {};
  for (const v of visions) {
    if (!grouped[v.sessionId]) grouped[v.sessionId] = [];
    grouped[v.sessionId].push(v);
  }

  return NextResponse.json({ sessions: grouped });
}
