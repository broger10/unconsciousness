import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

function getToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

// GET: check today's mirror session state
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const userId = session.user.id;
  const today = getToday();

  const [mirrorSession, totalAnswerCount] = await Promise.all([
    db.mirrorSession.findUnique({
      where: { userId_date: { userId, date: today } },
      include: { answers: { orderBy: { depth: "asc" } } },
    }),
    db.mirrorAnswer.count({
      where: { session: { userId } },
    }),
  ]);

  if (!mirrorSession) {
    return NextResponse.json({
      status: "NEW",
      session: null,
      answers: [],
      totalAnswerCount,
    });
  }

  return NextResponse.json({
    status: mirrorSession.status,
    session: {
      id: mirrorSession.id,
      depth: mirrorSession.depth,
      status: mirrorSession.status,
    },
    answers: mirrorSession.answers.map((a) => ({
      id: a.id,
      depth: a.depth,
      question: a.question,
      options: a.options,
      answerChosen: a.answerChosen,
      answerFree: a.answerFree,
      reflection: a.reflection,
    })),
    totalAnswerCount,
  });
}
