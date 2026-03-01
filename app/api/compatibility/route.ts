import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateBirthChartReading, generateCompatibility } from "@/lib/ai";
import { checkCredits, deductCredits } from "@/lib/credits";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const { name, birthDate, birthTime, birthCity } = await req.json();

  if (!birthDate) {
    return NextResponse.json({ error: "Data di nascita richiesta" }, { status: 400 });
  }

  // Check credits: 10 for free users, free for premium
  const creditCheck = await checkCredits(session.user.id, "compatibility");
  if (!creditCheck.allowed) {
    return NextResponse.json(
      { error: `Crediti insufficienti. Servono ${creditCheck.cost} crediti (hai ${creditCheck.credits}).` },
      { status: 402 }
    );
  }

  // Get user's profile (person 1)
  const profile = await db.profile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile?.onboardingComplete) {
    return NextResponse.json({ error: "Completa l'onboarding prima" }, { status: 400 });
  }

  // Calculate person 2's chart
  let person2Chart;
  try {
    person2Chart = await generateBirthChartReading({
      birthDate,
      birthTime: birthTime || undefined,
      birthCity: birthCity || undefined,
    });
  } catch {
    return NextResponse.json(
      { error: "Non sono riuscito a calcolare il tema natale. Riprova." },
      { status: 500 }
    );
  }

  // Generate compatibility analysis
  let result;
  try {
    result = await generateCompatibility(
      {
        name: session.user.name || undefined,
        sunSign: profile.sunSign || undefined,
        moonSign: profile.moonSign || undefined,
        risingSign: profile.risingSign || undefined,
        venusSign: profile.venusSign || undefined,
        marsSign: profile.marsSign || undefined,
        chironSign: profile.chironSign || undefined,
        natalChartData: profile.natalChartData as Record<string, unknown> | undefined,
      },
      {
        name: name || undefined,
        sunSign: person2Chart.sunSign,
        moonSign: person2Chart.moonSign,
        risingSign: person2Chart.risingSign,
        venusSign: person2Chart.venusSign,
        marsSign: person2Chart.marsSign,
        chironSign: person2Chart.chironSign,
        natalChartData: person2Chart.natalChartData,
      }
    );
  } catch {
    return NextResponse.json(
      { error: "Errore nell'analisi della compatibilità. Riprova." },
      { status: 500 }
    );
  }

  // Save to DB
  const compatibility = await db.compatibility.create({
    data: {
      userId: session.user.id,
      person2Name: name || null,
      person2BirthDate: new Date(birthDate),
      person2BirthTime: birthTime || null,
      person2BirthCity: birthCity || null,
      person2ChartData: person2Chart,
      analysis: result.analysis,
      highlightQuote: result.highlightQuote || null,
    },
  });

  // Deduct credits (no-op for premium users)
  const remainingCredits = await deductCredits(session.user.id, "compatibility");

  return NextResponse.json({
    id: compatibility.id,
    analysis: result.analysis,
    highlightQuote: result.highlightQuote,
    person1Sun: profile.sunSign,
    person2Sun: person2Chart.sunSign,
    person2Chart: {
      sunSign: person2Chart.sunSign,
      moonSign: person2Chart.moonSign,
      risingSign: person2Chart.risingSign,
    },
    isPremium: creditCheck.isPremium,
    credits: remainingCredits,
  });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const compatibilities = await db.compatibility.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  return NextResponse.json({ compatibilities });
}
