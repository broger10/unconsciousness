import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { useCredits } from "@/lib/credits";
import { generateFiloAnalysis } from "@/lib/ai";
import { findSignificantTransits } from "@/lib/astro-constants";

const CACHE_HOURS = 48;

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  // Check premium status
  const subscription = await db.subscription.findUnique({
    where: { userId: session.user.id },
    select: { status: true },
  });
  const isPremium = subscription?.status === "active";

  // Check cache (48h) — stored in Insight table with type "filo"
  const cacheThreshold = new Date(Date.now() - CACHE_HOURS * 60 * 60 * 1000);
  const cached = await db.insight.findFirst({
    where: {
      userId: session.user.id,
      type: "filo",
      createdAt: { gte: cacheThreshold },
    },
    orderBy: { createdAt: "desc" },
  });

  // Check if there's a newer journal entry that invalidates cache
  if (cached) {
    const newerJournal = await db.journal.findFirst({
      where: {
        userId: session.user.id,
        createdAt: { gt: cached.createdAt },
      },
    });

    if (!newerJournal) {
      // Cache is valid — return it
      try {
        const analysis = JSON.parse(cached.content);
        return NextResponse.json({ analysis, isPremium, cached: true });
      } catch {
        // Corrupted cache, regenerate
      }
    }
  }

  // Fetch user data
  const [journals, checkins, profile] = await Promise.all([
    db.journal.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: { content: true, mood: true, themes: true, createdAt: true },
    }),
    db.dailyCheckin.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: { mood: true, energy: true, createdAt: true },
    }),
    db.profile.findUnique({
      where: { userId: session.user.id },
      select: {
        sunSign: true,
        moonSign: true,
        risingSign: true,
        shadows: true,
        mercurySign: true,
        venusSign: true,
        marsSign: true,
        jupiterSign: true,
        saturnSign: true,
      },
    }),
  ]);

  // Check minimum entries
  if (journals.length < 3) {
    return NextResponse.json({ error: "too_few_entries", minRequired: 3 }, { status: 400 });
  }

  // Check/deduct credits
  const hasCredits = await useCredits(session.user.id, "pattern_analysis");
  if (!hasCredits) {
    return NextResponse.json({ error: "Crediti esauriti", needsUpgrade: true }, { status: 402 });
  }

  // Build natal planets array for transit calculation
  const natalPlanets: Array<{ name: string; sign: string }> = [];
  if (profile?.sunSign) natalPlanets.push({ name: "Sole", sign: profile.sunSign });
  if (profile?.moonSign) natalPlanets.push({ name: "Luna", sign: profile.moonSign });
  if (profile?.mercurySign) natalPlanets.push({ name: "Mercurio", sign: profile.mercurySign });
  if (profile?.venusSign) natalPlanets.push({ name: "Venere", sign: profile.venusSign });
  if (profile?.marsSign) natalPlanets.push({ name: "Marte", sign: profile.marsSign });
  if (profile?.jupiterSign) natalPlanets.push({ name: "Giove", sign: profile.jupiterSign });
  if (profile?.saturnSign) natalPlanets.push({ name: "Saturno", sign: profile.saturnSign });

  // Enrich each journal entry with transits active on that date
  const journalsWithTransits = journals.map((j) => {
    const transits = natalPlanets.length > 0
      ? findSignificantTransits(natalPlanets, j.createdAt)
      : [];
    return {
      ...j,
      transits: transits.length > 0
        ? transits.map((t) => t.description).join(", ")
        : undefined,
    };
  });

  // Generate analysis
  try {
    const analysis = await generateFiloAnalysis(
      {
        sunSign: profile?.sunSign || undefined,
        moonSign: profile?.moonSign || undefined,
        risingSign: profile?.risingSign || undefined,
        shadows: profile?.shadows || [],
      },
      journalsWithTransits,
      checkins
    );

    // Cache the result
    await db.insight.create({
      data: {
        userId: session.user.id,
        type: "filo",
        title: "Il Filo — Analisi Pattern",
        content: JSON.stringify(analysis),
        source: "journal",
      },
    });

    return NextResponse.json({ analysis, isPremium });
  } catch {
    return NextResponse.json({ error: "analysis_failed" }, { status: 500 });
  }
}
