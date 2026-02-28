import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateBirthChartReading } from "@/lib/ai";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const { birthDate, birthTime, birthCity } = await req.json();

  if (!birthDate) {
    return NextResponse.json({ error: "Data di nascita richiesta" }, { status: 400 });
  }

  const chart = await generateBirthChartReading({ birthDate, birthTime, birthCity });

  // Save to profile
  await db.profile.upsert({
    where: { userId: session.user.id },
    update: {
      birthDate: new Date(birthDate),
      birthTime: birthTime || null,
      birthCity: birthCity || null,
      sunSign: chart.sunSign,
      moonSign: chart.moonSign,
      risingSign: chart.risingSign,
      mercurySign: chart.mercurySign,
      venusSign: chart.venusSign,
      marsSign: chart.marsSign,
      jupiterSign: chart.jupiterSign,
      saturnSign: chart.saturnSign,
      chironSign: chart.chironSign,
      northNodeSign: chart.northNodeSign,
      natalChartData: chart.natalChartData || {},
      mythologyNarrative: chart.mythology,
      shadows: chart.shadows || [],
      strengths: chart.gifts || [],
    },
    create: {
      userId: session.user.id,
      birthDate: new Date(birthDate),
      birthTime: birthTime || null,
      birthCity: birthCity || null,
      sunSign: chart.sunSign,
      moonSign: chart.moonSign,
      risingSign: chart.risingSign,
      mercurySign: chart.mercurySign,
      venusSign: chart.venusSign,
      marsSign: chart.marsSign,
      jupiterSign: chart.jupiterSign,
      saturnSign: chart.saturnSign,
      chironSign: chart.chironSign,
      northNodeSign: chart.northNodeSign,
      natalChartData: chart.natalChartData || {},
      mythologyNarrative: chart.mythology,
      shadows: chart.shadows || [],
      strengths: chart.gifts || [],
    },
  });

  return NextResponse.json({ chart });
}
