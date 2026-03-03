import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateInterpretation, generateDailyMaster } from "@/lib/ai";
import {
  getCurrentTransits,
  findSignificantTransits,
  getRetrogradePlanets,
} from "@/lib/astro-constants";
import { computeDailyTheme, computeStarPosition } from "@/lib/sky-theme";
import { generateSigil } from "@/lib/sigil";

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find users who completed onboarding and don't have today's sky yet
  const users = await db.profile.findMany({
    where: { onboardingComplete: true },
    select: {
      userId: true,
      sunSign: true,
      moonSign: true,
      risingSign: true,
      mercurySign: true,
      venusSign: true,
      marsSign: true,
      jupiterSign: true,
      saturnSign: true,
      shadows: true,
    },
    take: 50,
  });

  // Filter out users who already have today's sky
  const existingTransits = await db.dailyTransit.findMany({
    where: {
      date: today,
      userId: { in: users.map((u) => u.userId) },
    },
    select: { userId: true },
  });
  const existingIds = new Set(existingTransits.map((e) => e.userId));
  const pending = users.filter((u) => !existingIds.has(u.userId));

  let generated = 0;
  let errors = 0;

  // Shared transit calculations (same for all users today)
  const currentTransits = getCurrentTransits();
  const retrogrades = getRetrogradePlanets();

  for (const profile of pending) {
    try {
      const natalPlanets = [
        { name: "Sole", sign: profile.sunSign || "Ariete" },
        { name: "Luna", sign: profile.moonSign || "Ariete" },
        { name: "Mercurio", sign: profile.mercurySign || "Ariete" },
        { name: "Venere", sign: profile.venusSign || "Ariete" },
        { name: "Marte", sign: profile.marsSign || "Ariete" },
        { name: "Giove", sign: profile.jupiterSign || "Ariete" },
        { name: "Saturno", sign: profile.saturnSign || "Ariete" },
      ].filter((p) => p.sign);

      const significantTransits = findSignificantTransits(natalPlanets);
      const theme = computeDailyTheme(significantTransits);
      const sigilSvg = generateSigil(significantTransits, natalPlanets, theme.accent);

      // Compute star position for La Mappa
      const { starX, starY } = computeStarPosition(
        significantTransits,
        currentTransits.map((t) => ({ planet: t.planet, sign: t.sign }))
      );

      const transitData = {
        transits: significantTransits.map((t) => ({
          transitPlanet: t.transitPlanet,
          aspect: t.aspect,
          natalPlanet: t.natalPlanet,
          description: t.description,
          weight: t.weight,
        })),
        retrogrades,
        currentPositions: currentTransits.map((t) => ({
          planet: t.planet,
          sign: t.sign,
        })),
      };

      const interpretation = await generateInterpretation(transitData, {
        sunSign: profile.sunSign || undefined,
        moonSign: profile.moonSign || undefined,
        risingSign: profile.risingSign || undefined,
        shadows: profile.shadows,
      });

      const masterResult = await generateDailyMaster(interpretation, transitData, {
        sunSign: profile.sunSign || undefined,
        moonSign: profile.moonSign || undefined,
        risingSign: profile.risingSign || undefined,
        shadows: profile.shadows,
      });

      await db.dailyTransit.create({
        data: {
          userId: profile.userId,
          date: today,
          transitData: JSON.parse(JSON.stringify(transitData)),
          interpretation: JSON.parse(JSON.stringify(masterResult)),
          dailyTheme: JSON.parse(JSON.stringify(theme)),
          sigilSvg,
          starX,
          starY,
        },
      });

      generated++;
    } catch (error) {
      console.error(`Sky pregeneration error for ${profile.userId}:`, error);
      errors++;
    }
  }

  return NextResponse.json({
    total: pending.length,
    generated,
    errors,
    skipped: existingIds.size,
  });
}
