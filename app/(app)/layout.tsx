import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { BottomTabBar } from "@/components/bottom-tab-bar";
import { Paywall } from "@/components/paywall";
import { SplashScreen } from "@/components/splash-screen";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Parallelize all DB queries — runs in ~1 round-trip instead of 3
  const [profile, user, subscription] = await Promise.all([
    db.profile.findUnique({
      where: { userId: session.user.id },
      select: { onboardingComplete: true },
    }),
    db.user.findUnique({
      where: { id: session.user.id },
      select: { credits: true, name: true },
    }),
    db.subscription.findUnique({
      where: { userId: session.user.id },
      select: { status: true },
    }),
  ]);

  if (!profile?.onboardingComplete) {
    redirect("/onboarding");
  }

  const isPremium = subscription?.status === "active";
  const credits = user?.credits ?? 0;

  if (!isPremium && credits <= 0) {
    return (
      <div className="min-h-screen">
        <Paywall userName={user?.name?.split(" ")[0]} />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SplashScreen />
      <main className="pb-24">{children}</main>
      <BottomTabBar />
    </div>
  );
}
