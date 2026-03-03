import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateMirrorQuestion } from "@/lib/ai";
import { getCurrentTransits } from "@/lib/astro-constants";

function getToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

const SLOW_PLANETS = ["Giove", "Saturno", "Urano", "Nettuno", "Plutone"];

// POST: generate first question of the day (Agent 1: Il Generatore)
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const userId = session.user.id;
  const today = getToday();

  // Check if session already exists
  const existing = await db.mirrorSession.findUnique({
    where: { userId_date: { userId, date: today } },
    include: { answers: true },
  });

  if (existing && existing.answers.length > 0) {
    return NextResponse.json(
      { error: "Sessione già generata per oggi" },
      { status: 409 }
    );
  }

  // Fetch context in parallel
  const [user, profile, previousAnswers] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { name: true },
    }),
    db.profile.findUnique({
      where: { userId },
    }),
    db.mirrorAnswer.findMany({
      where: { session: { userId } },
      orderBy: { createdAt: "desc" },
      take: 30,
      select: {
        question: true,
        answerChosen: true,
        answerFree: true,
        depth: true,
        createdAt: true,
      },
    }),
  ]);

  if (!profile) {
    return NextResponse.json(
      { error: "Profilo non trovato" },
      { status: 400 }
    );
  }

  // Get slow transits
  const currentTransits = getCurrentTransits(today);
  const slowTransits = currentTransits
    .filter((t) => SLOW_PLANETS.includes(t.planet))
    .map((t) => ({ planet: t.planet, sign: t.sign }));

  try {
    const result = await generateMirrorQuestion({
      profile: {
        sunSign: profile.sunSign || undefined,
        moonSign: profile.moonSign || undefined,
        risingSign: profile.risingSign || undefined,
        mercurySign: profile.mercurySign || undefined,
        venusSign: profile.venusSign || undefined,
        marsSign: profile.marsSign || undefined,
        jupiterSign: profile.jupiterSign || undefined,
        saturnSign: profile.saturnSign || undefined,
        shadows: profile.shadows,
        strengths: profile.strengths,
        blindSpots: profile.blindSpots,
      },
      slowTransits,
      previousAnswers: previousAnswers.map((a) => ({
        date: a.createdAt.toISOString().split("T")[0],
        depth: a.depth,
        question: a.question,
        answerChosen: a.answerChosen,
        answerFree: a.answerFree,
      })),
      userName: user?.name || undefined,
    });

    // Create session + first answer (unanswered)
    let mirrorSession = existing;

    if (!mirrorSession) {
      mirrorSession = await db.mirrorSession.create({
        data: {
          userId,
          date: today,
          status: "IN_PROGRESS",
          depth: 1,
        },
        include: { answers: true },
      });
    }

    const answer = await db.mirrorAnswer.create({
      data: {
        sessionId: mirrorSession.id,
        depth: 1,
        question: result.question,
        options: JSON.parse(JSON.stringify(result.options)),
        astroContext: result.astrologicalContext,
      },
    });

    return NextResponse.json({
      question: result.question,
      options: result.options,
      sessionId: mirrorSession.id,
      answerId: answer.id,
    });
  } catch (error) {
    console.error("Mirror generate error:", error);
    return NextResponse.json(
      { error: "Errore nella generazione" },
      { status: 500 }
    );
  }
}
