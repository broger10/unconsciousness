import Stripe from "stripe";
import { db } from "./db";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY non configurata");
  return new Stripe(key);
}

// Lazy init — only created when actually called
let _stripe: Stripe | null = null;
export function getStripeClient() {
  if (!_stripe) _stripe = getStripe();
  return _stripe;
}

// Backward compat export (used in routes)
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return (getStripeClient() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export const PLANS = {
  monthly: {
    priceId: process.env.STRIPE_PRICE_MONTHLY!,
    price: "€6,99",
    interval: "mese",
    name: "Premium Mensile",
  },
  yearly: {
    priceId: process.env.STRIPE_PRICE_YEARLY!,
    price: "€49,99",
    interval: "anno",
    name: "Premium Annuale",
    savings: "Risparmi il 40%",
  },
} as const;

export async function getUserSubscription(userId: string) {
  const sub = await db.subscription.findUnique({
    where: { userId },
  });
  return sub;
}

export function isPremium(subscription: { status: string; currentPeriodEnd: Date | null } | null): boolean {
  if (!subscription) return false;
  if (subscription.status !== "active") return false;
  if (subscription.currentPeriodEnd && subscription.currentPeriodEnd < new Date()) return false;
  return true;
}

export async function getOrCreateCustomer(userId: string, email: string, name?: string) {
  const existing = await db.subscription.findUnique({
    where: { userId },
  });

  if (existing) {
    return existing.stripeCustomerId;
  }

  const customer = await stripe.customers.create({
    email,
    name: name || undefined,
    metadata: { userId },
  });

  await db.subscription.create({
    data: {
      userId,
      stripeCustomerId: customer.id,
      status: "free",
      plan: "free",
    },
  });

  return customer.id;
}
