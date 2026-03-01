import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateCuttingPhrase } from "@/lib/ai";
import { getCurrentTransits } from "@/lib/astro-constants";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const profile = await db.profile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile?.onboardingComplete) {
    return NextResponse.json({ frase: null });
  }

  // Check cache — reuse today's frase
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const existing = await db.insight.findFirst({
    where: {
      userId: session.user.id,
      type: "frase",
      createdAt: { gte: today, lt: tomorrow },
    },
  });

  if (existing) {
    return NextResponse.json({ frase: existing.content, cached: true });
  }

  // Generate — free, no credit cost (Haiku is cheap, this is core UX)
  const transits = getCurrentTransits();

  try {
    const frase = await generateCuttingPhrase(
      {
        sunSign: profile.sunSign || undefined,
        moonSign: profile.moonSign || undefined,
        risingSign: profile.risingSign || undefined,
        shadows: profile.shadows,
      },
      transits
    );

    await db.insight.create({
      data: {
        userId: session.user.id,
        type: "frase",
        title: `Frase ${today.toLocaleDateString("it-IT")}`,
        content: frase,
        source: "natal",
      },
    });

    return NextResponse.json({ frase, cached: false });
  } catch {
    return NextResponse.json({ frase: null });
  }
}
