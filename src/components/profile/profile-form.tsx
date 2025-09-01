"use client";

import { useEffect, useRef, useState } from "react";
import { Field, Input, Textarea } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { fetchProfile, saveOnboardingPart } from "@/components/onboarding/api";

interface ProfilePayload {
  first_name: string;
  last_name: string;
  phone_number: string;
  country: string;
  city: string;
  neighborhood: string;
  bio: string;
  photo_client?: string;
}

export default function ProfileForm() {
  const [form, setForm] = useState<ProfilePayload>({
    first_name: "",
    last_name: "",
    phone_number: "",
    country: "",
    city: "",
    neighborhood: "",
    bio: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarMessage, setAvatarMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const record = await fetchProfile();
        setForm({
          first_name: record.first_name || "",
          last_name: record.last_name || "",
          phone_number: record.phone_number || "",
          country: record.country || "",
          city: record.city || "",
          neighborhood: record.neighborhood || "",
          bio: record.bio || "",
          photo_client: record.photo_client || record.avatar_url || undefined,
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      await saveOnboardingPart({ profile: form });
      setSaved(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error guardando el perfil");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="skeleton h-32 w-full" />;
  }

  return (
    <form onSubmit={onSubmit} className="flex-1">
      <div className="grid gap-4">
        <div className="rounded-2xl border border-brand/10 bg-white p-6">
          <h3 className="mb-1 text-lg font-semibold text-foreground">Subí tu foto de avatar</h3>
          <p className="mb-3 text-xs text-black/60">Recomendado: imagen cuadrada, JPG o PNG, hasta 2MB.</p>
          <div className="flex items-center gap-4">
            {form.photo_client ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.photo_client} alt="Avatar" className="h-16 w-16 rounded-full object-cover" />
            ) : (
              <div className="h-16 w-16 rounded-full bg-brand/10" />
            )}
            <div className="flex-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0] || null;
                  setAvatarFile(file);
                  // si no sube, al menos mostramos el nombre
                  // (igual el upload es automático abajo)
                  // @ts-ignore
                  const name = file?.name as string | undefined;
                  if (name) {
                    // placeholder visible
                  }
                  setAvatarMessage(null);
                  if (!file) return;
                  try {
                    setAvatarUploading(true);
                    const fd = new FormData();
                    fd.append("file", file);
                    const res = await fetch("/api/upload-avatar", { method: "POST", body: fd });
                    const json = await res.json();
                    if (!res.ok) throw new Error(json.error || "Error subiendo avatar");
                    setForm((prev) => ({ ...prev, photo_client: json.url }));
                    setSaved(true);
                    setAvatarMessage("Foto actualizada");
                  } catch (e: unknown) {
                    setError(e instanceof Error ? e.message : "Error subiendo avatar");
                  } finally {
                    setAvatarUploading(false);
                  }
                }}
                className="block text-sm"
              />
              <div className="mt-2">
                <button
                  type="button"
                  className="btn btn-outline text-sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {avatarUploading ? "Subiendo..." : "Subir foto"}
                </button>
                <span className="ml-3 text-xs text-black/60">{avatarMessage ? avatarMessage : "Sin archivos seleccionados"}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Nombre">
            <Input
              value={form.first_name}
              onChange={(e) => setForm({ ...form, first_name: e.target.value })}
            />
          </Field>
          <Field label="Apellido">
            <Input
              value={form.last_name}
              onChange={(e) => setForm({ ...form, last_name: e.target.value })}
            />
          </Field>
        </div>
        <Field label="Teléfono">
          <Input
            placeholder="Ej: +54 9 11 1234 5678"
            value={form.phone_number}
            onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
          />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="País">
            <Input
              placeholder="Ej: Argentina"
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
            />
          </Field>
          <Field label="Ciudad">
            <Input
              placeholder="Ej: Buenos Aires"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
          </Field>
          <Field label="Barrio">
            <Input
              placeholder="Ej: Palermo"
              value={form.neighborhood}
              onChange={(e) => setForm({ ...form, neighborhood: e.target.value })}
            />
          </Field>
        </div>
        <Field label="Bio">
          <Textarea
            placeholder="Contanos en pocas líneas tu experiencia y qué ofrecés."
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
          />
        </Field>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {saved && <p className="text-sm text-brand">Perfil guardado</p>}
        <div className="mt-2 flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </div>
    </form>
  );
}
