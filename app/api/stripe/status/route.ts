import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserSubscription, isPremium } from "@/lib/stripe";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const subscription = await getUserSubscription(session.user.id);

  return NextResponse.json({
    isPremium: isPremium(subscription),
    plan: subscription?.plan || "free",
    status: subscription?.status || "free",
    currentPeriodEnd: subscription?.currentPeriodEnd || null,
    cancelAtPeriodEnd: subscription?.cancelAtPeriodEnd || false,
  });
}
