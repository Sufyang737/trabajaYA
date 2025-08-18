"use client";

import * as Progress from "@radix-ui/react-progress";
import { motion } from "motion/react";

export default function OnboardingProgress({ current, total }: { current: number; total: number }) {
  const pct = Math.round(((current + 1) / total) * 100);
  return (
    <div className="mb-4">
      <Progress.Root className="h-2 w-full overflow-hidden rounded-full bg-black/5" value={pct}>
        <Progress.Indicator asChild>
          <motion.div
            className="h-full bg-brand"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ type: "spring", bounce: 0.2 }}
          />
        </Progress.Indicator>
      </Progress.Root>
      <div className="mt-1 text-right text-xs text-black/60">{pct}%</div>
    </div>
  );
}
