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
      <form onSubmit={onSubmit}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar profesionales por nombre, oficio o especialidad..."
          className="h-10 w-full rounded-lg border border-black/10 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
        />
      </form>
      <div className="mt-4 flex gap-2 overflow-x-auto">
        <button
          onClick={() => updateSearch({ subcat: "" })}
          className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs ${
            currentSub ? "border-black/10 text-black/60" : "border-black bg-black text-white"
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
                ? "border-black bg-black text-white"
                : "border-black/10 text-black/60"
            }`}
            disabled={isPending}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

