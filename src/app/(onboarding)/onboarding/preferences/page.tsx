import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import PreferencesStep from "@/components/onboarding/steps/preferences-step";

export default async function Page() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  return <PreferencesStep />;
}

