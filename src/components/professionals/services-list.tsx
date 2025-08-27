import Link from "next/link";
import { SUBCATEGORY_OPTIONS, type CategoryKey } from "@/lib/categories";

export type Interest = { category: CategoryKey; subcategory?: string };

function subcategoryLabel(category: CategoryKey, key?: string) {
  if (!key) return undefined;
  return SUBCATEGORY_OPTIONS[category]?.find((s) => s.key === key)?.label || key;
}

export default function ServicesList({
  interests,
  baseHref,
  showLinks = true,
}: {
  interests: Interest[];
  baseHref?: string; // e.g., "/profesionales/[id]/servicios"
  showLinks?: boolean;
}) {
  return (
    <div className="mt-6 rounded-2xl border border-brand/10 bg-white p-6">
      <h4 className="mb-4 text-lg font-semibold text-foreground">Servicios ofrecidos</h4>
      {interests.length ? (
        <ul className="grid gap-2 text-sm text-black/80">
          {interests.map((i, idx) => {
            const subLabel = subcategoryLabel(i.category, i.subcategory) || i.subcategory;
            const subKey = i.subcategory || "general";
            const content = (
              <>
                <span className="font-medium capitalize">{i.category}</span>
                {subLabel && <span className="text-black/70"> - {subLabel}</span>}
                {showLinks && <span className="ml-2 text-xs text-brand group-hover:underline">Ver detalle</span>}
              </>
            );
            return (
              <li key={idx}>
                {showLinks && baseHref ? (
                  <Link href={`${baseHref}/${encodeURIComponent(subKey)}`} className="group inline-flex items-center gap-2 rounded-md px-2 py-1 hover:bg-brand/5">
                    {content}
                  </Link>
                ) : (
                  <div className="inline-flex items-center gap-2 px-2 py-1">{content}</div>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">Este profesional aún no cargó servicios.</p>
      )}
    </div>
  );
}

