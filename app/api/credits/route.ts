import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserCredits } from "@/lib/credits";
import { isPremium, getUserSubscription } from "@/lib/stripe";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const subscription = await getUserSubscription(session.user.id);
  const userIsPremium = isPremium(subscription);

  if (userIsPremium) {
    return NextResponse.json({ credits: -1, isPremium: true });
  }

  const credits = await getUserCredits(session.user.id);
  return NextResponse.json({ credits, isPremium: false });
}
