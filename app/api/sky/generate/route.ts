import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateInterpretation, generateDailyMaster } from "@/lib/ai";
import {
  getCurrentTransits,
  findSignificantTransits,
  getRetrogradePlanets,
} from "@/lib/astro-constants";
import { computeDailyTheme, computeStarPosition } from "@/lib/sky-theme";
import { generateSigil } from "@/lib/sigil";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const profile = await db.profile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile?.onboardingComplete) {
    return NextResponse.json({ error: "Onboarding non completato" }, { status: 400 });
  }

  // Check cache — reuse today's sky
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existing = await db.dailyTransit.findUnique({
    where: {
      userId_date: {
        userId: session.user.id,
        date: today,
      },
    },
  });

  if (existing) {
    const interpretation = existing.interpretation as { respiro: string; sussurro: string; seme: string };
    const theme = existing.dailyTheme as { primary: string; secondary: string; accent: string; cssVars: Record<string, string> };
    const td = existing.transitData as { transits: Array<{ transitPlanet: string; aspect: string; natalPlanet: string; description: string; weight: number }>; retrogrades: string[] };
    return NextResponse.json({
      respiro: interpretation.respiro,
      sussurro: interpretation.sussurro,
      seme: interpretation.seme,
      theme,
      sigilSvg: existing.sigilSvg,
      transits: td.transits,
      cached: true,
    });
  }

  // Build natal planets array from profile
  const natalPlanets = [
    { name: "Sole", sign: profile.sunSign || "Ariete" },
    { name: "Luna", sign: profile.moonSign || "Ariete" },
    { name: "Mercurio", sign: profile.mercurySign || "Ariete" },
    { name: "Venere", sign: profile.venusSign || "Ariete" },
    { name: "Marte", sign: profile.marsSign || "Ariete" },
    { name: "Giove", sign: profile.jupiterSign || "Ariete" },
    { name: "Saturno", sign: profile.saturnSign || "Ariete" },
  ].filter((p) => p.sign);

  try {
    // Agent 1: Astronomo — pure calculation
    const currentTransits = getCurrentTransits();
    const significantTransits = findSignificantTransits(natalPlanets);
    const retrogrades = getRetrogradePlanets();

    // Compute theme from transits
    const theme = computeDailyTheme(significantTransits);

    // Generate sigil SVG
    const sigilSvg = generateSigil(significantTransits, natalPlanets, theme.accent);

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

    // Compute star position for La Mappa
    const { starX, starY } = computeStarPosition(
      significantTransits,
      currentTransits.map((t) => ({ planet: t.planet, sign: t.sign }))
    );

    // Agent 2: Interprete — Haiku
    const interpretation = await generateInterpretation(transitData, {
      sunSign: profile.sunSign || undefined,
      moonSign: profile.moonSign || undefined,
      risingSign: profile.risingSign || undefined,
      shadows: profile.shadows,
    });

    // Agent 3: Maestro — Sonnet
    const masterResult = await generateDailyMaster(interpretation, transitData, {
      sunSign: profile.sunSign || undefined,
      moonSign: profile.moonSign || undefined,
      risingSign: profile.risingSign || undefined,
      shadows: profile.shadows,
    });

    // Save to DailyTransit
    await db.dailyTransit.create({
      data: {
        userId: session.user.id,
        date: today,
        transitData: JSON.parse(JSON.stringify(transitData)),
        interpretation: JSON.parse(JSON.stringify(masterResult)),
        dailyTheme: JSON.parse(JSON.stringify(theme)),
        sigilSvg,
        starX,
        starY,
      },
    });

    return NextResponse.json({
      respiro: masterResult.respiro,
      sussurro: masterResult.sussurro,
      seme: masterResult.seme,
      theme,
      sigilSvg,
      transits: transitData.transits,
      cached: false,
    });
  } catch (error) {
    console.error("Sky generation error:", error);
    return NextResponse.json({ error: "Errore nella generazione" }, { status: 500 });
  }
}
