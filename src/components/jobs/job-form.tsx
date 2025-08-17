"use client";

import { useState } from "react";
import { CATEGORY_LABEL, SUBCATEGORY_OPTIONS, type CategoryKey } from "@/lib/categories";

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
};

export default function JobForm() {
  const [data, setData] = useState<FormData>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successUrl, setSuccessUrl] = useState<string | null>(null);

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
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error");
      const url = `${window.location.origin}/trabajo/${json.id}`;
      setSuccessUrl(url);
      setData(initialData);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error";
      setError(msg);
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
        <label htmlFor="title" className="block text-sm font-medium text-brand">
          Título
        </label>
        <input
          id="title"
          value={data.title}
          onChange={(e) => update("title", e.target.value)}
          required
          placeholder="Ej: Electricista para obra"
          className="mt-1 w-full rounded-lg border border-brand/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-brand">
          Descripción
        </label>
        <textarea
          id="description"
          value={data.description}
          onChange={(e) => update("description", e.target.value)}
          rows={4}
          required
          placeholder="Detalles del trabajo..."
          className="mt-1 w-full rounded-lg border border-brand/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-brand">
            Categoría
          </label>
          <select
            id="category"
            value={data.category}
            onChange={(e) =>
              setData((prev) => ({ ...prev, category: e.target.value as CategoryKey, subcategory: "" }))
            }
            className="mt-1 w-full rounded-lg border border-brand/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          >
            {Object.entries(CATEGORY_LABEL).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="subcategory" className="block text-sm font-medium text-brand">
            Subcategoría
          </label>
          <select
            id="subcategory"
            value={data.subcategory}
            onChange={(e) => update("subcategory", e.target.value)}
            className="mt-1 w-full rounded-lg border border-brand/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
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
          <label htmlFor="price" className="block text-sm font-medium text-brand">
            Precio
          </label>
          <input
            id="price"
            type="number"
            value={data.price ?? ""}
            onChange={(e) => update("price", e.target.value ? Number(e.target.value) : undefined)}
            placeholder="Monto"
            className="mt-1 w-full rounded-lg border border-brand/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
        <div>
          <label htmlFor="currency" className="block text-sm font-medium text-brand">
            Moneda
          </label>
          <input
            id="currency"
            value={data.currency}
            onChange={(e) => update("currency", e.target.value)}
            placeholder="ARS"
            className="mt-1 w-full rounded-lg border border-brand/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
        <div>
          <label htmlFor="price_unit" className="block text-sm font-medium text-brand">
            Unidad
          </label>
          <input
            id="price_unit"
            value={data.price_unit}
            onChange={(e) => update("price_unit", e.target.value)}
            placeholder="hora"
            className="mt-1 w-full rounded-lg border border-brand/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="modality" className="block text-sm font-medium text-brand">
            Modalidad
          </label>
          <input
            id="modality"
            value={data.modality}
            onChange={(e) => update("modality", e.target.value)}
            placeholder="full_time"
            className="mt-1 w-full rounded-lg border border-brand/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-brand">
            Estado
          </label>
          <input
            id="status"
            value={data.status}
            onChange={(e) => update("status", e.target.value)}
            placeholder="active"
            className="mt-1 w-full rounded-lg border border-brand/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="expires_at" className="block text-sm font-medium text-brand">
            Expira el
          </label>
          <input
            id="expires_at"
            type="date"
            value={data.expires_at}
            onChange={(e) => update("expires_at", e.target.value)}
            className="mt-1 w-full rounded-lg border border-brand/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-brand">
            Ciudad
          </label>
          <input
            id="city"
            value={data.city}
            onChange={(e) => update("city", e.target.value)}
            placeholder="Ej: Buenos Aires"
            className="mt-1 w-full rounded-lg border border-brand/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
        <div>
          <label htmlFor="neighborhood" className="block text-sm font-medium text-brand">
            Barrio
          </label>
          <input
            id="neighborhood"
            value={data.neighborhood}
            onChange={(e) => update("neighborhood", e.target.value)}
            placeholder="Ej: Palermo"
            className="mt-1 w-full rounded-lg border border-brand/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="h-10 rounded-lg bg-brand px-4 text-sm font-medium text-brand-foreground disabled:opacity-50"
      >
        {loading ? "Enviando..." : "Publicar"}
      </button>
    </form>
      {successUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 text-center shadow-lg">
            <h2 className="text-lg font-semibold text-brand">¡Trabajo creado!</h2>
            <p className="mt-2 text-sm text-black/70">Compartí este enlace:</p>
            <a
              href={successUrl}
              className="mt-4 block break-words text-sm text-brand underline"
            >
              {successUrl}
            </a>
            <button
              onClick={() => setSuccessUrl(null)}
              className="mt-6 w-full rounded-md bg-brand px-4 py-2 text-sm font-medium text-brand-foreground"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
}

