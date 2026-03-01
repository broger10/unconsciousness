import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  await db.profile.update({
    where: { userId: session.user.id },
    data: { onboardingComplete: true },
  });

  return NextResponse.json({ success: true });
}
