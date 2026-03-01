import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateOnboardingQuestion, generateProfile } from "@/lib/ai";

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  await db.onboardingResponse.deleteMany({
    where: { userId: session.user.id },
  });

  return NextResponse.json({ success: true });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const { answer, step } = await req.json();

  if (step !== undefined && (typeof step !== "number" || step < 0 || step > 15)) {
    return NextResponse.json({ error: "Step non valido" }, { status: 400 });
  }
  if (answer !== undefined && (typeof answer !== "string" || answer.length > 5000)) {
    return NextResponse.json({ error: "Risposta troppo lunga" }, { status: 400 });
  }

  // Get profile for chart data
  const profile = await db.profile.findUnique({
    where: { userId: session.user.id },
  });

  const chartData = profile
    ? {
        sunSign: profile.sunSign || undefined,
        moonSign: profile.moonSign || undefined,
        risingSign: profile.risingSign || undefined,
        chironSign: profile.chironSign || undefined,
        shadows: profile.shadows || [],
      }
    : undefined;

  // Save the answer if provided
  if (answer !== undefined && step > 0) {
    const previousResponses = await db.onboardingResponse.findMany({
      where: { userId: session.user.id },
      orderBy: { step: "asc" },
    });

    const lastQuestion =
      previousResponses[previousResponses.length - 1]?.question || "";

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
      allResponses.map((r: { question: string; answer: string }) => ({
        question: r.question,
        answer: r.answer,
      })),
      chartData
    );

    await db.profile.upsert({
      where: { userId: session.user.id },
      update: {
        awarenessScore: profileData.awarenessScore,
        values: profileData.values,
        blindSpots: profileData.blindSpots,
        strengths: profileData.strengths,
        shadows: profileData.shadows || [],
        personalitySummary: profileData.personalitySummary,
        onboardingComplete: true,
      },
      create: {
        userId: session.user.id,
        awarenessScore: profileData.awarenessScore,
        values: profileData.values,
        blindSpots: profileData.blindSpots,
        strengths: profileData.strengths,
        shadows: profileData.shadows || [],
        personalitySummary: profileData.personalitySummary,
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
    allResponses.map((r: { question: string; answer: string }) => ({
      question: r.question,
      answer: r.answer,
    })),
    allResponses.length,
    chartData
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
