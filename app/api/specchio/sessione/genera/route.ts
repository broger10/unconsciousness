import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateSpecchioDomande } from "@/lib/ai";
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
    where: { id: capitoloId, userId: session.user.id, completedAt: null },
    include: { sessioni: { orderBy: { giorno: "asc" } } },
  });

  if (!capitolo) {
    return NextResponse.json({ error: "Capitolo non trovato o già completato" }, { status: 404 });
  }

  const capitoloDef = CAPITOLI[capitolo.slug];
  if (!capitoloDef) {
    return NextResponse.json({ error: "Definizione capitolo non trovata" }, { status: 500 });
  }

  const profile = await db.profile.findUnique({
    where: { userId: session.user.id },
    select: { sunSign: true, moonSign: true, risingSign: true, shadows: true, strengths: true },
  });

  const rispostePrecedenti = capitolo.sessioni.map((s) => ({
    giorno: s.giorno,
    domande: s.domande,
  }));

  try {
    const domande = await generateSpecchioDomande({
      capitoloSlug: capitolo.slug,
      capitoloTitolo: capitoloDef.titolo,
      tematica: capitoloDef.tematica,
      giorno: capitolo.giornoCorrente,
      giorniTotali: capitoloDef.giorni,
      rispostePrecedenti,
      profile: {
        sunSign: profile?.sunSign || undefined,
        moonSign: profile?.moonSign || undefined,
        risingSign: profile?.risingSign || undefined,
        shadows: profile?.shadows,
        strengths: profile?.strengths,
      },
    });

    return NextResponse.json({ domande, giorno: capitolo.giornoCorrente });
  } catch (e) {
    console.error("Failed to generate specchio domande:", e);
    return NextResponse.json(
      { error: "Le stelle stanno ancora leggendo. Riprova tra un momento." },
      { status: 500 }
    );
  }
}
