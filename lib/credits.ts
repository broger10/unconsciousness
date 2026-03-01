import { db } from "./db";
import { isPremium, getUserSubscription } from "./stripe";

export const CREDIT_COSTS = {
  compatibility: 10,
  lunar_ritual: 3,
  pdf_report: 20,
} as const;

export type CreditAction = keyof typeof CREDIT_COSTS;

/**
 * Check if user has enough credits for an action.
 * Premium users always have enough (unlimited).
 * Returns { allowed, isPremium, credits, cost }.
 */
export async function checkCredits(
  userId: string,
  action: CreditAction
): Promise<{
  allowed: boolean;
  isPremium: boolean;
  credits: number;
  cost: number;
}> {
  const cost = CREDIT_COSTS[action];

  const subscription = await getUserSubscription(userId);
  const userIsPremium = isPremium(subscription);

  if (userIsPremium) {
    return { allowed: true, isPremium: true, credits: -1, cost };
  }

  const profile = await db.profile.findUnique({
    where: { userId },
    select: { credits: true },
  });

  const credits = profile?.credits ?? 0;
  return { allowed: credits >= cost, isPremium: false, credits, cost };
}

/**
 * Deduct credits for an action.
 * Premium users are not charged.
 * Returns the new credit balance (-1 for premium).
 */
export async function deductCredits(
  userId: string,
  action: CreditAction
): Promise<number> {
  const cost = CREDIT_COSTS[action];

  const subscription = await getUserSubscription(userId);
  if (isPremium(subscription)) {
    return -1; // unlimited
  }

  const profile = await db.profile.update({
    where: { userId },
    data: { credits: { decrement: cost } },
    select: { credits: true },
  });

  return profile.credits;
}

/**
 * Get current credit balance for a user.
 */
export async function getUserCredits(userId: string): Promise<number> {
  const profile = await db.profile.findUnique({
    where: { userId },
    select: { credits: true },
  });
  return profile?.credits ?? 0;
}
