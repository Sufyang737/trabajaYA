"use client";

import { useState } from "react";
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
      setData(initialData);
      Swal.fire({
        title: "¡Trabajo creado!",
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
            <Input
              id="currency"
              value={data.currency}
              onChange={(e) => update("currency", e.target.value)}
              placeholder="ARS"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="price_unit">Unidad</Label>
            <Input
              id="price_unit"
              value={data.price_unit}
              onChange={(e) => update("price_unit", e.target.value)}
              placeholder="hora"
              className="mt-1"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="modality">Modalidad</Label>
            <Input
              id="modality"
              value={data.modality}
              onChange={(e) => update("modality", e.target.value)}
              placeholder="full_time"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="status">Estado</Label>
            <Input
              id="status"
              value={data.status}
              onChange={(e) => update("status", e.target.value)}
              placeholder="active"
              className="mt-1"
            />
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

