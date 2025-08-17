"use client";

import { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Field, Input, Textarea } from "@/components/ui/form";
import StepIndicator from "@/components/onboarding/step-indicator";
import OnboardingProgress from "@/components/onboarding/progress";
import { fetchProfile, saveOnboardingPart, STEP_PATHS } from "@/components/onboarding/api";

type ProfilePayload = Partial<{
  first_name: string;
  last_name: string;
  country: string;
  city: string;
  neighborhood: string;
  phone_number: string;
  bio: string;
}>;

export default function ProfileStep() {
  const { user } = useUser();
  const router = useRouter();
  const [form, setForm] = useState<ProfilePayload>({
    first_name: user?.firstName || "",
    last_name: user?.lastName || "",
    phone_number: user?.primaryPhoneNumber?.phoneNumber || "",
  });
  const [missing, setMissing] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const record = await fetchProfile();
        setForm((f) => ({
          ...f,
          first_name: record.first_name || f.first_name || "",
          last_name: record.last_name || f.last_name || "",
          country: record.country || "",
          city: record.city || "",
          neighborhood: record.neighborhood || "",
          phone_number: record.phone_number || f.phone_number || "",
          bio: record.bio || "",
        }));
        setMissing({
          first_name: !record.first_name,
          last_name: !record.last_name,
          country: !record.country,
          city: !record.city,
          neighborhood: !record.neighborhood,
          phone_number: !record.phone_number,
          bio: !record.bio,
        });
      } catch {
        setMissing({
          first_name: !Boolean(user?.firstName),
          last_name: !Boolean(user?.lastName),
          country: true,
          city: true,
          neighborhood: true,
          phone_number: !Boolean(user?.primaryPhoneNumber?.phoneNumber),
          bio: true,
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.firstName, user?.lastName, user?.primaryPhoneNumber?.phoneNumber]);

  const canNext = useMemo(() => {
    if ((missing.first_name ?? false) && !form.first_name) return false;
    if ((missing.last_name ?? false) && !form.last_name) return false;
    return true;
  }, [missing, form]);

  async function next() {
    try {
      setError(null);
      await saveOnboardingPart({ profile: form });
      router.push(STEP_PATHS[1]);
    } catch (e: any) {
      setError(e?.message || "Error guardando el perfil");
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 bg-white min-h-screen animate-fade-in">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Tu perfil</h1>
        <p className="mt-2 text-sm text-black/70">Completá los datos básicos de tu perfil.</p>
      </div>
      <div className="mb-4">
        <OnboardingProgress current={0} total={6} />
      </div>
      <div className="mb-8 animate-slide-up">
        <StepIndicator steps={["Perfil", "Intereses", "Disponibilidad", "Portfolio", "Preferencias", "Confirmación"]} current={0} />
      </div>
      <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm animate-slide-up">
        {loading ? (
          <div className="grid gap-3">
            <div className="skeleton h-8 w-1/3" />
            <div className="skeleton h-10 w-full" />
            <div className="skeleton h-10 w-full" />
            <div className="skeleton h-8 w-1/2" />
          </div>
        ) : (
          <div className="grid gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {(missing.first_name ?? true) && (
                <Field label="Nombre">
                  <Input value={form.first_name || ""} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
                </Field>
              )}
              {(missing.last_name ?? true) && (
                <Field label="Apellido">
                  <Input value={form.last_name || ""} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
                </Field>
              )}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {(missing.country ?? true) && (
                <Field label="País">
                  <Input value={form.country || ""} onChange={(e) => setForm({ ...form, country: e.target.value })} />
                </Field>
              )}
              {(missing.city ?? true) && (
                <Field label="Ciudad">
                  <Input value={form.city || ""} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                </Field>
              )}
              {(missing.neighborhood ?? true) && (
                <Field label="Barrio">
                  <Input value={form.neighborhood || ""} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })} />
                </Field>
              )}
            </div>
            {(missing.phone_number ?? true) && (
              <Field label="Teléfono">
                <Input value={form.phone_number || ""} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} />
              </Field>
            )}
            {(missing.bio ?? true) && (
              <Field label="Bio">
                <Textarea value={form.bio || ""} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
              </Field>
            )}
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="mt-4 flex justify-end">
              <button
                className="btn btn-primary shadow-sm disabled:opacity-60"
                disabled={!canNext}
                onClick={next}
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
