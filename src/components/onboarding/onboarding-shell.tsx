"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useMemo, useState } from "react";
import StepIndicator from "@/components/onboarding/step-indicator";

type ProfilePayload = {
  first_name?: string;
  last_name?: string;
  country?: string;
  city?: string;
  neighborhood?: string;
  phone_number?: string;
  bio?: string;
  roles?: string[];
};

type PortfolioPayload = {
  cv_url?: string;
  courses_url?: string;
  diplomas_url?: string;
  links?: string; // JSON
};

type InterestItem = {
  category: string;
  subcategory?: string;
  is_job_seeker?: boolean;
  is_job_offerer?: boolean;
};

type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
type DayBlock = { morning?: boolean; afternoon?: boolean; evening?: boolean };
type AvailabilityMap = Record<DayKey, DayBlock>;
type WorkMode = "on_site" | "remote" | "both";

const steps = [
  "Tu perfil",
  "Intereses",
  "Disponibilidad",
  "Portfolio",
  "Preferencias",
  "Confirmación",
];

export default function OnboardingShell() {
  const { user } = useUser();
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [missing, setMissing] = useState<Record<string, boolean>>({});
  const [portfolio, setPortfolio] = useState<PortfolioPayload>({ links: "{}" });
  const [interests, setInterests] = useState<InterestItem[]>([]);
  const [availability, setAvailability] = useState<AvailabilityMap>({
    mon: {},
    tue: {},
    wed: {},
    thu: {},
    fri: {},
    sat: {},
    sun: {},
  });
  const [workMode, setWorkMode] = useState<WorkMode>("on_site");
  const [availabilityNotes, setAvailabilityNotes] = useState("");

  const [form, setForm] = useState<ProfilePayload>(() => ({
    first_name: user?.firstName || "",
    last_name: user?.lastName || "",
    phone_number: user?.primaryPhoneNumber?.phoneNumber || "",
    roles: ["provider"],
    // tags/links moved to structured states
  }));

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoadingProfile(true);
        const res = await fetch("/api/profile", { cache: "no-store" });
        if (!res.ok) throw new Error(await res.text());
        const { record } = (await res.json()) as { record: any };
        if (cancelled) return;

        // Prefill form with existing values
        setForm((f) => ({
          ...f,
          first_name: record.first_name || f.first_name || "",
          last_name: record.last_name || f.last_name || "",
          country: record.country || "",
          city: record.city || "",
          neighborhood: record.neighborhood || "",
          phone_number: record.phone_number || f.phone_number || "",
          bio: record.bio || "",
          roles: Array.isArray(record.roles) && record.roles.length > 0 ? record.roles : f.roles,
          tags: typeof record.tags === "string" && record.tags.length ? record.tags : f.tags,
          links: typeof record.links === "string" && record.links.length ? record.links : f.links,
        }));

        // Compute missing fields (only those we want to collect here)
        const missingMap: Record<string, boolean> = {
          first_name: !record.first_name,
          last_name: !record.last_name,
          country: !record.country,
          city: !record.city,
          neighborhood: !record.neighborhood,
          phone_number: !record.phone_number,
          bio: !record.bio,
          tags: !record.tags,
        };
        setMissing(missingMap);
      } catch (e) {
        // If profile not found yet (race vs webhook), treat all as missing except name from Clerk
        setMissing({
          first_name: !Boolean(user?.firstName),
          last_name: !Boolean(user?.lastName),
          country: true,
          city: true,
          neighborhood: true,
          phone_number: !Boolean(user?.primaryPhoneNumber?.phoneNumber),
          bio: true,
          tags: true,
        });
      } finally {
        if (!cancelled) setLoadingProfile(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.firstName, user?.lastName, user?.primaryPhoneNumber?.phoneNumber]);

  const canNext = useMemo(() => {
    if (current === 0) {
      if ((missing.first_name ?? false) && !form.first_name) return false;
      if ((missing.last_name ?? false) && !form.last_name) return false;
      return true;
    }
    if (current === 1) {
      return interests.length > 0;
    }
    if (current === 2) {
      return Object.values(availability).some(
        (d) => d.morning || d.afternoon || d.evening
      );
    }
    if (current === 4) return Boolean(form.roles && form.roles.length > 0);
    return true;
  }, [current, form]);

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      // Map availability blocks to precise weeklyAvailability items
      const toDay = (k: DayKey): string =>
        ({ mon: "monday", tue: "tuesday", wed: "wednesday", thu: "thursday", fri: "friday", sat: "saturday", sun: "sunday" } as const)[k];
      const blocks = [
        { key: "morning", start: "08:00", end: "12:00" },
        { key: "afternoon", start: "13:00", end: "17:00" },
        { key: "evening", start: "18:00", end: "21:00" },
      ] as const;
      // Aggregate per-day to comply with unique (profile_id, day_of_week)
      const weeklyAvailability = Object.entries(availability)
        .map(([day, b]) => {
          const selected = blocks.filter((blk) => (b as any)[blk.key]);
          if (!selected.length) return null;
          const start_time = selected[0].start;
          const end_time = selected[selected.length - 1].end;
          const selectedLabels = [
            (b as any).morning ? "morning" : null,
            (b as any).afternoon ? "afternoon" : null,
            (b as any).evening ? "evening" : null,
          ]
            .filter(Boolean)
            .join(", ");
          const notes = availabilityNotes ? `${availabilityNotes} (${selectedLabels})` : selectedLabels;
          return {
            day_of_week: toDay(day as DayKey),
            start_time,
            end_time,
            is_active: true,
            work_mode: workMode,
            notes,
          };
        })
        .filter(Boolean) as any[];

      const payload = {
        profile: form,
        roles: form.roles,
        portfolio,
        interests,
        weeklyAvailability,
      };

      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, finalize: true }),
      });
      if (!res.ok) throw new Error(await res.text());
      setSuccess(true);
    } catch (e: any) {
      setError(e?.message || "Algo salió mal");
    } finally {
      setLoading(false);
    }
  }

  async function handleNext() {
    try {
      setLoading(true);
      await savePartial(current, {
        form,
        roles: form.roles,
        interests,
        availability,
        workMode,
        availabilityNotes,
        portfolio,
      });
      setCurrent((c) => Math.min(steps.length - 1, c + 1));
    } catch (e) {
      // Silently ignore; final submit validates again
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 bg-white min-h-screen">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          ¡Bienvenido{user?.firstName ? `, ${user.firstName}` : ""}!
        </h1>
        <p className="mt-2 text-sm text-black/70">
          Configurá tu perfil en unos pocos pasos.
        </p>
      </div>

      <div className="mb-8">
        <StepIndicator steps={steps} current={current} />
      </div>

      <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
        {loadingProfile ? (
          <div className="text-sm text-black/70">Cargando tu perfil...</div>
        ) : (
          <>
          {current === 0 && (
            <StepProfile
              value={form}
              missing={missing}
              onChange={(v) => setForm((f) => ({ ...f, ...v }))}
            />
          )}
          {current === 1 && (
            <StepInterests
              items={interests}
              onChange={setInterests}
            />
          )}
          {current === 2 && (
            <StepAvailability
              value={availability}
              onChange={setAvailability}
              workMode={workMode}
              setWorkMode={setWorkMode}
              notes={availabilityNotes}
              setNotes={setAvailabilityNotes}
            />
          )}
          {current === 3 && (
            <StepPortfolio value={portfolio} onChange={setPortfolio} />
          )}
          {current === 4 && (
            <StepPreferences
              value={form}
              onChange={(v) => setForm((f) => ({ ...f, ...v }))}
            />
          )}
          {current === 5 && (
            <StepConfirm
              value={form}
              interests={interests}
              availability={availability}
              portfolio={portfolio}
            />
          )}
          </>
        )}
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <div className="mt-6 flex items-center justify-between">
          <button
            className="inline-flex h-10 items-center justify-center rounded-lg border border-black/10 bg-white px-4 text-sm font-medium shadow-sm transition hover:bg-slate-50"
            onClick={() => setCurrent((c) => Math.max(0, c - 1))}
            disabled={current === 0 || loading}
          >
            Atrás
          </button>
          {current < steps.length - 1 ? (
            <button
              className="inline-flex h-10 items-center justify-center rounded-lg bg-foreground px-4 text-sm font-medium text-background shadow-sm transition hover:opacity-90"
              onClick={handleNext}
              disabled={!canNext || loading}
            >
              Siguiente
            </button>
          ) : (
            <button
              className="inline-flex h-10 items-center justify-center rounded-lg bg-foreground px-4 text-sm font-medium text-background shadow-sm transition hover:opacity-90 disabled:opacity-60"
              onClick={submit}
              disabled={loading}
            >
              {loading ? "Guardando..." : "Finalizar"}
            </button>
          )}
        </div>

        {success && (
          <div className="mt-6 rounded-lg border border-emerald-300/40 bg-emerald-50 p-3 text-emerald-900">
            ¡Listo! Tu perfil fue guardado. Puedes cerrar esta página o ir al inicio.
          </div>
        )}
      </div>
    </div>
  );
}

async function savePartial(step: number, {
  form,
  roles,
  interests,
  availability,
  workMode,
  availabilityNotes,
  portfolio,
}: {
  form: ProfilePayload;
  roles: string[] | undefined;
  interests: InterestItem[];
  availability: AvailabilityMap;
  workMode: WorkMode;
  availabilityNotes: string;
  portfolio: PortfolioPayload;
}) {
  const toDay = (k: DayKey): string => (
    { mon: "monday", tue: "tuesday", wed: "wednesday", thu: "thursday", fri: "friday", sat: "saturday", sun: "sunday" } as const
  )[k];
  const blocks = [
    { key: "morning", start: "08:00", end: "12:00" },
    { key: "afternoon", start: "13:00", end: "17:00" },
    { key: "evening", start: "18:00", end: "21:00" },
  ] as const;
  const weeklyAvailability = Object.entries(availability).flatMap(([day, b]) =>
    blocks
      .filter((blk) => (b as any)[blk.key])
      .map((blk) => ({
        day_of_week: toDay(day as DayKey),
        start_time: blk.start,
        end_time: blk.end,
        is_active: true,
        work_mode: workMode,
        notes: availabilityNotes,
      }))
  );

  let payload: any = {};
  if (step === 0) payload = { profile: form, roles };
  else if (step === 1) payload = { interests };
  else if (step === 2) payload = { weeklyAvailability };
  else if (step === 3) payload = { portfolio };
  else return;

  await fetch("/api/onboarding", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

async function handleNext(this: any) {
  // `this` is not used; we rely on closure variables in component scope
  // This function body will be replaced in component scope where states are available
}

function StepPortfolio({
  value,
  onChange,
}: {
  value: PortfolioPayload;
  onChange: (v: PortfolioPayload) => void;
}) {
  return (
    <div className="grid gap-4">
      <p className="text-sm text-black/70">Sumá enlaces a tu CV, cursos y diplomas (opcional).</p>
      <Field label="CV URL">
        <Input
          placeholder="https://..."
          value={value.cv_url || ""}
          onChange={(e) => onChange({ ...value, cv_url: e.target.value })}
        />
      </Field>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Cursos URL">
          <Input
            placeholder="https://..."
            value={value.courses_url || ""}
            onChange={(e) => onChange({ ...value, courses_url: e.target.value })}
          />
        </Field>
        <Field label="Diplomas URL">
          <Input
            placeholder="https://..."
            value={value.diplomas_url || ""}
            onChange={(e) => onChange({ ...value, diplomas_url: e.target.value })}
          />
        </Field>
      </div>
      <Field label="Links adicionales (JSON opcional)">
        <Textarea
          placeholder='{"github":"https://github.com/usuario"}'
          value={value.links || "{}"}
          onChange={(e) => onChange({ ...value, links: e.target.value })}
        />
      </Field>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-black/80 dark:text-white/80">{label}</span>
      {children}
    </label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={
        "h-10 rounded-lg border border-black/10 bg-white px-3 text-sm text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black/20 " +
        (props.className || "")
      }
    />
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={
        "min-h-24 rounded-lg border border-black/10 bg-white p-3 text-sm text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black/20 " +
        (props.className || "")
      }
    />
  );
}

function StepProfile({
  value,
  missing,
  onChange,
}: {
  value: ProfilePayload;
  missing: Record<string, boolean>;
  onChange: (v: Partial<ProfilePayload>) => void;
}) {
  return (
    <div className="grid gap-4">
      {Object.values(missing).some(Boolean) ? (
        <p className="text-sm text-black/70">
          Completá los siguientes campos pendientes para continuar.
        </p>
      ) : (
        <p className="text-sm text-black/70">
          No hay campos pendientes. Podés continuar o actualizar los datos si querés.
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {(missing.first_name ?? true) && (
          <Field label="Nombre">
            <Input
              value={value.first_name || ""}
              onChange={(e) => onChange({ first_name: e.target.value })}
              placeholder="Juan"
            />
          </Field>
        )}
        {(missing.last_name ?? true) && (
          <Field label="Apellido">
            <Input
              value={value.last_name || ""}
              onChange={(e) => onChange({ last_name: e.target.value })}
              placeholder="Pérez"
            />
          </Field>
        )}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {(missing.country ?? true) && (
          <Field label="País">
            <Input
              value={value.country || ""}
              onChange={(e) => onChange({ country: e.target.value })}
              placeholder="Argentina"
            />
          </Field>
        )}
        {(missing.city ?? true) && (
          <Field label="Ciudad">
            <Input
              value={value.city || ""}
              onChange={(e) => onChange({ city: e.target.value })}
              placeholder="Buenos Aires"
            />
          </Field>
        )}
        {(missing.neighborhood ?? true) && (
          <Field label="Barrio">
            <Input
              value={value.neighborhood || ""}
              onChange={(e) => onChange({ neighborhood: e.target.value })}
              placeholder="Palermo"
            />
          </Field>
        )}
      </div>

      {(missing.phone_number ?? true) && (
        <Field label="Teléfono">
          <Input
            value={value.phone_number || ""}
            onChange={(e) => onChange({ phone_number: e.target.value })}
            placeholder="+54 9 11 5555-5555"
          />
        </Field>
      )}

      {(missing.bio ?? true) && (
        <Field label="Bio">
          <Textarea
            value={value.bio || ""}
            onChange={(e) => onChange({ bio: e.target.value })}
            placeholder="Contanos brevemente sobre vos..."
          />
        </Field>
      )}

      {(missing.tags ?? true) && (
        <Field label="Tags (JSON)">
          <Textarea
            value={value.tags || "[]"}
            onChange={(e) => onChange({ tags: e.target.value })}
            placeholder='["react", "frontend"]'
          />
        </Field>
      )}
    </div>
  );
}

function StepPreferences({
  value,
  onChange,
}: {
  value: ProfilePayload;
  onChange: (v: Partial<ProfilePayload>) => void;
}) {
  const roles = value.roles || [];
  function toggle(role: "provider" | "worker" | "creator") {
    onChange({
      roles: roles.includes(role) ? roles.filter((r) => r !== role) : [...roles, role],
    });
  }
  return (
    <div className="grid gap-4">
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => toggle("provider")}
          className={
            "inline-flex h-10 items-center justify-center rounded-lg border px-4 text-sm font-medium shadow-sm transition " +
            (roles.includes("provider")
              ? "border-transparent bg-foreground text-background"
              : "border-black/10 bg-white hover:bg-slate-50")
          }
        >
          Ofrezco trabajo
        </button>
        <button
          type="button"
          onClick={() => toggle("worker")}
          className={
            "inline-flex h-10 items-center justify-center rounded-lg border px-4 text-sm font-medium shadow-sm transition " +
            (roles.includes("worker")
              ? "border-transparent bg-foreground text-background"
              : "border-black/10 bg-white hover:bg-slate-50")
          }
        >
          Soy trabajador
        </button>
        <button
          type="button"
          onClick={() => toggle("creator")}
          className={
            "inline-flex h-10 items-center justify-center rounded-lg border px-4 text-sm font-medium shadow-sm transition " +
            (roles.includes("creator")
              ? "border-transparent bg-foreground text-background"
              : "border-black/10 bg-white hover:bg-slate-50")
          }
        >
          Soy creador
        </button>
      </div>
      <Field label="Links (JSON opcional)">
        <Textarea
          // deprecated in onboarding flow; keep as advanced option (stored in profiles.links)
          value={(undefined as any) || "{}"}
          onChange={() => {}}
          placeholder='{"website":"https://mi-sitio.com","linkedin":"https://linkedin.com/in/usuario"}'
        />
      </Field>
    </div>
  );
}

function StepConfirm({
  value,
  interests,
  availability,
  portfolio,
}: {
  value: ProfilePayload;
  interests: InterestItem[];
  availability: AvailabilityMap;
  portfolio: PortfolioPayload;
}) {
  return (
    <div className="space-y-3 text-sm text-black/80">
      <p>
        <strong>Nombre:</strong> {value.first_name} {value.last_name}
      </p>
      <p>
        <strong>Ubicación:</strong> {value.city || "-"}, {value.country || "-"}
      </p>
      <p>
        <strong>Roles:</strong> {(value.roles || []).join(", ") || "-"}
      </p>
      <div>
        <strong>Intereses:</strong>
        <div className="mt-1 flex flex-wrap gap-2">
          {interests.length ? (
            interests.map((it, i) => (
              <span key={i} className="rounded-full border border-black/10 px-2 py-0.5">
                {it.category}
                {it.subcategory ? ` / ${it.subcategory}` : ""}
              </span>
            ))
          ) : (
            <span className="text-black/60">-</span>
          )}
        </div>
      </div>
      <div>
        <strong>Disponibilidad:</strong>
        <div className="mt-1 grid grid-cols-1 gap-1 text-black/70">
          {Object.values(availability).some((d) => d.morning || d.afternoon || d.evening) ? (
            Object.entries(availability).map(([day, b]) => {
              const active = [
                b.morning ? "Mañana" : null,
                b.afternoon ? "Tarde" : null,
                b.evening ? "Noche" : null,
              ].filter(Boolean);
              if (!active.length) return null;
              const label = (
                { mon: "Lunes", tue: "Martes", wed: "Miércoles", thu: "Jueves", fri: "Viernes", sat: "Sábado", sun: "Domingo" } as const
              )[day as any];
              return (
                <div key={day}>
                  {label}: {active.join(", ")}
                </div>
              );
            })
          ) : (
            <span className="text-black/60">-</span>
          )}
        </div>
      </div>
      <div>
        <strong>Portfolio:</strong>
        <div className="mt-1 grid grid-cols-1 gap-1 text-black/70">
          <span>CV: {portfolio.cv_url || "-"}</span>
          <span>Cursos: {portfolio.courses_url || "-"}</span>
          <span>Diplomas: {portfolio.diplomas_url || "-"}</span>
        </div>
      </div>
      <p className="mt-4 text-black/60">
        Al finalizar, crearemos/actualizaremos tu perfil y marcaremos el onboarding como completo.
      </p>
    </div>
  );
}

const CATEGORY_OPTIONS = [
  {
    key: "workers",
    label: "Workers",
    subs: [
      { key: "electrician", label: "Electrician" },
      { key: "plumber", label: "Plumber" },
      { key: "carpenter", label: "Carpenter" },
      { key: "painter", label: "Painter" },
      { key: "gas_fitter", label: "Gas fitter" },
      { key: "gardener", label: "Gardener" },
      { key: "mechanic", label: "Mechanic" },
      { key: "hairdresser", label: "Hairdresser" },
      { key: "construction", label: "Construction" },
    ],
  },
  {
    key: "creators",
    label: "Creators",
    subs: [
      { key: "youtuber", label: "YouTuber" },
      { key: "influencer", label: "Influencer" },
      { key: "photographer", label: "Photographer" },
      { key: "podcaster", label: "Podcaster" },
      { key: "designer", label: "Designer" },
      { key: "musician", label: "Musician" },
      { key: "gamer", label: "Gamer" },
    ],
  },
  {
    key: "providers",
    label: "Providers",
    subs: [
      { key: "clothing_textile", label: "Clothing & textile" },
      { key: "automotive", label: "Automotive" },
      { key: "appliances", label: "Appliances" },
      { key: "technology", label: "Technology" },
      { key: "fashion_accessories", label: "Fashion accessories" },
      { key: "toys", label: "Toys" },
      { key: "food", label: "Food" },
      { key: "electronics", label: "Electronics" },
    ],
  },
];

function StepInterests({
  items,
  onChange,
}: {
  items: InterestItem[];
  onChange: (items: InterestItem[]) => void;
}) {
  const [draft, setDraft] = useState<InterestItem>({ category: CATEGORY_OPTIONS[0].key, subcategory: CATEGORY_OPTIONS[0].subs[0].key });

  function add() {
    if (!draft.category) return;
    onChange([...(items || []), draft]);
    setDraft({ category: "", subcategory: "" });
  }
  function remove(idx: number) {
    const next = [...items];
    next.splice(idx, 1);
    onChange(next);
  }

  return (
    <div className="grid gap-4">
      <p className="text-sm text-black/70">Agregá tus intereses (categoría y subcategoría).</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <select
          className="h-10 rounded-lg border border-black/10 bg-white px-3 text-sm"
          value={draft.category || ""}
          onChange={(e) => {
            const cat = e.target.value;
            const cfg = CATEGORY_OPTIONS.find((c) => c.key === cat) ?? CATEGORY_OPTIONS[0];
            setDraft((d) => ({ ...d, category: cat, subcategory: cfg.subs[0]?.key }));
          }}
        >
          {CATEGORY_OPTIONS.map((c) => (
            <option key={c.key} value={c.key}>
              {c.label}
            </option>
          ))}
        </select>
        <select
          className="h-10 rounded-lg border border-black/10 bg-white px-3 text-sm"
          value={draft.subcategory || ""}
          onChange={(e) => setDraft((d) => ({ ...d, subcategory: e.target.value }))}
        >
          {(CATEGORY_OPTIONS.find((c) => c.key === draft.category)?.subs || []).map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-3 sm:col-span-4">
          <label className="flex items-center gap-2 text-sm text-black/70">
            <input
              type="checkbox"
              checked={Boolean(draft.is_job_seeker)}
              onChange={(e) => setDraft((d) => ({ ...d, is_job_seeker: e.target.checked }))}
            />
            Busco trabajo
          </label>
          <label className="flex items-center gap-2 text-sm text-black/70">
            <input
              type="checkbox"
              checked={Boolean(draft.is_job_offerer)}
              onChange={(e) => setDraft((d) => ({ ...d, is_job_offerer: e.target.checked }))}
            />
            Ofrezco trabajo
          </label>
          <button
            type="button"
            onClick={add}
            className="ml-auto inline-flex h-10 items-center justify-center rounded-lg bg-foreground px-4 text-sm font-medium text-background"
          >
            Agregar
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(items || []).map((it, i) => (
          <span key={i} className="inline-flex items-center gap-2 rounded-full border border-black/10 px-3 py-1 text-sm">
            {it.category}
            {it.subcategory ? ` / ${it.subcategory}` : ""}
            <button className="text-black/60" onClick={() => remove(i)} aria-label="Quitar">
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

function StepAvailability({
  value,
  onChange,
  workMode,
  setWorkMode,
  notes,
  setNotes,
}: {
  value: AvailabilityMap;
  onChange: (v: AvailabilityMap) => void;
  workMode: WorkMode;
  setWorkMode: (m: WorkMode) => void;
  notes: string;
  setNotes: (v: string) => void;
}) {
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
    { key: "morning", label: "Mañana" },
    { key: "afternoon", label: "Tarde" },
    { key: "evening", label: "Noche" },
  ] as const;

  function toggle(day: DayKey, block: keyof DayBlock) {
    const next = { ...value, [day]: { ...value[day], [block]: !value[day]?.[block] } };
    onChange(next);
  }

  return (
    <div className="grid gap-4">
      <p className="text-sm text-black/70">Indicá cuándo estás disponible y tu modalidad de trabajo.</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="text-sm font-medium text-black/80">Modalidad</label>
        <select
          className="h-10 rounded-lg border border-black/10 bg-white px-3 text-sm sm:col-span-2"
          value={workMode}
          onChange={(e) => setWorkMode(e.target.value as WorkMode)}
        >
          <option value="on_site">Presencial</option>
          <option value="remote">Remoto</option>
          <option value="hybrid">Híbrido</option>
        </select>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                  (active
                    ? "border-transparent bg-foreground text-background"
                    : "border-black/10 bg-white hover:bg-slate-50")
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
    </div>
  );
}
