"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Package, Wrench, Camera } from "lucide-react";
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
  roles: string[];
  photo_client?: string;
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
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [avatarMessage, setAvatarMessage] = useState<string | null>(null);
  const [avatarFileName, setAvatarFileName] = useState<string>("");

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
          roles: record.roles || [],
          photo_client: record.photo_client || record.avatar_url || undefined,
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
    // requiere al menos 1 rol seleccionado
    if (!form.roles || !form.roles.length) return false;
    return true;
  }, [missing, form]);

  function toggleRole(role: "provider" | "worker" | "creator") {
    const roles = new Set(form.roles || []);
    if (roles.has(role)) roles.delete(role); else roles.add(role);
    setForm({ ...form, roles: Array.from(roles) });
  }

  async function onAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setAvatarUploading(true);
      setAvatarFileName(file.name || "");
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload-avatar", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error subiendo foto");
      setForm((prev) => ({ ...prev, photo_client: json.url }));
      setAvatarMessage("Foto actualizada");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error subiendo foto");
    } finally {
      setAvatarUploading(false);
    }
  }

  async function next() {
    try {
      setError(null);
      await saveOnboardingPart({ profile: { ...form, roles: form.roles } });
      router.push(STEP_PATHS[1]);
    } catch (e: any) {
      setError(e?.message || "Error guardando el perfil");
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 bg-white min-h-screen animate-fade-in">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Tu perfil</h1>
        <p className="mt-2 text-sm text-black/70">
          Contanos quién sos y cómo querés trabajar. Esta información ayuda a que te encuentren mejor.
        </p>
      </div>
      <div className="mb-4">
        <OnboardingProgress current={0} total={5} />
      </div>
      <div className="mb-8 animate-slide-up">
        <StepIndicator steps={["Perfil", "Intereses", "Disponibilidad", "Portfolio", "Confirmación"]} current={0} />
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
            {/* Avatar */}
            <div className="flex items-center gap-4">
              {form.photo_client ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.photo_client} alt="Avatar" className="h-16 w-16 rounded-full object-cover" />
              ) : (
                <div className="h-16 w-16 rounded-full bg-brand/10" />
              )}
              <div>
                <input ref={fileRef} className="block text-sm" type="file" accept="image/*" onChange={onAvatarChange} />
                <button type="button" onClick={() => fileRef.current?.click()} className="btn btn-outline text-sm mt-1" disabled={avatarUploading}>
                  {avatarUploading ? "Subiendo..." : form.photo_client ? "Cambiar foto" : "Subir foto"}
                </button>
                <span className="ml-3 text-xs text-black/60">{avatarMessage ? avatarMessage : (avatarFileName || "Sin archivos seleccionados")}</span>
              </div>
            </div>

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
                  <Input placeholder="Ej: Argentina" value={form.country || ""} onChange={(e) => setForm({ ...form, country: e.target.value })} />
                </Field>
              )}
              {(missing.city ?? true) && (
                <Field label="Ciudad">
                  <Input placeholder="Ej: Buenos Aires" value={form.city || ""} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                </Field>
              )}
              {(missing.neighborhood ?? true) && (
                <Field label="Barrio">
                  <Input placeholder="Ej: Palermo" value={form.neighborhood || ""} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })} />
                </Field>
              )}
            </div>
            {(missing.phone_number ?? true) && (
              <Field label="Teléfono">
                <Input placeholder="Ej: +54 9 11 1234 5678" value={form.phone_number || ""} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} />
              </Field>
            )}
            {(missing.bio ?? true) && (
              <Field label="Bio">
                <Textarea placeholder="Contanos en pocas líneas tu experiencia y qué ofrecés." value={form.bio || ""} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
              </Field>
            )}

            {/* Roles (preferencias) integradas */}
            <div className="mt-2">
              <div className="mb-2 text-sm font-medium text-foreground">¿Qué sos?</div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => toggleRole("provider")}
                  className={
                    "flex items-start gap-3 rounded-xl border p-3 text-left transition " +
                    ((form.roles || []).includes("provider")
                      ? "border-brand bg-brand/5"
                      : "border-black/10 bg-white hover:bg-slate-50")
                  }
                >
                  <span className="mt-0.5 rounded-md bg-brand/10 p-2 text-brand"><Package className="h-4 w-4" /></span>
                  <span>
                    <span className="block text-sm font-semibold text-foreground">Proveedor</span>
                    <span className="block text-xs text-black/60">Vendes productos o servicios a otros.</span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleRole("worker")}
                  className={
                    "flex items-start gap-3 rounded-xl border p-3 text-left transition " +
                    ((form.roles || []).includes("worker")
                      ? "border-brand bg-brand/5"
                      : "border-black/10 bg-white hover:bg-slate-50")
                  }
                >
                  <span className="mt-0.5 rounded-md bg-brand/10 p-2 text-brand"><Wrench className="h-4 w-4" /></span>
                  <span>
                    <span className="block text-sm font-semibold text-foreground">Trabajador</span>
                    <span className="block text-xs text-black/60">Ofrecés oficios o mano de obra.</span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleRole("creator")}
                  className={
                    "flex items-start gap-3 rounded-xl border p-3 text-left transition " +
                    ((form.roles || []).includes("creator")
                      ? "border-brand bg-brand/5"
                      : "border-black/10 bg-white hover:bg-slate-50")
                  }
                >
                  <span className="mt-0.5 rounded-md bg-brand/10 p-2 text-brand"><Camera className="h-4 w-4" /></span>
                  <span>
                    <span className="block text-sm font-semibold text-foreground">Creador</span>
                    <span className="block text-xs text-black/60">Hacés contenido, diseño o producción creativa.</span>
                  </span>
                </button>
              </div>
              <p className="mt-2 text-xs text-black/60">Podés elegir una o varias opciones. Siempre vas a poder cambiarlas desde tu perfil.</p>
            </div>
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
