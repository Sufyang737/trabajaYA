"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import StepIndicator from "@/components/onboarding/step-indicator";
import { saveOnboardingPart, STEP_PATHS } from "@/components/onboarding/api";

export default function PreferencesStep() {
  const router = useRouter();
  const [roles, setRoles] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  function toggle(role: "provider" | "worker" | "creator") {
    setRoles((r) => (r.includes(role) ? r.filter((x) => x !== role) : [...r, role]));
  }

  async function next() {
    try {
      setError(null);
      if (!roles.length) throw new Error("Elegí al menos un rol");
      await saveOnboardingPart({ profile: { roles }, roles });
      router.push(STEP_PATHS[5]);
    } catch (e: any) {
      setError(e?.message || "Error guardando preferencias");
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 bg-white min-h-screen">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Preferencias</h1>
        <p className="mt-2 text-sm text-black/70">Elegí tus roles en la plataforma.</p>
      </div>
      <div className="mb-8">
        <StepIndicator steps={["Perfil", "Intereses", "Disponibilidad", "Portfolio", "Preferencias", "Confirmación"]} current={4} />
      </div>
      <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => toggle("provider")}
            className={
              "inline-flex h-10 items-center justify-center rounded-lg border px-4 text-sm font-medium shadow-sm transition " +
              (roles.includes("provider") ? "border-transparent bg-brand text-brand-foreground" : "border-black/10 bg-white hover:bg-slate-50")
            }
          >
            Provider
          </button>
          <button
            type="button"
            onClick={() => toggle("worker")}
            className={
              "inline-flex h-10 items-center justify-center rounded-lg border px-4 text-sm font-medium shadow-sm transition " +
              (roles.includes("worker") ? "border-transparent bg-brand text-brand-foreground" : "border-black/10 bg-white hover:bg-slate-50")
            }
          >
            Worker
          </button>
          <button
            type="button"
            onClick={() => toggle("creator")}
            className={
              "inline-flex h-10 items-center justify-center rounded-lg border px-4 text-sm font-medium shadow-sm transition " +
              (roles.includes("creator") ? "border-transparent bg-brand text-brand-foreground" : "border-black/10 bg-white hover:bg-slate-50")
            }
          >
            Creator
          </button>
        </div>
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        <div className="mt-6 flex justify-end">
          <button onClick={next} className="btn btn-primary">
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}
