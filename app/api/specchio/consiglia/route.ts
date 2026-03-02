import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateSpecchioConsiglio } from "@/lib/ai";
import { CAPITOLI, CAPITOLI_SLUGS } from "@/lib/specchio-capitoli";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const userId = session.user.id;

  // Optional: accept a slug to start directly
  let body: { slug?: string } = {};
  try {
    body = await request.json();
  } catch {
    // No body is fine
  }

  // If slug provided, create chapter directly
  if (body.slug && CAPITOLI[body.slug]) {
    const existing = await db.specchioCapitolo.findUnique({
      where: { userId_slug: { userId, slug: body.slug } },
    });

    if (existing && !existing.completedAt) {
      return NextResponse.json({ capitoloId: existing.id, slug: existing.slug });
    }

    if (existing && existing.completedAt) {
      return NextResponse.json({ error: "Capitolo già completato" }, { status: 409 });
    }

    const nuovo = await db.specchioCapitolo.create({
      data: { userId, slug: body.slug },
    });

    return NextResponse.json({ capitoloId: nuovo.id, slug: nuovo.slug });
  }

  // Otherwise, get AI recommendations
  const completati = await db.specchioCapitolo.findMany({
    where: { userId, completedAt: { not: null } },
    select: { slug: true, ritratto: true },
    orderBy: { completedAt: "desc" },
  });

  const slugCompletati = completati.map((c) => c.slug);
  const disponibili = CAPITOLI_SLUGS.filter((s) => !slugCompletati.includes(s));

  if (disponibili.length === 0) {
    return NextResponse.json({ consigli: [], tuttiCompletati: true });
  }

  if (disponibili.length <= 2) {
    // Just return what's left
    const consigli = disponibili.map((slug) => ({
      slug,
      motivazione: CAPITOLI[slug].descrizione,
    }));
    return NextResponse.json({ consigli });
  }

  const profile = await db.profile.findUnique({
    where: { userId },
    select: { sunSign: true, moonSign: true, risingSign: true },
  });

  try {
    const consigli = await generateSpecchioConsiglio({
      capitoliCompletati: completati,
      capitoliDisponibili: disponibili,
      ultimoRitratto: completati[0]?.ritratto || undefined,
      profile: {
        sunSign: profile?.sunSign || undefined,
        moonSign: profile?.moonSign || undefined,
        risingSign: profile?.risingSign || undefined,
      },
    });

    // Save recommendation
    if (consigli.length >= 2) {
      await db.specchioConsiglio.create({
        data: {
          userId,
          slugCapitolo1: consigli[0].slug,
          slugCapitolo2: consigli[1].slug,
          motivazione1: consigli[0].motivazione,
          motivazione2: consigli[1].motivazione,
        },
      });
    }

    return NextResponse.json({ consigli });
  } catch (e) {
    console.error("Failed to generate specchio consiglio:", e);
    // Fallback: return first 2 available
    const fallback = disponibili.slice(0, 2).map((slug) => ({
      slug,
      motivazione: CAPITOLI[slug].descrizione,
    }));
    return NextResponse.json({ consigli: fallback });
  }
}
