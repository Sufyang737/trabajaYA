import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ProfileStep from "@/components/onboarding/steps/profile-step";

export default async function Page() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  return <ProfileStep />;
}

