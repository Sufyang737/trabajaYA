import { notFound } from "next/navigation";
import { getProfileData } from "../../_data";
import { SUBCATEGORY_OPTIONS, type CategoryKey } from "@/lib/categories";

export const dynamic = "force-dynamic";

function subcategoryLabel(category: CategoryKey, key?: string) {
  if (!key) return undefined;
  return SUBCATEGORY_OPTIONS[category]?.find((s) => s.key === key)?.label || key;
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string; subcat: string }>;
}) {
  const { id, subcat } = await params;
  const data = await getProfileData(id);
  if (!data) return notFound();
  const { profile, interests } = data;

  const category = interests[0]?.category as CategoryKey | undefined;
  const label = category ? subcategoryLabel(category, subcat) : subcat;

  const name = [profile.first_name, profile.last_name].filter(Boolean).join(" ") || "Perfil";
  const location = [profile.neighborhood, profile.city, profile.country].filter(Boolean).join(", ");
  const rating = typeof profile.rating === "number" ? profile.rating.toFixed(1) : "-";

  return (
    <section className="mt-6 grid gap-6">
      {/* Encabezado de servicio */}
      <div className="rounded-2xl border border-brand/10 bg-white p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">{label}</h2>
            <p className="text-sm text-black/70">Servicio ofrecido por {name}{location ? ` · ${location}` : ""}</p>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-primary">Contactar</button>
            <button className="btn btn-outline">Compartir perfil</button>
          </div>
        </div>
      </div>

      {/* Calificación + métricas principales */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-brand/10 bg-white p-6">
          <div className="text-sm text-muted-foreground">Calificación</div>
          <div className="mt-1 text-2xl font-semibold text-foreground">{rating} / 5 ⭐</div>
        </div>
        <div className="rounded-2xl border border-brand/10 bg-white p-6">
          <div className="text-sm text-muted-foreground">Seguidores</div>
          <div className="mt-1 text-2xl font-semibold text-foreground">—</div>
        </div>
        <div className="rounded-2xl border border-brand/10 bg-white p-6">
          <div className="text-sm text-muted-foreground">Vistas promedio</div>
          <div className="mt-1 text-2xl font-semibold text-foreground">—</div>
        </div>
        <div className="rounded-2xl border border-brand/10 bg-white p-6">
          <div className="text-sm text-muted-foreground">Engagement</div>
          <div className="mt-1 text-2xl font-semibold text-foreground">—</div>
        </div>
      </div>

      {/* Tabs ya están en el layout superior; aquí dejamos contenido propio del servicio */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="grid gap-6 lg:col-span-2">
          {/* Resumen del servicio */}
          <div className="rounded-2xl border border-brand/10 bg-white p-6">
            <h3 className="mb-3 text-lg font-semibold text-foreground">Resumen del servicio</h3>
            <p className="text-sm text-black/80">
              Descripción breve del servicio de {label}. El creador puede detallar su propuesta de valor,
              alcance, entregables y formatos. Si no hay descripción específica, se muestra esta guía.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs text-black">Destacado</span>
              <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs text-black">Verificado</span>
            </div>
          </div>

          {/* Estadísticas detalladas */}
          <div className="rounded-2xl border border-brand/10 bg-white p-6">
            <h3 className="mb-3 text-lg font-semibold text-foreground">Estadísticas</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-brand/10 p-4">
                <div className="text-xs text-muted-foreground">Visualizaciones</div>
                <div className="mt-1 text-xl font-semibold text-foreground">—</div>
              </div>
              <div className="rounded-lg border border-brand/10 p-4">
                <div className="text-xs text-muted-foreground">Crecimiento mensual</div>
                <div className="mt-1 text-xl font-semibold text-foreground">—</div>
              </div>
              <div className="rounded-lg border border-brand/10 p-4">
                <div className="text-xs text-muted-foreground">Engagement</div>
                <div className="mt-1 text-xl font-semibold text-foreground">—</div>
              </div>
              <div className="rounded-lg border border-brand/10 p-4">
                <div className="text-xs text-muted-foreground">Colaboraciones</div>
                <div className="mt-1 text-xl font-semibold text-foreground">—</div>
              </div>
            </div>
          </div>
        </div>

        {/* Info de contacto / oferta */}
        <aside className="grid gap-6 lg:col-span-1">
          <div className="rounded-2xl border border-brand/10 bg-white p-6">
            <h3 className="mb-3 text-lg font-semibold text-foreground">Información de contacto</h3>
            <ul className="grid gap-2 text-sm text-black/80">
              <li>
                <span className="font-medium">Precio:</span> —
              </li>
              <li>
                <span className="font-medium">Disponibilidad:</span> —
              </li>
              <li>
                <span className="font-medium">Tiempo de respuesta:</span> —
              </li>
              <li>
                <span className="font-medium">Idiomas:</span> —
              </li>
            </ul>
            <div className="mt-4 flex gap-2">
              <button className="btn btn-primary">Contactar</button>
              <button className="btn btn-outline">Compartir</button>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

