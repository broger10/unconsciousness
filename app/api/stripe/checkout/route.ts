import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe, getOrCreateCustomer, PLANS } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const { plan } = await req.json() as { plan: string };
  if (plan !== "monthly" && plan !== "yearly") {
    return NextResponse.json({ error: "Piano non valido" }, { status: 400 });
  }

  const customerId = await getOrCreateCustomer(
    session.user.id,
    session.user.email,
    session.user.name || undefined
  );

  const priceId = PLANS[plan as keyof typeof PLANS].priceId;

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://unconsciousness.vercel.app"}/profilo?upgraded=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://unconsciousness.vercel.app"}/profilo`,
    metadata: {
      userId: session.user.id,
      plan,
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
