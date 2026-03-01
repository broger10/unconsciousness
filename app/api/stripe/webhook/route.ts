import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import Stripe from "stripe";

function getPeriodDates(sub: Stripe.Subscription) {
  const item = sub.items.data[0];
  return {
    start: item?.current_period_start ? new Date(item.current_period_start * 1000) : new Date(),
    end: item?.current_period_end ? new Date(item.current_period_end * 1000) : new Date(),
  };
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (subscriptionId && customerId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId);
          const period = getPeriodDates(sub);
          // Use upsert to handle race condition where subscription record may not exist yet
          await db.subscription.upsert({
            where: { stripeCustomerId: customerId },
            update: {
              stripeSubscriptionId: subscriptionId,
              stripePriceId: sub.items.data[0]?.price.id || null,
              status: "active",
              plan: session.metadata?.plan || "monthly",
              currentPeriodStart: period.start,
              currentPeriodEnd: period.end,
            },
            create: {
              userId: (session.metadata?.userId || session.client_reference_id) as string,
              stripeCustomerId: customerId,
              stripeSubscriptionId: subscriptionId,
              stripePriceId: sub.items.data[0]?.price.id || null,
              status: "active",
              plan: session.metadata?.plan || "monthly",
              currentPeriodStart: period.start,
              currentPeriodEnd: period.end,
            },
          });
        }
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice & { subscription?: string | { id: string } };
        const subscriptionId = typeof invoice.subscription === "string"
          ? invoice.subscription
          : invoice.subscription?.id;

        if (subscriptionId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId);
          const customerId = sub.customer as string;
          const period = getPeriodDates(sub);

          try {
            await db.subscription.update({
              where: { stripeCustomerId: customerId },
              data: {
                status: "active",
                currentPeriodStart: period.start,
                currentPeriodEnd: period.end,
              },
            });
          } catch {
            // Record may not exist yet — checkout webhook may not have arrived
            console.error(`[webhook] invoice.paid: subscription not found for customer ${customerId}`);
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;
        const period = getPeriodDates(sub);

        try {
          await db.subscription.update({
            where: { stripeCustomerId: customerId },
            data: {
              status: sub.status === "active" ? "active" : sub.status === "past_due" ? "past_due" : "canceled",
              cancelAtPeriodEnd: sub.cancel_at_period_end,
              currentPeriodStart: period.start,
              currentPeriodEnd: period.end,
            },
          });
        } catch {
          console.error(`[webhook] subscription.updated: not found for customer ${customerId}`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;

        try {
          await db.subscription.update({
            where: { stripeCustomerId: customerId },
            data: {
              status: "canceled",
              plan: "free",
              stripeSubscriptionId: null,
              stripePriceId: null,
            },
          });
        } catch {
          console.error(`[webhook] subscription.deleted: not found for customer ${customerId}`);
        }
        break;
      }
    }
  } catch (err) {
    console.error(`[webhook] Error processing ${event.type}:`, err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
