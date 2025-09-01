"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import StepIndicator from "@/components/onboarding/step-indicator";
import OnboardingProgress from "@/components/onboarding/progress";
import { saveOnboardingPart } from "@/components/onboarding/api";

export default function ConfirmStep() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function finish() {
    try {
      setLoading(true);
      setError(null);
      await saveOnboardingPart({ finalize: true });
      setMessage("¡Onboarding completado!");
      setTimeout(() => router.push("/"), 900);
    } catch (e: any) {
      setError(e?.message || "No pudimos finalizar el onboarding");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 bg-white min-h-screen animate-fade-in">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Confirmación</h1>
        <p className="mt-2 text-sm text-black/70">Revisá y finalizá el proceso.</p>
      </div>
      <div className="mb-4">
        <OnboardingProgress current={4} total={5} />
      </div>
      <div className="mb-8 animate-slide-up">
        <StepIndicator steps={["Perfil", "Intereses", "Disponibilidad", "Portfolio", "Confirmación"]} current={4} />
      </div>
      <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm animate-slide-up">
        <p className="text-sm text-black/70">Si necesitás, podés volver atrás y ajustar algún paso antes de finalizar.</p>
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        {message && <p className="mt-4 text-sm text-emerald-600">{message}</p>}
        <div className="mt-6 flex justify-end">
          <button
            onClick={finish}
            disabled={loading}
            className="btn btn-primary shadow-sm disabled:opacity-60"
          >
            {loading ? "Finalizando..." : "Finalizar"}
          </button>
        </div>
      </div>
    </div>
  );
}
