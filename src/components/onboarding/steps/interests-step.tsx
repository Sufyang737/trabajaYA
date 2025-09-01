"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import StepIndicator from "@/components/onboarding/step-indicator";
import OnboardingProgress from "@/components/onboarding/progress";
import { CATEGORY_OPTIONS, SUBCATEGORY_OPTIONS, saveOnboardingPart, STEP_PATHS } from "@/components/onboarding/api";

type InterestItem = { category: string; subcategory?: string; is_job_seeker?: boolean; is_job_offerer?: boolean };

export default function InterestsStep() {
  const router = useRouter();
  const [items, setItems] = useState<InterestItem[]>([]);
  const [draft, setDraft] = useState<InterestItem>({
    category: CATEGORY_OPTIONS[0].key,
    subcategory: SUBCATEGORY_OPTIONS[CATEGORY_OPTIONS[0].key][0].key,
    is_job_seeker: true,
    is_job_offerer: false,
  });
  const [error, setError] = useState<string | null>(null);
  const subs = SUBCATEGORY_OPTIONS[draft.category as any] || [];
  const exists = useMemo(
    () => items.some((it) => it.category === draft.category && it.subcategory === draft.subcategory),
    [items, draft.category, draft.subcategory]
  );

  function add() {
    if (!draft.category || !draft.subcategory || exists) return;
    setItems((arr) => [...arr, draft]);
  }
  function remove(i: number) {
    setItems((arr) => arr.filter((_, idx) => idx !== i));
  }

  async function next() {
    try {
      setError(null);
      if (!items.length) throw new Error("Agregá al menos un interés");
      await saveOnboardingPart({ interests: items });
      router.push(STEP_PATHS[2]);
    } catch (e: any) {
      setError(e?.message || "Error guardando intereses");
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 bg-white min-h-screen animate-fade-in">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Intereses</h1>
        <p className="mt-2 text-sm text-black/70">Agregá tus categorías de interés.</p>
      </div>
      <div className="mb-4">
        <OnboardingProgress current={1} total={5} />
      </div>
      <div className="mb-8 animate-slide-up">
        <StepIndicator steps={["Perfil", "Intereses", "Disponibilidad", "Portfolio", "Confirmación"]} current={1} />
      </div>
      <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm animate-slide-up">
        {/* Category intro */}
        <div className="mb-2">
          <div className="text-sm font-medium text-black/80">Tipo de interés</div>
          <p className="text-xs text-black/60">Elegí una categoría general que describa tu área: Trabajadores, Creadores o Proveedores.</p>
        </div>

        {/* Category pills */}
        <div className="mb-4 flex flex-wrap gap-2">
          {CATEGORY_OPTIONS.map((c) => {
            const active = draft.category === c.key;
            return (
              <button
                key={c.key}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  const first = (SUBCATEGORY_OPTIONS[c.key] || [])[0]?.key;
                  setDraft((d) => ({ ...d, category: c.key as string, subcategory: first }));
                }}
                className={
                  "badge transition " +
                  (active ? "bg-brand text-brand-foreground border-transparent" : "bg-white hover:bg-[#f6f6f6]")
                }
              >
                {c.label}
              </button>
            );
          })}
        </div>

        {/* Subcategory grid */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {subs.map((s) => {
            const active = draft.subcategory === s.key;
            return (
              <button
                key={s.key}
                type="button"
                aria-pressed={active}
                onClick={() => setDraft((d) => ({ ...d, subcategory: s.key }))}
                className={
                  "flex items-center justify-between rounded-xl border px-4 py-3 text-left transition " +
                  (active ? "border-brand bg-[#fff5f5]" : "border-black/10 hover:bg-[#fafafa]")
                }
              >
                <span className="text-sm text-black/80">{s.label}</span>
                {active && (
                  <span className="rounded-full bg-brand px-2 py-0.5 text-xs text-brand-foreground">Elegido</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Role toggles improved */}
        <div className="mt-5 grid gap-2">
          <div className="flex items-baseline justify-between">
            <div>
              <div className="text-sm font-medium text-black/80">Rol en este interés</div>
              <div className="text-xs text-black/60">Podés elegir una o ambas opciones</div>
            </div>
            <div>
              <button type="button" onClick={add} disabled={exists || (!draft.is_job_seeker && !draft.is_job_offerer)} className="btn btn-primary disabled:opacity-50">
                {exists ? "Ya agregado" : "Agregar interés"}
              </button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              aria-pressed={Boolean(draft.is_job_seeker)}
              onClick={() => setDraft((d) => ({ ...d, is_job_seeker: !d.is_job_seeker }))}
              className={
                "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm transition " +
                (draft.is_job_seeker ? "border-transparent bg-brand text-brand-foreground" : "border-black/10 bg-white hover:bg-[#f6f6f6]")
              }
            >
              <span aria-hidden>🔎</span>
              Busco trabajo
            </button>
            <button
              type="button"
              aria-pressed={Boolean(draft.is_job_offerer)}
              onClick={() => setDraft((d) => ({ ...d, is_job_offerer: !d.is_job_offerer }))}
              className={
                "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm transition " +
                (draft.is_job_offerer ? "border-transparent bg-brand text-brand-foreground" : "border-black/10 bg-white hover:bg-[#f6f6f6]")
              }
            >
              <span aria-hidden>💼</span>
              Ofrezco trabajo
            </button>
          </div>
          {!draft.is_job_seeker && !draft.is_job_offerer && (
            <p className="text-xs text-red-600">Elegí al menos una opción.</p>
          )}
        </div>

        {/* Selected items */}
        <div className="mt-5 flex flex-wrap gap-2">
          {items.map((it, i) => {
            const catLabel = CATEGORY_OPTIONS.find((c) => c.key === it.category)?.label || it.category;
            const subLabel = (SUBCATEGORY_OPTIONS as any)[it.category]?.find((s: any) => s.key === it.subcategory)?.label || it.subcategory;
            return (
              <span key={i} className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1 text-sm">
                <span className="rounded-full bg-black/5 px-2 py-0.5 text-[11px] text-black/80">{catLabel}</span>
                <span className="text-black/80">{subLabel}</span>
                {it.is_job_seeker && <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[11px] text-brand">Busco</span>}
                {it.is_job_offerer && <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[11px] text-brand">Ofrezco</span>}
                <button className="text-black/60" onClick={() => remove(i)} aria-label="Quitar">×</button>
              </span>
            );
          })}
        </div>
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        <div className="mt-6 flex justify-end">
          <button
            onClick={next}
            className="btn btn-primary"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}
