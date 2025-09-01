"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ClientRedirect({ to, replace = true }: { to: string; replace?: boolean }) {
  const router = useRouter();
  useEffect(() => {
    if (replace) router.replace(to);
    else router.push(to);
  }, [router, to, replace]);
  return null;
}

