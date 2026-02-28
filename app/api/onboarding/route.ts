import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateOnboardingQuestion, generateProfile } from "@/lib/ai";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const { answer, step } = await req.json();

  // Save the answer if provided
  if (answer !== undefined && step > 0) {
    const previousResponses = await db.onboardingResponse.findMany({
      where: { userId: session.user.id },
      orderBy: { step: "asc" },
    });

    const lastQuestion = previousResponses[previousResponses.length - 1]?.question || "";

    await db.onboardingResponse.create({
      data: {
        userId: session.user.id,
        step,
        question: lastQuestion,
        answer,
      },
    });
  }

  // Get all responses so far
  const allResponses = await db.onboardingResponse.findMany({
    where: { userId: session.user.id },
    orderBy: { step: "asc" },
  });

  // If we have 10 responses, generate the profile
  if (allResponses.length >= 10) {
    const profileData = await generateProfile(
      allResponses.map((r: { question: string; answer: string }) => ({ question: r.question, answer: r.answer }))
    );

    await db.profile.upsert({
      where: { userId: session.user.id },
      update: {
        ...profileData,
        onboardingComplete: true,
      },
      create: {
        userId: session.user.id,
        ...profileData,
        onboardingComplete: true,
      },
    });

    return NextResponse.json({
      complete: true,
      profile: profileData,
    });
  }

  // Generate next question
  const question = await generateOnboardingQuestion(
    allResponses.map((r: { question: string; answer: string }) => ({ question: r.question, answer: r.answer })),
    allResponses.length
  );

  // Save the question for the next step
  if (allResponses.length === 0 || answer !== undefined) {
    await db.onboardingResponse.create({
      data: {
        userId: session.user.id,
        step: allResponses.length + 1,
        question,
        answer: "",
      },
    });
  }

  return NextResponse.json({
    complete: false,
    question,
    step: allResponses.length + 1,
    totalSteps: 10,
  });
}
