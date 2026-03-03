import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { computeStarPosition } from "@/lib/sky-theme";
import { generateConstellationReading } from "@/lib/ai";

function getToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

interface MapStar {
  id: string;
  date: string;
  starX: number;
  starY: number;
  unlocked: boolean;
  unlockedAt: string | null;
  respiro: string;
  seme: string;
  dominantPlanet: string;
  dominantPlanetSign: string;
  transitDescription: string;
  themeColor: string;
  mood: number | null;
  brightness: number;
  specchioSlug: string | null;
}

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const userId = session.user.id;

  // Quick unread check (for bottom tab badge)
  const check = request.nextUrl.searchParams.get("check");
  if (check === "unread") {
    const today = getToday();
    const todayTransit = await db.dailyTransit.findUnique({
      where: { userId_date: { userId, date: today } },
      select: { starUnlocked: true },
    });
    const unread = todayTransit && !todayTransit.starUnlocked ? 1 : 0;
    return NextResponse.json({ unread });
  }

  const [profile, allTransits, allCheckins, constellations, specchioCapitoli] =
    await Promise.all([
      db.profile.findUnique({
        where: { userId },
        select: {
          onboardingComplete: true,
          mapOnboardingShown: true,
          sunSign: true,
          moonSign: true,
        },
      }),
      db.dailyTransit.findMany({
        where: { userId },
        orderBy: { date: "asc" },
        select: {
          id: true,
          date: true,
          starX: true,
          starY: true,
          starUnlocked: true,
          starUnlockedAt: true,
          transitData: true,
          interpretation: true,
          dailyTheme: true,
        },
      }),
      db.dailyCheckin.findMany({
        where: { userId },
        select: { mood: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      }),
      db.constellation.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      }),
      db.specchioCapitolo.findMany({
        where: { userId, completedAt: { not: null } },
        select: { slug: true, startedAt: true, completedAt: true },
      }),
    ]);

  if (!profile?.onboardingComplete) {
    return NextResponse.json({
      stars: [],
      constellations: [],
      showOnboarding: false,
      todayStarId: null,
    });
  }

  // Build mood lookup by date
  const moodByDate = new Map<string, number>();
  for (const c of allCheckins) {
    const dateKey = new Date(c.createdAt).toISOString().split("T")[0];
    if (!moodByDate.has(dateKey)) moodByDate.set(dateKey, c.mood);
  }

  // Unlock today's star if not yet unlocked
  const today = getToday();
  const todayIso = today.toISOString().split("T")[0];
  const todayTransit = allTransits.find(
    (t) => new Date(t.date).toISOString().split("T")[0] === todayIso
  );

  if (todayTransit && !todayTransit.starUnlocked) {
    await db.dailyTransit.update({
      where: { id: todayTransit.id },
      data: { starUnlocked: true, starUnlockedAt: new Date() },
    });
    todayTransit.starUnlocked = true;
    todayTransit.starUnlockedAt = new Date();
  }

  // Also unlock any past stars that were never unlocked (missed days)
  const unlockedPast = allTransits.filter(
    (t) => !t.starUnlocked && new Date(t.date) < today
  );
  if (unlockedPast.length > 0) {
    await db.dailyTransit.updateMany({
      where: { id: { in: unlockedPast.map((t) => t.id) } },
      data: { starUnlocked: true, starUnlockedAt: new Date() },
    });
    for (const t of unlockedPast) {
      t.starUnlocked = true;
    }
  }

  // Map transits to star data
  const stars: MapStar[] = allTransits.map((t) => {
    const td = t.transitData as {
      transits: Array<{
        transitPlanet: string;
        aspect: string;
        natalPlanet: string;
        description: string;
        weight: number;
      }>;
      currentPositions?: Array<{ planet: string; sign: string }>;
    };
    const interp = t.interpretation as { respiro: string; sussurro: string; seme: string };
    const theme = t.dailyTheme as { primary: string; secondary: string; accent: string };
    const dateStr = new Date(t.date).toISOString().split("T")[0];
    const mood = moodByDate.get(dateStr) ?? null;
    const brightness = mood ? 0.1 + (mood / 5) * 0.9 : 0.5;

    const dominant = td.transits?.[0];
    const dominantPlanet = dominant?.transitPlanet ?? "Sole";
    const dominantPlanetSign =
      td.currentPositions?.find((p) => p.planet === dominantPlanet)?.sign ?? "";

    // Compute starX/starY if missing (backfill for old records)
    let starX = t.starX;
    let starY = t.starY;
    if (starX == null || starY == null) {
      const positions = td.currentPositions ?? [];
      const computed = computeStarPosition(td.transits ?? [], positions);
      starX = computed.starX;
      starY = computed.starY;
    }

    // Find Specchio connection if transit date overlaps a chapter
    const specchioSlug = specchioCapitoli.find((cap) => {
      const d = new Date(t.date);
      return d >= new Date(cap.startedAt) && cap.completedAt && d <= new Date(cap.completedAt);
    })?.slug ?? null;

    return {
      id: t.id,
      date: dateStr,
      starX,
      starY,
      unlocked: t.starUnlocked,
      unlockedAt: t.starUnlockedAt?.toISOString() ?? null,
      respiro: interp.respiro,
      seme: interp.seme,
      dominantPlanet,
      dominantPlanetSign,
      transitDescription: dominant?.description ?? "",
      themeColor: theme.primary,
      mood,
      brightness,
      specchioSlug,
    };
  });

  // Check constellation trigger after unlock
  if (todayTransit?.starUnlocked) {
    await checkConstellationTrigger(userId, stars, profile);
  }

  return NextResponse.json({
    stars,
    constellations,
    showOnboarding: !profile.mapOnboardingShown,
    todayStarId: todayTransit?.id ?? null,
  });
}

// PATCH: mark onboarding as shown
export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const body = await request.json();

  if (body.action === "onboardingShown") {
    await db.profile.update({
      where: { userId: session.user.id },
      data: { mapOnboardingShown: true },
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Azione non valida" }, { status: 400 });
}

// ─── Constellation trigger ───

async function checkConstellationTrigger(
  userId: string,
  stars: MapStar[],
  profile: { sunSign: string | null; moonSign: string | null }
) {
  const unlockedStars = stars.filter((s) => s.unlocked);

  // Group by dominantPlanet
  const byPlanet = new Map<string, MapStar[]>();
  for (const s of unlockedStars) {
    const group = byPlanet.get(s.dominantPlanet) || [];
    group.push(s);
    byPlanet.set(s.dominantPlanet, group);
  }

  for (const [planet, planetStars] of byPlanet) {
    if (planetStars.length < 5) continue;

    // Check if constellation already exists for this planet
    const existing = await db.constellation.findFirst({
      where: { userId, dominantPlanet: planet },
    });

    // Only create if first time (5+) or every 5 additional stars
    if (existing) {
      const existingCount = existing.starDates.length;
      if (planetStars.length < existingCount + 5) continue;
    }

    // Find clusters (stars within ~30% range)
    const clusters = findClusters(planetStars, 30);
    for (const cluster of clusters) {
      if (cluster.length < 5) continue;

      // Check this cluster hasn't been made into a constellation already
      const clusterDates = cluster.map((s) => new Date(s.date));

      try {
        const reading = await generateConstellationReading({
          stars: cluster.map((s) => ({
            date: s.date,
            respiro: s.respiro,
            dominantPlanet: s.dominantPlanet,
            transitDescription: s.transitDescription,
            mood: s.mood,
            specchioSlug: s.specchioSlug,
          })),
          planet,
          profile: {
            sunSign: profile.sunSign ?? undefined,
            moonSign: profile.moonSign ?? undefined,
          },
          userId,
        });

        await db.constellation.create({
          data: {
            userId,
            name: reading.name,
            reading: reading.reading,
            dominantPlanet: planet,
            starDates: clusterDates,
            metadata: JSON.parse(JSON.stringify({
              cartografoAnalysis: reading.analysis,
              centerX: average(cluster.map((s) => s.starX)),
              centerY: average(cluster.map((s) => s.starY)),
            })),
          },
        });
      } catch (e) {
        console.error("Constellation generation failed:", e);
      }
    }
  }
}

function findClusters(stars: MapStar[], maxRange: number): MapStar[][] {
  const used = new Set<string>();
  const clusters: MapStar[][] = [];

  for (const star of stars) {
    if (used.has(star.id)) continue;
    const cluster = [star];
    used.add(star.id);

    for (const other of stars) {
      if (used.has(other.id)) continue;
      const isClose = cluster.some(
        (s) =>
          Math.abs(s.starX - other.starX) < maxRange &&
          Math.abs(s.starY - other.starY) < maxRange
      );
      if (isClose) {
        cluster.push(other);
        used.add(other.id);
      }
    }

    clusters.push(cluster);
  }

  return clusters;
}

function average(nums: number[]): number {
  return nums.length === 0 ? 50 : nums.reduce((a, b) => a + b, 0) / nums.length;
}
