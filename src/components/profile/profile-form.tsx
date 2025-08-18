"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type ProfileInput = Partial<{
  first_name: string;
  last_name: string;
  phone_number: string;
  bio: string;
  country: string;
  city: string;
  neighborhood: string;
}>;

export default function ProfileForm({ initial }: { initial: ProfileInput }) {
  const [form, setForm] = useState<ProfileInput>({
    first_name: initial.first_name || "",
    last_name: initial.last_name || "",
    phone_number: initial.phone_number || "",
    bio: initial.bio || "",
    country: initial.country || "",
    city: initial.city || "",
    neighborhood: initial.neighborhood || "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(await res.text());
      setMessage("Perfil actualizado");
    } catch (e: any) {
      setMessage(e?.message || "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Nombre">
          <Input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
        </Field>
        <Field label="Apellido">
          <Input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
        </Field>
        <Field label="Teléfono">
          <Input value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} />
        </Field>
        <div />
        <Field label="País">
          <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
        </Field>
        <Field label="Ciudad">
          <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
        </Field>
        <Field label="Barrio">
          <Input value={form.neighborhood} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Bio">
            <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          </Field>
        </div>
      </div>
      {message && <p className="mt-3 text-sm text-black/60">{message}</p>}
      <div className="mt-4 flex justify-end">
        <Button onClick={save} disabled={saving}>
          {saving ? "Guardando..." : "Guardar"}
        </Button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-black/80">{label}</span>
      {children}
    </label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={
        "h-10 w-full rounded-lg border border-black/10 bg-white px-3 text-sm text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black/20 " +
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
        "min-h-24 w-full rounded-lg border border-black/10 bg-white p-3 text-sm text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black/20 " +
        (props.className || "")
      }
    />
  );
}

