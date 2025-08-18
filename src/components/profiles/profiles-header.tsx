"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { SUBCATEGORY_OPTIONS, type CategoryKey } from "@/lib/categories";

export default function ProfilesHeader({ category }: { category: CategoryKey }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [q, setQ] = useState(params.get("q") || "");
  const [showFilters, setShowFilters] = useState(false);
  const currentSub = params.get("subcat") || "";
  const options = SUBCATEGORY_OPTIONS[category];

  function updateSearch(next: { q?: string; subcat?: string }) {
    const sp = new URLSearchParams(params.toString());
    if (next.q !== undefined) {
      if (next.q) sp.set("q", next.q);
      else sp.delete("q");
    }
    if (next.subcat !== undefined) {
      if (next.subcat) sp.set("subcat", next.subcat);
      else sp.delete("subcat");
    }
    startTransition(() => router.push(`${pathname}?${sp.toString()}`));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateSearch({ q });
  }

  return (
    <div>
      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar profesionales por nombre, oficio o especialidad..."
          className="h-10 w-full flex-1 rounded-lg border border-black bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/40"
        />
        <button
          type="button"
          onClick={() => setShowFilters((v) => !v)}
          className="h-10 rounded-lg border border-brand bg-brand px-3 text-sm font-medium text-brand-foreground"
        >
          Filtros
        </button>
      </form>
      {showFilters && (
        <div className="mt-4 flex gap-2 overflow-x-auto">
          <button
            onClick={() => updateSearch({ subcat: "" })}
            className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs ${
              currentSub ? "border-brand/20 text-black" : "border-brand bg-brand text-brand-foreground"
            }`}
            disabled={isPending}
          >
            Todos
          </button>
          {options.map((o) => (
            <button
              key={o.key}
              onClick={() => updateSearch({ subcat: o.key })}
              className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs ${
                currentSub === o.key
                  ? "border-brand bg-brand text-brand-foreground"
                  : "border-brand/20 text-black"
              }`}
              disabled={isPending}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

