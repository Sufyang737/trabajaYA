"use client";

import { motion } from "motion/react";

type StepIndicatorProps = {
  steps: string[];
  current: number;
};

export default function StepIndicator({ steps, current }: StepIndicatorProps) {
  return (
    <ol className="flex w-full items-center justify-center gap-6">
      {steps.map((label, idx) => {
        const active = idx <= current;
        return (
          <li key={label} className="flex items-center gap-3">
            <motion.span
              className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium"
              animate={{
                backgroundColor: active ? "var(--brand)" : "rgba(0,0,0,0.05)",
                color: active ? "var(--brand-foreground)" : "rgba(0,0,0,0.6)",
                scale: active ? 1.1 : 1,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              {idx + 1}
            </motion.span>
            <span className="text-sm font-medium text-black/70">{label}</span>
          </li>
        );
      })}
    </ol>
  );
}
