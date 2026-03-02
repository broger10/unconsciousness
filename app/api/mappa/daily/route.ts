import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateStarInsight, generateConstellationInsight } from "@/lib/ai";
import { findSignificantTransits, getCurrentLunarEvent } from "@/lib/astro-constants";

function getToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function generateStarPosition(date: Date, userId: string): { x: number; y: number } {
  const day = date.getDate();
  const month = date.getMonth();
  const seed = day * 31 + month * 367 + userId.charCodeAt(0) * 7;
  return {
    x: 15 + seededRandom(seed) * 70,       // 15-85% horizontal
    y: 10 + seededRandom(seed + 1) * 70,   // 10-80% vertical
  };
}

function buildNatalPlanets(profile: {
  sunSign?: string | null;
  moonSign?: string | null;
  risingSign?: string | null;
  mercurySign?: string | null;
  venusSign?: string | null;
  marsSign?: string | null;
  jupiterSign?: string | null;
  saturnSign?: string | null;
  chironSign?: string | null;
}): Array<{ name: string; sign: string }> {
  const planets: Array<{ name: string; sign: string }> = [];
  if (profile.sunSign) planets.push({ name: "Sole", sign: profile.sunSign });
  if (profile.moonSign) planets.push({ name: "Luna", sign: profile.moonSign });
  if (profile.risingSign) planets.push({ name: "Ascendente", sign: profile.risingSign });
  if (profile.mercurySign) planets.push({ name: "Mercurio", sign: profile.mercurySign });
  if (profile.venusSign) planets.push({ name: "Venere", sign: profile.venusSign });
  if (profile.marsSign) planets.push({ name: "Marte", sign: profile.marsSign });
  if (profile.jupiterSign) planets.push({ name: "Giove", sign: profile.jupiterSign });
  if (profile.saturnSign) planets.push({ name: "Saturno", sign: profile.saturnSign });
  if (profile.chironSign) planets.push({ name: "Chirone", sign: profile.chironSign });
  return planets;
}

function chooseCategory(
  lunarEvent: ReturnType<typeof getCurrentLunarEvent>,
  transits: Array<{ description: string }>,
  recentMoods: number[]
): string {
  if (lunarEvent) return "lunar";
  if (transits.length > 0) return "transit";
  if (recentMoods.length >= 3) {
    const avg = recentMoods.slice(-3).reduce((a, b) => a + b, 0) / Math.min(recentMoods.length, 3);
    if (avg <= 2.5) return "shadow";
    if (avg >= 4) return "growth";
  }
  return "mirror";
}

// GET: fetch today's star + history
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const userId = session.user.id;

  // Quick unread check mode
  const check = request.nextUrl.searchParams.get("check");
  if (check === "unread") {
    const unread = await db.mapInsight.count({
      where: { userId, read: false, type: "star" },
    });
    return NextResponse.json({ unread });
  }

  const profile = await db.profile.findUnique({
    where: { userId },
  });

  if (!profile?.onboardingComplete) {
    return NextResponse.json({ today: null, stars: [], constellations: [] });
  }

  const today = getToday();

  // Check if today's star already exists
  let todayStar = await db.mapInsight.findUnique({
    where: { userId_date_type: { userId, date: today, type: "star" } },
  });

  // Generate if needed
  if (!todayStar) {
    // Gather context data
    const [recentCheckins, recentJournals] = await Promise.all([
      db.dailyCheckin.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 7,
        select: { mood: true, energy: true },
      }),
      db.journal.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 3,
        select: { themes: true, mood: true },
      }),
    ]);

    const natalPlanets = buildNatalPlanets(profile);
    const transits = findSignificantTransits(natalPlanets);
    const lunarEvent = getCurrentLunarEvent();
    const recentMoods = recentCheckins.map((c) => c.mood);
    const recentThemes = recentJournals.flatMap((j) => j.themes || []);

    const category = chooseCategory(lunarEvent, transits, recentMoods);
    const position = generateStarPosition(today, userId);

    try {
      const content = await generateStarInsight({
        category,
        profile: {
          sunSign: profile.sunSign || undefined,
          moonSign: profile.moonSign || undefined,
          risingSign: profile.risingSign || undefined,
          shadows: profile.shadows,
          blindSpots: profile.blindSpots,
          strengths: profile.strengths,
          northNodeSign: profile.northNodeSign || undefined,
        },
        transits: transits.map((t) => ({ description: t.description })),
        recentMoods,
        recentThemes,
        lunarEvent,
      });

      todayStar = await db.mapInsight.create({
        data: {
          userId,
          date: today,
          type: "star",
          content,
          category,
          metadata: {
            x: position.x,
            y: position.y,
            brightness: category === "lunar" ? 1.0 : 0.6 + Math.random() * 0.3,
          },
        },
      });
    } catch (e) {
      console.error("Failed to generate star insight:", e);
      // Fallback: create a star without AI
      todayStar = await db.mapInsight.create({
        data: {
          userId,
          date: today,
          type: "star",
          content: "Il cielo si muove, anche quando non lo vedi.",
          category: "mirror",
          metadata: { x: position.x, y: position.y, brightness: 0.5 },
        },
      });
    }
  }

  // Check for weekly constellation (Sunday)
  const dayOfWeek = new Date().getDay();
  if (dayOfWeek === 0) {
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - 6);

    const existingConstellation = await db.mapInsight.findUnique({
      where: { userId_date_type: { userId, date: today, type: "constellation" } },
    });

    if (!existingConstellation) {
      const weekStars = await db.mapInsight.findMany({
        where: {
          userId,
          type: "star",
          date: { gte: weekStart, lte: today },
        },
        orderBy: { date: "asc" },
      });

      if (weekStars.length >= 5) {
        try {
          const result = await generateConstellationInsight({
            stars: weekStars.map((s) => ({ content: s.content, category: s.category })),
            profile: {
              sunSign: profile.sunSign || undefined,
              moonSign: profile.moonSign || undefined,
            },
          });

          await db.mapInsight.create({
            data: {
              userId,
              date: today,
              type: "constellation",
              content: result.insight,
              category: "growth",
              metadata: {
                name: result.name,
                starIds: weekStars.map((s) => s.id),
              },
            },
          });
        } catch (e) {
          console.error("Failed to generate constellation:", e);
        }
      }
    }
  }

  // Fetch history (last 28 days)
  const historyStart = new Date(today);
  historyStart.setDate(historyStart.getDate() - 28);

  const [stars, constellations] = await Promise.all([
    db.mapInsight.findMany({
      where: { userId, type: "star", date: { gte: historyStart } },
      orderBy: { date: "desc" },
    }),
    db.mapInsight.findMany({
      where: { userId, type: "constellation", date: { gte: historyStart } },
      orderBy: { date: "desc" },
    }),
  ]);

  return NextResponse.json({ today: todayStar, stars, constellations });
}

// PATCH: mark star as read
export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const body = await request.json();
  const { insightId } = body;

  if (!insightId) {
    return NextResponse.json({ error: "insightId richiesto" }, { status: 400 });
  }

  await db.mapInsight.updateMany({
    where: { id: insightId, userId: session.user.id },
    data: { read: true },
  });

  return NextResponse.json({ ok: true });
}
