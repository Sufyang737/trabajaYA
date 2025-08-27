"use client";

import { useState } from "react";

type Props = {
  resumen: React.ReactNode;
  portfolio: React.ReactNode;
  servicios: React.ReactNode;
  resenas: React.ReactNode;
};

export default function JobProfileTabs({ resumen, portfolio, servicios, resenas }: Props) {
  const [tab, setTab] = useState<"resumen" | "portfolio" | "servicios" | "resenas">("resumen");

  const tabs = [
    { key: "resumen", label: "Resumen" },
    { key: "portfolio", label: "Portfolio" },
    { key: "servicios", label: "Servicios" },
    { key: "resenas", label: "Reseñas" },
  ] as const;

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-6">
      <div className="mb-4 flex items-center gap-4 text-sm">
        {tabs.map((t) => (
          <button
            key={t.key}
            className={
              (tab === t.key ? "border-b-2 border-brand text-brand" : "text-black/60") +
              " pb-1 font-medium"
            }
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="grid gap-4">
        {tab === "resumen" && resumen}
        {tab === "portfolio" && portfolio}
        {tab === "servicios" && servicios}
        {tab === "resenas" && resenas}
      </div>
    </div>
  );
}

