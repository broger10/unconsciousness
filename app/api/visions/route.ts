import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateVisions } from "@/lib/ai";
import { useCredits } from "@/lib/credits";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const { topic } = await req.json();

  if (!topic || typeof topic !== "string" || !topic.trim()) {
    return NextResponse.json({ error: "Topic richiesto" }, { status: 400 });
  }
  if (topic.length > 2000) {
    return NextResponse.json({ error: "Topic troppo lungo (max 2000 caratteri)" }, { status: 400 });
  }

  const hasCredits = await useCredits(session.user.id, "visions");
  if (!hasCredits) {
    return NextResponse.json({ error: "Crediti esauriti", needsUpgrade: true }, { status: 402 });
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
    sunSign: profile.sunSign || undefined,
    moonSign: profile.moonSign || undefined,
    risingSign: profile.risingSign || undefined,
    northNodeSign: profile.northNodeSign || undefined,
    values: profile.values,
    blindSpots: profile.blindSpots,
    strengths: profile.strengths,
    shadows: profile.shadows,
    personalitySummary: profile.personalitySummary,
  });

  const sessionId = randomUUID();

  const visions = await Promise.all(
    result.visions.map(
      (
        v: {
          title: string;
          emoji: string;
          archetype: string;
          narrative: string;
          milestones: string[];
          reasoning: string;
          cosmicAlignment?: string;
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
            cosmicReason: v.cosmicAlignment || null,
            sessionId,
          },
        })
    )
  );

  return NextResponse.json({ visions: result.visions, sessionId });
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

  const grouped: Record<string, typeof visions> = {};
  for (const v of visions) {
    if (!grouped[v.sessionId]) grouped[v.sessionId] = [];
    grouped[v.sessionId].push(v);
  }

  return NextResponse.json({ sessions: grouped });
}
