"use client";

import { useEffect, useState } from "react";
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
            value={form.phone_number}
            onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
          />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="País">
            <Input
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
            />
          </Field>
          <Field label="Ciudad">
            <Input
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
          </Field>
          <Field label="Barrio">
            <Input
              value={form.neighborhood}
              onChange={(e) => setForm({ ...form, neighborhood: e.target.value })}
            />
          </Field>
        </div>
        <Field label="Bio">
          <Textarea
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

