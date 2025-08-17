import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import InterestsStep from "@/components/onboarding/steps/interests-step";

export default async function Page() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  return <InterestsStep />;
}

