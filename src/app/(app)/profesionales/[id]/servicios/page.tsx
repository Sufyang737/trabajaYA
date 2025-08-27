import Link from "next/link";
import { notFound } from "next/navigation";
import { getProfileData, subcategoryLabel } from "../_data";

export const dynamic = "force-dynamic";

export default async function ServiciosPage({ params }: { params: { id: string } }) {
  const data = await getProfileData(params.id);
  if (!data) return notFound();
  const { interests } = data;

  return (
    <div className="mt-6 rounded-2xl border border-brand/10 bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold text-foreground">Servicios ofrecidos</h2>
      {interests.length ? (
        <ul className="grid gap-2 text-sm text-black/80">
          {interests.map((i, idx) => {
            const subLabel = subcategoryLabel(i.category, i.subcategory) || i.subcategory;
            const subKey = i.subcategory || "general";
            return (
              <li key={idx}>
                <Link
                  href={encodeURIComponent(subKey)}
                  className="group inline-flex items-center gap-2 rounded-md px-2 py-1 hover:bg-brand/5"
                >
                  <span className="font-medium capitalize">{i.category}</span>
                  {subLabel && <span className="text-black/70">- {subLabel}</span>}
                  <span className="ml-2 text-xs text-brand group-hover:underline">Ver detalle</span>
                </Link>
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
