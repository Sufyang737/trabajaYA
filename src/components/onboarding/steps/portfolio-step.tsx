"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import StepIndicator from "@/components/onboarding/step-indicator";
import { Field, Input, Textarea } from "@/components/ui/form";
import { saveOnboardingPart, STEP_PATHS } from "@/components/onboarding/api";

export default function PortfolioStep() {
  const router = useRouter();
  const [cv_url, setCv] = useState("");
  const [courses_url, setCourses] = useState("");
  const [diplomas_url, setDiplomas] = useState("");
  const [links, setLinks] = useState("{}");
  const [error, setError] = useState<string | null>(null);

  async function next() {
    try {
      setError(null);
      await saveOnboardingPart({ portfolio: { cv_url, courses_url, diplomas_url, links } });
      router.push(STEP_PATHS[4]);
    } catch (e: any) {
      setError(e?.message || "Error guardando portfolio");
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 bg-white min-h-screen">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Portfolio</h1>
        <p className="mt-2 text-sm text-black/70">Enlaces opcionales a tu CV, cursos y diplomas.</p>
      </div>
      <div className="mb-8">
        <StepIndicator steps={["Perfil", "Intereses", "Disponibilidad", "Portfolio", "Preferencias", "Confirmación"]} current={3} />
      </div>
      <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
        <Field label="CV URL">
          <Input placeholder="https://..." value={cv_url} onChange={(e) => setCv(e.target.value)} />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Cursos URL">
            <Input placeholder="https://..." value={courses_url} onChange={(e) => setCourses(e.target.value)} />
          </Field>
          <Field label="Diplomas URL">
            <Input placeholder="https://..." value={diplomas_url} onChange={(e) => setDiplomas(e.target.value)} />
          </Field>
        </div>
        <Field label="Links adicionales (JSON opcional)">
          <Textarea placeholder='{"github":"https://github.com/usuario"}' value={links} onChange={(e) => setLinks(e.target.value)} />
        </Field>
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
