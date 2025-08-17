import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ConfirmStep from "@/components/onboarding/steps/confirm-step";

export default async function Page() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  return <ConfirmStep />;
}

