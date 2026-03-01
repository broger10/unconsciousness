import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { OnboardingFlow } from "./onboarding-flow";

export default async function OnboardingPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const profile = await db.profile.findUnique({
    where: { userId: session.user.id },
    select: { onboardingComplete: true },
  });

  if (profile?.onboardingComplete) {
    redirect("/oggi");
  }

  const firstName = session.user.name?.split(" ")[0] || "";

  return <OnboardingFlow userName={firstName} />;
}
