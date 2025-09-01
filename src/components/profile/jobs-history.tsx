"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Job = {
  id: string;
  title?: string;
  description?: string;
  category?: string;
  subcategory?: string;
  price?: number;
  currency?: string;
  price_unit?: string;
  modality?: string;
  status?: string;
  city?: string;
  neighborhood?: string;
  created?: string;
  photo_job?: string;
};

type ListResponse = {
  page: number;
  perPage: number;
  totalPages: number;
  totalItems: number;
  items: Job[];
};

const PRICE_UNIT_LABEL: Record<string, string> = {
  hour: "/hora",
  project: "/proyecto",
  monthly: "/mes",
};

function formatPrice(price?: number, currency?: string, unit?: string) {
  if (price == null) return null;
  try {
    const formatter = new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: currency === "USD" ? "USD" : "ARS",
      maximumFractionDigits: 0,
    });
    const label = PRICE_UNIT_LABEL[unit || ""] || "";
    return `${formatter.format(price)}${label ? ` ${label}` : ""}`;
  } catch {
    return `${price} ${currency || ""}`.trim();
  }
}

export default function JobsHistory() {
  const [data, setData] = useState<ListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/jobs?page=1&perPage=20`, { cache: "no-store" });
        if (!res.ok) throw new Error(await res.text());
        const json = (await res.json()) as ListResponse;
        setData(json);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Error cargando el historial");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <div className="skeleton h-32 w-full" />;
  }
  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }
  if (!data || data.items.length === 0) {
    return <p className="text-sm text-muted-foreground">Aún no hay registros en tu historial.</p>;
  }

  return (
    <ul className="divide-y divide-black/10 rounded-2xl border border-brand/10 bg-white">
      {data.items.map((job) => {
        const created = job.created ? new Date(job.created).toLocaleDateString("es-AR") : "";
        const price = formatPrice(job.price, job.currency, job.price_unit);
        return (
          <li key={job.id} className="flex items-center gap-3 p-4">
            {job.photo_job ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={job.photo_job} alt="Foto" className="h-12 w-12 rounded-lg object-cover" />
            ) : (
              <div className="h-12 w-12 rounded-lg bg-brand/10" />
            )}
            <div className="flex-1">
              <div className="text-sm font-semibold text-foreground">{job.title || job.subcategory || "Trabajo"}</div>
              <div className="mt-1 text-xs text-black/60">
                {created && <span>Publicado: {created}</span>}
                {job.status && <span className="ml-2">Estado: {job.status}</span>}
                {price && <span className="ml-2">Precio: {price}</span>}
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/trabajos/${job.id}`} className="btn btn-outline text-sm">
                Ver
              </Link>
              <Link href={`/trabajos/${job.id}/editar`} className="btn btn-primary text-sm">
                Editar
              </Link>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
