import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateTransitInsight } from "@/lib/ai";
import { findSignificantTransits, PLANET_SYMBOLS, ASPECTS } from "@/lib/astro-constants";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const profile = await db.profile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile?.onboardingComplete) {
    return NextResponse.json({ transits: [], message: "Completa l'onboarding" });
  }

  // Build natal planets array from profile
  const natalPlanets: Array<{ name: string; sign: string }> = [];
  if (profile.sunSign) natalPlanets.push({ name: "Sole", sign: profile.sunSign });
  if (profile.moonSign) natalPlanets.push({ name: "Luna", sign: profile.moonSign });
  if (profile.risingSign) natalPlanets.push({ name: "Ascendente", sign: profile.risingSign });
  if (profile.mercurySign) natalPlanets.push({ name: "Mercurio", sign: profile.mercurySign });
  if (profile.venusSign) natalPlanets.push({ name: "Venere", sign: profile.venusSign });
  if (profile.marsSign) natalPlanets.push({ name: "Marte", sign: profile.marsSign });
  if (profile.jupiterSign) natalPlanets.push({ name: "Giove", sign: profile.jupiterSign });
  if (profile.saturnSign) natalPlanets.push({ name: "Saturno", sign: profile.saturnSign });
  if (profile.chironSign) natalPlanets.push({ name: "Chirone", sign: profile.chironSign });

  const significantTransits = findSignificantTransits(natalPlanets);

  if (significantTransits.length === 0) {
    return NextResponse.json({
      transits: [],
      message: "Il cielo è quieto oggi. Un momento per integrare.",
    });
  }

  // Check cache — look for today's transit insights
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const cachedTransits = await db.insight.findMany({
    where: {
      userId: session.user.id,
      type: "transit",
      createdAt: { gte: today, lt: tomorrow },
    },
  });

  const transitsWithInsights = [];

  for (const transit of significantTransits) {
    const cached = cachedTransits.find(
      (c) => c.title === transit.description
    );

    let interpretation: string;
    if (cached) {
      interpretation = cached.content;
    } else {
      // Generate new interpretation with Haiku
      try {
        interpretation = await generateTransitInsight(
          `${transit.transitPlanet} in ${transit.aspect} con ${transit.natalPlanet} natale`,
          {
            sunSign: profile.sunSign || undefined,
            moonSign: profile.moonSign || undefined,
            risingSign: profile.risingSign || undefined,
          }
        );

        // Cache it
        await db.insight.create({
          data: {
            userId: session.user.id,
            type: "transit",
            title: transit.description,
            content: interpretation,
            source: "transit",
          },
        });
      } catch {
        interpretation = ASPECTS[transit.aspect]
          ? getDefaultInterpretation(transit.aspect)
          : "Transito attivo";
      }
    }

    transitsWithInsights.push({
      transitPlanet: transit.transitPlanet,
      transitSymbol: PLANET_SYMBOLS[transit.transitPlanet] || "",
      aspect: transit.aspect,
      aspectSymbol: ASPECTS[transit.aspect]?.symbol || "",
      natalPlanet: transit.natalPlanet,
      natalSymbol: PLANET_SYMBOLS[transit.natalPlanet] || "",
      description: transit.description,
      interpretation,
    });
  }

  return NextResponse.json({ transits: transitsWithInsights });
}

function getDefaultInterpretation(aspect: string): string {
  const defaults: Record<string, string> = {
    congiunzione: "Fusione di energie — un momento di intensità e nuovi inizi",
    opposizione: "Tensione creativa — equilibrio tra forze opposte",
    trigono: "Flusso armonioso — le energie collaborano naturalmente",
    quadratura: "Sfida trasformativa — crescita attraverso l'attrito",
  };
  return defaults[aspect] || "Transito attivo";
}
