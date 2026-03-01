import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // If onboarding already complete, send to app
  const profile = await db.profile.findUnique({
    where: { userId: session.user.id },
    select: { onboardingComplete: true },
  });

  if (profile?.onboardingComplete) {
    redirect("/oggi");
  }

  return <>{children}</>;
}
