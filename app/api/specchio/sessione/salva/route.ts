import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateSpecchioFeedback } from "@/lib/ai";
import { CAPITOLI } from "@/lib/specchio-capitoli";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const body = await request.json();
  const { capitoloId, domande } = body;

  if (!capitoloId || !domande || !Array.isArray(domande)) {
    return NextResponse.json({ error: "capitoloId e domande richiesti" }, { status: 400 });
  }

  const capitolo = await db.specchioCapitolo.findFirst({
    where: { id: capitoloId, userId: session.user.id, completedAt: null },
  });

  if (!capitolo) {
    return NextResponse.json({ error: "Capitolo non trovato o già completato" }, { status: 404 });
  }

  // Check if today's session already exists
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const existing = await db.specchioSessione.findFirst({
    where: {
      capitoloId,
      giorno: capitolo.giornoCorrente,
      createdAt: { gte: today, lt: tomorrow },
    },
  });

  if (existing) {
    return NextResponse.json({ error: "Sessione di oggi già completata" }, { status: 409 });
  }

  // Save session
  await db.specchioSessione.create({
    data: {
      capitoloId,
      giorno: capitolo.giornoCorrente,
      domande,
    },
  });

  const capitoloDef = CAPITOLI[capitolo.slug];
  const isUltimoGiorno = capitolo.giornoCorrente >= (capitoloDef?.giorni || 4);

  // Advance day or complete chapter
  if (isUltimoGiorno) {
    await db.specchioCapitolo.update({
      where: { id: capitoloId },
      data: { completedAt: new Date() },
    });
  } else {
    await db.specchioCapitolo.update({
      where: { id: capitoloId },
      data: { giornoCorrente: capitolo.giornoCorrente + 1 },
    });
  }

  // Generate feedback
  let feedback = "Hai fatto un passo in più verso te stesso.";
  try {
    const risposteOggi = domande.map((d: { domanda: string; risposta_scelta?: string; testo_libero?: string }) => ({
      domanda: d.domanda,
      risposta: d.testo_libero || d.risposta_scelta || "",
    }));
    feedback = await generateSpecchioFeedback({ risposteOggi });
  } catch {
    // Use default feedback
  }

  return NextResponse.json({
    feedback,
    isUltimoGiorno,
    capitoloCompletato: isUltimoGiorno,
  });
}
