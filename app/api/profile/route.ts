import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const profile = await db.profile.findUnique({
    where: { userId: session.user.id },
  });

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, image: true },
  });

  return NextResponse.json({ profile, user });
}
