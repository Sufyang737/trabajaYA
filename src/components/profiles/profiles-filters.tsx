"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SUBCATEGORY_OPTIONS, type CategoryKey } from "@/lib/categories";
import { Button } from "@/components/ui/button";
import { useMemo, useState, useTransition } from "react";

export default function ProfilesFilters({ category }: { category: CategoryKey }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [q, setQ] = useState(params.get("q") || "");
  const [subcat, setSubcat] = useState(params.get("subcat") || "");
  const [city, setCity] = useState(params.get("city") || "");
  const [hood, setHood] = useState(params.get("hood") || "");

  const options = useMemo(() => SUBCATEGORY_OPTIONS[category], [category]);

  function apply() {
    const sp = new URLSearchParams(params.toString());
    q ? sp.set("q", q) : sp.delete("q");
    subcat ? sp.set("subcat", subcat) : sp.delete("subcat");
    city ? sp.set("city", city) : sp.delete("city");
    hood ? sp.set("hood", hood) : sp.delete("hood");
    startTransition(() => router.push(`${pathname}?${sp.toString()}`));
  }

  function reset() {
    setQ("");
    setSubcat("");
    setCity("");
    setHood("");
    startTransition(() => router.push(pathname));
  }

  return (
    <div className="rounded-2xl border border-brand/10 bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-medium text-brand">Buscar</label>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Nombre o bio"
            className="h-10 w-full rounded-lg border border-brand/20 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-brand">Subcategoría</label>
          <select
            value={subcat}
            onChange={(e) => setSubcat(e.target.value)}
            className="h-10 w-full rounded-lg border border-brand/20 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
          >
            <option value="">Todas</option>
            {options.map((o) => (
              <option key={o.key} value={o.key}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-brand">Ciudad</label>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Ciudad"
            className="h-10 w-full rounded-lg border border-brand/20 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-brand">Barrio</label>
          <input
            value={hood}
            onChange={(e) => setHood(e.target.value)}
            placeholder="Barrio"
            className="h-10 w-full rounded-lg border border-brand/20 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
          />
        </div>
      </div>
      <div className="mt-3 flex items-center justify-end gap-2">
        <Button variant="outline" onClick={reset} disabled={isPending}>
          Limpiar
        </Button>
        <Button onClick={apply} disabled={isPending}>
          Aplicar filtros
        </Button>
      </div>
    </div>
  );
}

