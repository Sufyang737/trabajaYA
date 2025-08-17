"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import StepIndicator from "@/components/onboarding/step-indicator";
import OnboardingProgress from "@/components/onboarding/progress";
import { AvailabilityMap, DayKey, WorkMode, saveOnboardingPart, STEP_PATHS } from "@/components/onboarding/api";
import { Field, Textarea } from "@/components/ui/form";

export default function AvailabilityStep() {
  const router = useRouter();
  const [value, setValue] = useState<AvailabilityMap>({ mon: {}, tue: {}, wed: {}, thu: {}, fri: {}, sat: {}, sun: {} });
  const [workMode, setWorkMode] = useState<WorkMode>("on_site");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const dayLabels: Record<DayKey, string> = {
    mon: "Lunes",
    tue: "Martes",
    wed: "Miércoles",
    thu: "Jueves",
    fri: "Viernes",
    sat: "Sábado",
    sun: "Domingo",
  };
  const blocks = [
    { key: "morning", label: "Mañana", start: "08:00", end: "12:00" },
    { key: "afternoon", label: "Tarde", start: "13:00", end: "17:00" },
    { key: "evening", label: "Noche", start: "18:00", end: "21:00" },
  ] as const;

  function toggle(day: DayKey, block: "morning" | "afternoon" | "evening") {
    setValue((v) => ({ ...v, [day]: { ...v[day], [block]: !v[day]?.[block] } }));
  }

  async function next() {
    try {
      setError(null);
      const selected = Object.values(value).some((d) => d.morning || d.afternoon || d.evening);
      if (!selected) throw new Error("Seleccioná al menos un bloque de disponibilidad");
      const toDay = (k: DayKey) => ({ mon: "monday", tue: "tuesday", wed: "wednesday", thu: "thursday", fri: "friday", sat: "saturday", sun: "sunday" } as const)[k];
      const weeklyAvailability = Object.entries(value)
        .map(([day, b]) => {
          const sel = blocks.filter((blk) => (b as any)[blk.key]);
          if (!sel.length) return null;
          const start = sel[0].start;
          const end = sel[sel.length - 1].end;
          const labels = [b.morning ? "morning" : null, b.afternoon ? "afternoon" : null, b.evening ? "evening" : null].filter(Boolean).join(", ");
          return { day_of_week: toDay(day as DayKey), start_time: start, end_time: end, is_active: true, work_mode: workMode, notes: notes ? `${notes} (${labels})` : labels };
        })
        .filter(Boolean);
      await saveOnboardingPart({ weeklyAvailability });
      router.push(STEP_PATHS[3]);
    } catch (e: any) {
      setError(e?.message || "Error guardando disponibilidad");
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 bg-white min-h-screen animate-fade-in">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Disponibilidad</h1>
        <p className="mt-2 text-sm text-black/70">Indicá cuándo podés trabajar y tu modalidad.</p>
      </div>
      <div className="mb-4">
        <OnboardingProgress current={2} total={6} />
      </div>
      <div className="mb-8 animate-slide-up">
        <StepIndicator steps={["Perfil", "Intereses", "Disponibilidad", "Portfolio", "Preferencias", "Confirmación"]} current={2} />
      </div>
      <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm animate-slide-up">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <label className="text-sm font-medium text-black/80">Modalidad</label>
          <select className="h-10 rounded-lg border border-black/10 bg-white px-3 text-sm sm:col-span-2" value={workMode} onChange={(e) => setWorkMode(e.target.value as WorkMode)}>
            <option value="on_site">Presencial</option>
            <option value="remote">Remoto</option>
            <option value="both">Ambas</option>
          </select>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mt-4">
          {(Object.keys(dayLabels) as DayKey[]).map((day) => (
            <div key={day} className="rounded-lg border border-black/10 bg-white p-3">
              <div className="mb-2 text-sm font-medium text-black/80">{dayLabels[day]}</div>
              <div className="flex gap-2">
                {blocks.map((b) => {
                  const active = Boolean((value[day] as any)?.[b.key]);
                  return (
                    <button
                      key={b.key}
                      type="button"
                      onClick={() => toggle(day, b.key)}
                      className={
                        "rounded-md border px-3 py-1 text-xs transition " +
                        (active ? "border-transparent bg-foreground text-background" : "border-black/10 bg-white hover:bg-slate-50")
                      }
                    >
                      {b.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <Field label="Notas (opcional)">
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Aclaraciones sobre tu disponibilidad" />
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
