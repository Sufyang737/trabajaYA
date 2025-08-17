"use client";

import { usePathname } from "next/navigation";
import HomeHeader from "@/components/home/home-header";

export default function HeaderGate() {
  const pathname = usePathname();
  if (pathname?.startsWith("/onboarding")) return null;
  return <HomeHeader />;
}
