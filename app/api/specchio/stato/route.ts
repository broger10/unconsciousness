import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const userId = session.user.id;

  // Find active chapter (started but not completed)
  const capitoloAttivo = await db.specchioCapitolo.findFirst({
    where: { userId, completedAt: null },
    include: { sessioni: { orderBy: { createdAt: "desc" }, take: 1 } },
  });

  // Check if today's session is already done
  let sessioneOggiCompletata = false;
  if (capitoloAttivo) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const sessioneOggi = await db.specchioSessione.findFirst({
      where: {
        capitoloId: capitoloAttivo.id,
        giorno: capitoloAttivo.giornoCorrente,
        createdAt: { gte: today, lt: tomorrow },
      },
    });
    sessioneOggiCompletata = !!sessioneOggi;
  }

  // Check if a chapter was just completed today
  let capitoloAppenaCompletato = false;
  if (!capitoloAttivo) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const completatoOggi = await db.specchioCapitolo.findFirst({
      where: {
        userId,
        completedAt: { gte: today, lt: tomorrow },
      },
      orderBy: { completedAt: "desc" },
    });
    capitoloAppenaCompletato = !!completatoOggi;
  }

  // Get all completed chapters
  const capitoliCompletati = await db.specchioCapitolo.findMany({
    where: { userId, completedAt: { not: null } },
    select: { slug: true, ritratto: true, ritrattoInsights: true, completedAt: true },
    orderBy: { completedAt: "desc" },
  });

  // Total chapters ever started
  const totalCapitoli = await db.specchioCapitolo.count({ where: { userId } });

  return NextResponse.json({
    capitoloAttivo: capitoloAttivo
      ? {
          id: capitoloAttivo.id,
          slug: capitoloAttivo.slug,
          giornoCorrente: capitoloAttivo.giornoCorrente,
          ritratto: capitoloAttivo.ritratto,
          ritrattoInsights: capitoloAttivo.ritrattoInsights,
        }
      : null,
    sessioneOggiCompletata,
    capitoloAppenaCompletato,
    capitoliCompletati,
    maiIniziato: totalCapitoli === 0,
  });
}
