import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateLunarRitualMessage } from "@/lib/ai";
import { getCurrentLunarEvent } from "@/lib/astro-constants";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const lunarEvent = getCurrentLunarEvent();
  if (!lunarEvent) {
    return NextResponse.json({ active: false });
  }

  const profile = await db.profile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile?.onboardingComplete) {
    return NextResponse.json({ active: false });
  }

  // Check if user already completed this cycle's ritual
  const cycleDate = new Date(lunarEvent.date);
  const windowStart = new Date(cycleDate);
  windowStart.setDate(windowStart.getDate() - 2);
  const windowEnd = new Date(cycleDate);
  windowEnd.setDate(windowEnd.getDate() + 2);

  const existingRitual = await db.lunarRitual.findFirst({
    where: {
      userId: session.user.id,
      cycleDate: { gte: windowStart, lte: windowEnd },
      lunarPhase: lunarEvent.phase,
    },
  });

  if (existingRitual?.completed) {
    return NextResponse.json({
      active: true,
      completed: true,
      phase: lunarEvent.phase,
      sign: lunarEvent.sign,
      intention: existingRitual.intention,
      aiMessage: existingRitual.aiMessage,
    });
  }

  // Check if we already generated a message for this cycle (but not completed)
  if (existingRitual) {
    return NextResponse.json({
      active: true,
      completed: false,
      ritualId: existingRitual.id,
      phase: lunarEvent.phase,
      sign: lunarEvent.sign,
      aiMessage: existingRitual.aiMessage,
    });
  }

  // Generate new ritual message
  try {
    const aiMessage = await generateLunarRitualMessage(
      lunarEvent.phase,
      lunarEvent.sign,
      {
        sunSign: profile.sunSign || undefined,
        moonSign: profile.moonSign || undefined,
        risingSign: profile.risingSign || undefined,
        shadows: profile.shadows,
      }
    );

    const ritual = await db.lunarRitual.create({
      data: {
        userId: session.user.id,
        lunarPhase: lunarEvent.phase,
        lunarSign: lunarEvent.sign,
        aiMessage,
        cycleDate: cycleDate,
      },
    });

    return NextResponse.json({
      active: true,
      completed: false,
      ritualId: ritual.id,
      phase: lunarEvent.phase,
      sign: lunarEvent.sign,
      aiMessage,
    });
  } catch {
    return NextResponse.json({ active: false });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const { ritualId, intention } = await req.json();

  if (!ritualId || !intention?.trim()) {
    return NextResponse.json({ error: "Dati mancanti" }, { status: 400 });
  }

  // Verify the ritual belongs to this user before updating
  const existingRitual = await db.lunarRitual.findUnique({
    where: { id: ritualId },
  });

  if (!existingRitual || existingRitual.userId !== session.user.id) {
    return NextResponse.json({ error: "Ritual non trovato" }, { status: 404 });
  }

  // Update the ritual with the intention and mark as completed
  const ritual = await db.lunarRitual.update({
    where: { id: ritualId },
    data: {
      intention: intention.trim(),
      completed: true,
    },
  });

  // Also save to journal with tag
  const tag = ritual.lunarPhase === "new_moon" ? "#lunanuova" : "#lunapiena";
  await db.journal.create({
    data: {
      userId: session.user.id,
      content: intention.trim(),
      tags: [tag],
      cosmicContext: `${ritual.lunarPhase === "new_moon" ? "Luna Nuova" : "Luna Piena"} in ${ritual.lunarSign}`,
    },
  });

  return NextResponse.json({ completed: true });
}
