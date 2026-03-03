import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// POST: voluntarily stop the session
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const body = await request.json();
  const { sessionId } = body;

  if (!sessionId) {
    return NextResponse.json(
      { error: "sessionId richiesto" },
      { status: 400 }
    );
  }

  const mirrorSession = await db.mirrorSession.findUnique({
    where: { id: sessionId },
  });

  if (!mirrorSession || mirrorSession.userId !== session.user.id) {
    return NextResponse.json({ error: "Non trovato" }, { status: 404 });
  }

  if (mirrorSession.status === "COMPLETE") {
    return NextResponse.json({ ok: true });
  }

  await db.mirrorSession.update({
    where: { id: sessionId },
    data: { status: "COMPLETE" },
  });

  return NextResponse.json({ ok: true });
}
