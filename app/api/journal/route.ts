import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateJournalReflection } from "@/lib/ai";
import { useCredits } from "@/lib/credits";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const { content } = await req.json();
  if (!content || typeof content !== "string" || !content.trim()) {
    return NextResponse.json({ error: "Contenuto vuoto" }, { status: 400 });
  }
  if (content.length > 10000) {
    return NextResponse.json({ error: "Contenuto troppo lungo (max 10000 caratteri)" }, { status: 400 });
  }

  const hasCredits = await useCredits(session.user.id, "journal_reflection");
  if (!hasCredits) {
    return NextResponse.json({ error: "Crediti esauriti", needsUpgrade: true }, { status: 402 });
  }

  const profile = await db.profile.findUnique({
    where: { userId: session.user.id },
  });

  let aiReflection: string | null = null;
  if (profile) {
    try {
      aiReflection = await generateJournalReflection(
        {
          sunSign: profile.sunSign || undefined,
          moonSign: profile.moonSign || undefined,
          risingSign: profile.risingSign || undefined,
          shadows: profile.shadows,
        },
        content
      );
    } catch {
      aiReflection = null;
    }
  }

  const journal = await db.journal.create({
    data: {
      userId: session.user.id,
      content,
      aiReflection,
    },
  });

  return NextResponse.json({ journal });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const journals = await db.journal.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ journals });
}
