"use client";

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
            <span
              className={
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium " +
                (active ? "bg-brand text-brand-foreground" : "bg-black/5 text-black/60")
              }
            >
              {idx + 1}
            </span>
            <span className="text-sm font-medium text-black/70">{label}</span>
          </li>
        );
      })}
    </ol>
  );
}
