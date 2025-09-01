"use client";

import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { CATEGORY_LABEL, SUBCATEGORY_OPTIONS, type CategoryKey } from "@/lib/categories";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface FormData {
  title: string;
  description: string;
  category: CategoryKey;
  subcategory: string;
  price?: number;
  currency: string;
  price_unit: string;
  modality: string;
  status: string;
  expires_at: string;
  city: string;
  neighborhood: string;
  photo_job?: string;
}

const initialData: FormData = {
  title: "",
  description: "",
  category: "workers",
  subcategory: "",
  price: undefined,
  currency: "ARS",
  price_unit: "hour",
  modality: "full_time",
  status: "active",
  expires_at: "",
  city: "",
  neighborhood: "",
  photo_job: undefined,
};

export default function JobForm({ jobId }: { jobId?: string }) {
  const [data, setData] = useState<FormData>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prefilling, setPrefilling] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Prefill when editing
  useEffect(() => {
    if (!jobId) return;
    let cancelled = false;
    (async () => {
      try {
        setPrefilling(true);
        const res = await fetch(`/api/jobs/${jobId}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "No se pudo cargar el trabajo");
        const j = json.record as any;
        if (cancelled) return;
        setData({
          title: j.title || "",
          description: j.description || "",
          category: (j.category as any) || "workers",
          subcategory: j.subcategory || "",
          price: typeof j.price === "number" ? j.price : undefined,
          currency: j.currency || "ARS",
          price_unit: j.price_unit || "hour",
          modality: j.modality || "full_time",
          status: j.status || "active",
          expires_at: j.expires_at ? new Date(j.expires_at).toISOString().slice(0, 10) : "",
          city: j.city || "",
          neighborhood: j.neighborhood || "",
          photo_job: j.photo_job || undefined,
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error cargando el trabajo");
      } finally {
        setPrefilling(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [jobId]);

  // Enums como opciones seleccionables
  const CURRENCY_OPTIONS = [
    { value: "ARS", label: "ARS" },
    { value: "USD", label: "USD" },
  ];

  const PRICE_UNIT_OPTIONS = [
    { value: "hour", label: "Por hora" },
    { value: "project", label: "Por proyecto" },
    { value: "monthly", label: "Por mes" },
  ];

  const MODALITY_OPTIONS = [
    { value: "full_time", label: "Tiempo completo" },
    { value: "part_time", label: "Medio tiempo" },
    { value: "freelance", label: "Freelance" },
    { value: "per_hour", label: "Por hora" },
    { value: "temporary", label: "Temporal" },
    { value: "permanent_job", label: "Permanente" },
  ];

  const STATUS_OPTIONS = [
    { value: "active", label: "Activo" },
    { value: "draft", label: "Borrador" },
  ];

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const payload = {
      ...data,
      price: data.price ? Number(data.price) : undefined,
      expires_at: data.expires_at ? new Date(data.expires_at).toISOString() : undefined,
    };
    try {
      const endpoint = jobId ? `/api/jobs/${jobId}` : "/api/jobs";
      const method = jobId ? "PATCH" : "POST";
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error");
      const id = json.record?.id || json.id;
      const url = `${window.location.origin}/trabajos/${id}`;
      if (!jobId) setData(initialData);
      Swal.fire({
        title: jobId ? "¡Trabajo actualizado!" : "¡Trabajo creado!",
        html: `<a href="${url}" class="underline text-brand" target="_blank">${url}</a>`,
        icon: "success",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error";
      setError(msg);
      Swal.fire({ title: "Error", text: msg, icon: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-4 rounded-2xl border border-brand/10 bg-white p-6 shadow-sm"
      >
        <div>
          <Label>Imagen del trabajo (opcional)</Label>
          <div className="mt-2 flex items-center gap-4">
            {data.photo_job ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.photo_job} alt="Foto del trabajo" className="h-16 w-16 rounded-lg object-cover" />
            ) : (
              <div className="h-16 w-16 rounded-lg bg-brand/10" />
            )}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={async (e) => {
                  const file = e.target.files?.[0] || null;
                  if (!file) return;
                  try {
                    setPhotoUploading(true);
                    const fd = new FormData();
                    fd.append("file", file);
                    const res = await fetch("/api/upload-job-photo", { method: "POST", body: fd });
                    const json = await res.json();
                    if (!res.ok) throw new Error(json.error || "Error subiendo imagen");
                    setData((prev) => ({ ...prev, photo_job: json.url }));
                  } catch (e) {
                    Swal.fire({ title: "Error", text: e instanceof Error ? e.message : "Error", icon: "error" });
                  } finally {
                    setPhotoUploading(false);
                  }
                }}
              />
              <Button type="button" variant="outline" className="mt-1" onClick={() => fileInputRef.current?.click()} disabled={photoUploading}>
                {photoUploading ? "Subiendo..." : data.photo_job ? "Cambiar imagen" : "Subir imagen"}
              </Button>
            </div>
          </div>
        </div>
        {prefilling && (
          <div className="skeleton h-6 w-48" />
        )}
        <div>
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            value={data.title}
            onChange={(e) => update("title", e.target.value)}
            required
            placeholder="Ej: Electricista para obra"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            value={data.description}
            onChange={(e) => update("description", e.target.value)}
            rows={4}
            required
            placeholder="Detalles del trabajo..."
            className="mt-1"
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="category">Categoría</Label>
            <select
              id="category"
              value={data.category}
              onChange={(e) =>
                setData((prev) => ({ ...prev, category: e.target.value as CategoryKey, subcategory: "" }))
              }
              className="mt-1 w-full rounded-md border border-brand/20 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            >
              {Object.entries(CATEGORY_LABEL).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="subcategory">Subcategoría</Label>
            <select
              id="subcategory"
              value={data.subcategory}
              onChange={(e) => update("subcategory", e.target.value)}
              className="mt-1 w-full rounded-md border border-brand/20 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <option value="">Selecciona...</option>
              {SUBCATEGORY_OPTIONS[data.category].map((o) => (
                <option key={o.key} value={o.key}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="price">Precio</Label>
            <Input
              id="price"
              type="number"
              value={data.price ?? ""}
              onChange={(e) => update("price", e.target.value ? Number(e.target.value) : undefined)}
              placeholder="Monto"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="currency">Moneda</Label>
            <select
              id="currency"
              value={data.currency}
              onChange={(e) => update("currency", e.target.value)}
              className="mt-1 w-full rounded-md border border-brand/20 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            >
              {CURRENCY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="price_unit">Unidad</Label>
            <select
              id="price_unit"
              value={data.price_unit}
              onChange={(e) => update("price_unit", e.target.value)}
              className="mt-1 w-full rounded-md border border-brand/20 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            >
              {PRICE_UNIT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="modality">Modalidad</Label>
            <select
              id="modality"
              value={data.modality}
              onChange={(e) => update("modality", e.target.value)}
              className="mt-1 w-full rounded-md border border-brand/20 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            >
              {MODALITY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="status">Estado</Label>
            <select
              id="status"
              value={data.status}
              onChange={(e) => update("status", e.target.value)}
              className="mt-1 w-full rounded-md border border-brand/20 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="expires_at">Expira el</Label>
            <Input
              id="expires_at"
              type="date"
              value={data.expires_at}
              onChange={(e) => update("expires_at", e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="city">Ciudad</Label>
            <Input
              id="city"
              value={data.city}
              onChange={(e) => update("city", e.target.value)}
              placeholder="Ej: Buenos Aires"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="neighborhood">Barrio</Label>
            <Input
              id="neighborhood"
              value={data.neighborhood}
              onChange={(e) => update("neighborhood", e.target.value)}
              placeholder="Ej: Palermo"
              className="mt-1"
            />
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={loading} className="mt-2">
          {loading ? "Enviando..." : "Publicar"}
        </Button>
      </form>
    </>
  );
}
