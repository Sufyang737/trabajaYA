"use client";

export default function OnboardingProgress({ current, total }: { current: number; total: number }) {
  const pct = Math.round(((current + 1) / total) * 100);
  return (
    <div className="mb-4">
      <div className="h-2 w-full rounded-full bg-black/5">
        <div
          className="h-2 rounded-full bg-brand transition-all duration-500"
          style={{ width: `${pct}%` }}
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
