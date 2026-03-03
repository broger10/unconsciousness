import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateFiloRitual } from "@/lib/ai";
import {
  getCurrentTransits,
  findSignificantTransits,
} from "@/lib/astro-constants";

function getToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

const MAX_DAILY_SESSIONS = 3;

// GET: check daily session count
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const today = getToday();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const count = await db.filoSession.count({
    where: {
      userId: session.user.id,
      createdAt: { gte: today, lt: tomorrow },
    },
  });

  return NextResponse.json({
    count,
    canStart: count < MAX_DAILY_SESSIONS,
  });
}

// POST: create ritual session
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const userId = session.user.id;
  const today = getToday();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Check daily limit
  const count = await db.filoSession.count({
    where: {
      userId,
      createdAt: { gte: today, lt: tomorrow },
    },
  });

  if (count >= MAX_DAILY_SESSIONS) {
    return NextResponse.json({
      limited: true,
      message: "Hai già attraversato molto oggi. Adesso resta con quello che hai trovato.",
    });
  }

  const body = await request.json();
  const emotion = (body.emotion || "").trim();
  if (!emotion || emotion.length > 500) {
    return NextResponse.json({ error: "Emozione non valida" }, { status: 400 });
  }

  // Fetch all context in parallel
  const [user, profile, dailyTransit, specchioCapitoli] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { name: true },
    }),
    db.profile.findUnique({
      where: { userId },
    }),
    db.dailyTransit.findUnique({
      where: { userId_date: { userId, date: today } },
      select: { transitData: true },
    }),
    db.specchioCapitolo.findMany({
      where: { userId, completedAt: { not: null } },
      select: { slug: true, ritrattoInsights: true, ritratto: true },
      orderBy: { completedAt: "desc" },
    }),
  ]);

  if (!profile) {
    return NextResponse.json({ error: "Profilo non trovato" }, { status: 400 });
  }

  // Build transit data — from DailyTransit if available, otherwise compute
  let transits: Array<{ transitPlanet: string; aspect: string; natalPlanet: string; description: string }> = [];

  if (dailyTransit) {
    const td = dailyTransit.transitData as {
      transits: Array<{ transitPlanet: string; aspect: string; natalPlanet: string; description: string }>;
    };
    transits = td.transits || [];
  } else {
    // Compute on the fly
    const natalPlanets = [
      { name: "Sole", sign: profile.sunSign || "Ariete" },
      { name: "Luna", sign: profile.moonSign || "Ariete" },
      { name: "Mercurio", sign: profile.mercurySign || "Ariete" },
      { name: "Venere", sign: profile.venusSign || "Ariete" },
      { name: "Marte", sign: profile.marsSign || "Ariete" },
      { name: "Giove", sign: profile.jupiterSign || "Ariete" },
      { name: "Saturno", sign: profile.saturnSign || "Ariete" },
    ].filter((p) => p.sign);
    const significant = findSignificantTransits(natalPlanets);
    transits = significant.map((t) => ({
      transitPlanet: t.transitPlanet,
      aspect: t.aspect,
      natalPlanet: t.natalPlanet,
      description: t.description,
    }));
  }

  // Gather Specchio insights
  const specchioInsights: string[] = [];
  for (const cap of specchioCapitoli) {
    if (cap.ritrattoInsights && cap.ritrattoInsights.length > 0) {
      specchioInsights.push(`[${cap.slug}] ${cap.ritrattoInsights.join("; ")}`);
    } else if (cap.ritratto) {
      specchioInsights.push(`[${cap.slug}] ${cap.ritratto.slice(0, 200)}`);
    }
  }

  // Determine if emotion is a preset or custom
  const presetEmotions = ["rabbia", "paura", "vergogna", "confusione", "dolore", "vuoto", "ansia", "solitudine"];
  const isPreset = presetEmotions.includes(emotion.toLowerCase());

  try {
    const result = await generateFiloRitual({
      emotion,
      profile: {
        sunSign: profile.sunSign || undefined,
        moonSign: profile.moonSign || undefined,
        risingSign: profile.risingSign || undefined,
        mercurySign: profile.mercurySign || undefined,
        venusSign: profile.venusSign || undefined,
        marsSign: profile.marsSign || undefined,
        shadows: profile.shadows,
        strengths: profile.strengths,
        blindSpots: profile.blindSpots,
      },
      transits,
      specchioInsights,
      userName: user?.name || undefined,
    });

    // Save session
    await db.filoSession.create({
      data: {
        userId,
        emotion: isPreset ? emotion.toLowerCase() : "custom",
        emotionRaw: isPreset ? null : emotion,
        branchText: result.branchText,
        trunkText: result.trunkText,
        rootText: result.rootText,
        transitUsed: JSON.parse(JSON.stringify(transits)),
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Filo ritual error:", error);
    return NextResponse.json({ error: "Errore nel rituale" }, { status: 500 });
  }
}
