import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AvailabilityStep from "@/components/onboarding/steps/availability-step";

export default async function Page() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  return <AvailabilityStep />;
}

