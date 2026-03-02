import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateSpecchioRitratto } from "@/lib/ai";
import { CAPITOLI } from "@/lib/specchio-capitoli";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const body = await request.json();
  const { capitoloId } = body;

  if (!capitoloId) {
    return NextResponse.json({ error: "capitoloId richiesto" }, { status: 400 });
  }

  const capitolo = await db.specchioCapitolo.findFirst({
    where: { id: capitoloId, userId: session.user.id, completedAt: { not: null } },
    include: { sessioni: { orderBy: { giorno: "asc" } } },
  });

  if (!capitolo) {
    return NextResponse.json({ error: "Capitolo non trovato o non completato" }, { status: 404 });
  }

  // If portrait already exists, return it
  if (capitolo.ritratto) {
    return NextResponse.json({
      ritratto: capitolo.ritratto,
      insights: capitolo.ritrattoInsights,
    });
  }

  const capitoloDef = CAPITOLI[capitolo.slug];
  if (!capitoloDef) {
    return NextResponse.json({ error: "Definizione capitolo non trovata" }, { status: 500 });
  }

  const profile = await db.profile.findUnique({
    where: { userId: session.user.id },
    select: { sunSign: true, moonSign: true, risingSign: true },
  });

  const capitoliCompletati = await db.specchioCapitolo.findMany({
    where: { userId: session.user.id, completedAt: { not: null }, id: { not: capitoloId } },
    select: { slug: true, ritratto: true },
  });

  try {
    const result = await generateSpecchioRitratto({
      capitoloTitolo: capitoloDef.titolo,
      capitoloSlug: capitolo.slug,
      sessioni: capitolo.sessioni.map((s) => ({ giorno: s.giorno, domande: s.domande })),
      profile: {
        sunSign: profile?.sunSign || undefined,
        moonSign: profile?.moonSign || undefined,
        risingSign: profile?.risingSign || undefined,
      },
      capitoliCompletati,
    });

    // Save portrait
    await db.specchioCapitolo.update({
      where: { id: capitoloId },
      data: {
        ritratto: result.ritratto,
        ritrattoInsights: result.insights,
      },
    });

    return NextResponse.json(result);
  } catch (e) {
    console.error("Failed to generate specchio ritratto:", e);
    return NextResponse.json(
      { error: "Le stelle stanno ancora leggendo. Riprova tra un momento." },
      { status: 500 }
    );
  }
}
