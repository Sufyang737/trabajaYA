import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import PortfolioStep from "@/components/onboarding/steps/portfolio-step";

export default async function Page() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  return <PortfolioStep />;
}

