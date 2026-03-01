import { db } from "./db";

export const CREDIT_COSTS = {
  daily_horoscope: 3,
  chat_message: 5,
  journal_reflection: 3,
  visions: 15,
  checkin_insight: 2,
} as const;

export type CreditAction = keyof typeof CREDIT_COSTS;

/**
 * Check if user has enough credits OR is a premium subscriber.
 */
export async function canUseFeature(userId: string, action: CreditAction): Promise<boolean> {
  const subscription = await db.subscription.findUnique({
    where: { userId },
    select: { status: true },
  });

  if (subscription?.status === "active") return true;

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { credits: true },
  });

  return (user?.credits ?? 0) >= CREDIT_COSTS[action];
}

/**
 * Atomically deduct credits. Uses UPDATE ... WHERE credits >= cost
 * to prevent race conditions and negative balances.
 * Premium users skip deduction entirely.
 */
export async function useCredits(userId: string, action: CreditAction): Promise<boolean> {
  const subscription = await db.subscription.findUnique({
    where: { userId },
    select: { status: true },
  });

  if (subscription?.status === "active") return true;

  const cost = CREDIT_COSTS[action];

  // Atomic: only decrements if credits >= cost (prevents negative balance)
  const result = await db.$executeRaw`
    UPDATE "User" SET credits = credits - ${cost}
    WHERE id = ${userId} AND credits >= ${cost}
  `;

  // result = number of rows affected. 0 means insufficient credits.
  return result > 0;
}

/**
 * Get user's current credit balance.
 */
export async function getCredits(userId: string): Promise<number> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { credits: true },
  });
  return user?.credits ?? 0;
}
