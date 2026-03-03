import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateMirrorDescent } from "@/lib/ai";

// POST: save answer and generate reflection + next question (Agent 2: Il Discesore)
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const userId = session.user.id;
  const body = await request.json();
  const { answerId, answerChosen, answerFree } = body;

  if (!answerId || (!answerChosen && !answerFree)) {
    return NextResponse.json(
      { error: "Risposta non valida" },
      { status: 400 }
    );
  }

  // Find the answer and verify ownership
  const answer = await db.mirrorAnswer.findUnique({
    where: { id: answerId },
    include: {
      session: {
        include: {
          answers: { orderBy: { depth: "asc" } },
        },
      },
    },
  });

  if (!answer || answer.session.userId !== userId) {
    return NextResponse.json({ error: "Non trovato" }, { status: 404 });
  }

  if (answer.session.status === "COMPLETE") {
    return NextResponse.json(
      { error: "Sessione già completata" },
      { status: 400 }
    );
  }

  // Update the answer with user's response
  await db.mirrorAnswer.update({
    where: { id: answerId },
    data: {
      answerChosen: answerChosen || null,
      answerFree: answerFree || null,
    },
  });

  // Fetch profile + recent answers for context
  const [profile, recentAnswers] = await Promise.all([
    db.profile.findUnique({
      where: { userId },
      select: {
        sunSign: true,
        moonSign: true,
        risingSign: true,
        shadows: true,
        strengths: true,
      },
    }),
    db.mirrorAnswer.findMany({
      where: {
        session: { userId },
        NOT: { sessionId: answer.sessionId },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        question: true,
        answerChosen: true,
        answerFree: true,
        createdAt: true,
      },
    }),
  ]);

  // Build session answers context
  const sessionAnswers = answer.session.answers
    .filter((a) => a.answerChosen || a.answerFree || a.id === answerId)
    .map((a) => ({
      depth: a.depth,
      question: a.question,
      answer:
        a.id === answerId
          ? answerFree || answerChosen || ""
          : a.answerFree || a.answerChosen || "",
    }));

  // Find the astroContext from the first answer of the session
  const firstAnswer = answer.session.answers[0];
  const astroContext = firstAnswer?.astroContext || "";

  try {
    const result = await generateMirrorDescent({
      currentQuestion: answer.question,
      currentAnswer: answerFree || answerChosen || "",
      astroContext,
      currentDepth: answer.depth,
      sessionAnswers,
      recentAnswers: recentAnswers.map((a) => ({
        date: a.createdAt.toISOString().split("T")[0],
        question: a.question,
        answer: a.answerFree || a.answerChosen || "",
      })),
      profile: {
        sunSign: profile?.sunSign || undefined,
        moonSign: profile?.moonSign || undefined,
        risingSign: profile?.risingSign || undefined,
        shadows: profile?.shadows,
        strengths: profile?.strengths,
      },
    });

    // Save reflection on the current answer
    await db.mirrorAnswer.update({
      where: { id: answerId },
      data: { reflection: result.reflection },
    });

    if (result.shouldContinue && result.nextQuestion && result.nextOptions) {
      // Create next depth answer
      const nextAnswer = await db.mirrorAnswer.create({
        data: {
          sessionId: answer.sessionId,
          depth: result.depth,
          question: result.nextQuestion,
          options: JSON.parse(JSON.stringify(result.nextOptions)),
          astroContext,
        },
      });

      // Update session depth
      await db.mirrorSession.update({
        where: { id: answer.sessionId },
        data: { depth: result.depth },
      });

      return NextResponse.json({
        reflection: result.reflection,
        nextQuestion: result.nextQuestion,
        nextOptions: result.nextOptions,
        answerId: nextAnswer.id,
        depth: result.depth,
        sessionComplete: false,
      });
    }

    // Session complete
    await db.mirrorSession.update({
      where: { id: answer.sessionId },
      data: { status: "COMPLETE" },
    });

    return NextResponse.json({
      reflection: result.reflection,
      nextQuestion: null,
      nextOptions: null,
      sessionComplete: true,
    });
  } catch (error) {
    console.error("Mirror descent error:", error);
    return NextResponse.json(
      { error: "Errore nella discesa" },
      { status: 500 }
    );
  }
}
