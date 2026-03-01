import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe, getOrCreateCustomer } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const { product } = await req.json() as { product: string };

  if (product !== "pdf_report") {
    return NextResponse.json({ error: "Prodotto non valido" }, { status: 400 });
  }

  const customerId = await getOrCreateCustomer(
    session.user.id,
    session.user.email,
    session.user.name || undefined
  );

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: "Il Tuo Tema Natale Completo — PDF",
            description: "Report PDF premium con tutti i 10 pianeti, lo Specchio Cosmico, Doni e Valori, Ferita di Chirone e la tua Mitologia personale.",
          },
          unit_amount: 499, // €4.99
        },
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://unconsciousness.vercel.app"}/api/pdf-report`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://unconsciousness.vercel.app"}/mappa`,
    metadata: {
      userId: session.user.id,
      product: "pdf_report",
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
