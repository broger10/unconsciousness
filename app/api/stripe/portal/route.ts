import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const subscription = await db.subscription.findUnique({
    where: { userId: session.user.id },
  });

  if (!subscription?.stripeCustomerId) {
    return NextResponse.json({ error: "Nessun account Stripe" }, { status: 400 });
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://unconsciousness.vercel.app"}/profilo`,
  });

  return NextResponse.json({ url: portalSession.url });
}
