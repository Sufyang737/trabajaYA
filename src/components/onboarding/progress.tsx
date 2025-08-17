"use client";

import { motion } from "framer-motion";

export default function OnboardingProgress({ current, total }: { current: number; total: number }) {
  const pct = Math.round(((current + 1) / total) * 100);
  return (
    <div className="mb-4">
      <div className="h-2 w-full overflow-hidden rounded-full bg-black/5">
        <motion.div
          className="h-2 rounded-full bg-brand"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4 }}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
          role="progressbar"
        />
      </div>
      <div className="mt-1 text-right text-xs text-black/60">{pct}%</div>
    </div>
  );
}
