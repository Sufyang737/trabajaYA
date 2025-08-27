import Link from "next/link";
import { fileUrl } from "@/services/pb";
import TabsNav from "./_components/TabsNav";
import { getProfileData } from "./_data";
import { SUBCATEGORY_OPTIONS } from "@/lib/categories";
import ProviderHero from "@/components/providers/provider-hero";

export const dynamic = "force-dynamic";

const CATEGORY_PATH: Record<string, string> = {
  workers: "oficios",
  creators: "creadores",
  providers: "proveedores",
};

export default async function ProfessionalLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const resolved = await params;
  const id = resolved.id;
  const { profile, interests } = await getProfileData(id);

  const name = [profile.first_name, profile.last_name].filter(Boolean).join(" ") || "Perfil";
  const location = [profile.neighborhood, profile.city, profile.country].filter(Boolean).join(", ");
  const avatar = profile.avatar ? fileUrl("profiles", profile.id, profile.avatar) : null;
  const rating = typeof profile.rating === "number" ? profile.rating.toFixed(1) : null;

  const mainInterest = interests[0];
  const subcatLabel = mainInterest
    ? SUBCATEGORY_OPTIONS[mainInterest.category]?.find((s) => s.key === mainInterest.subcategory)?.label
    : undefined;
  const backHref = mainInterest ? `/${CATEGORY_PATH[mainInterest.category]}` : "/oficios";
  const memberSince = profile.created ? new Date(profile.created).getFullYear() : null;
  const metrics = {
    jobs: profile.jobs_completed ?? 0,
    success: profile.success_rate ? `${profile.success_rate}%` : "0%",
    onTime: profile.on_time_rate ? `${profile.on_time_rate}%` : "0%",
    since: memberSince ?? "-",
  };

  const isProvider = mainInterest?.category === "providers";

  return (
    <main className="min-h-[calc(100vh-80px)] bg-white">
      <section className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-4 text-sm">
          <Link href={backHref} className="text-brand hover:underline">
            ← Volver a profesionales
          </Link>
        </div>
        {isProvider ? (
          <ProviderHero profile={profile} subcategoryLabel={subcatLabel} />
        ) : (
          <>
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                {avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatar}
                    alt={name}
                    className="h-20 w-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-brand/5" />
                )}
                <div>
                  <h1 className="text-2xl font-semibold text-foreground">{name}</h1>
                  {subcatLabel && <div className="text-sm text-black">{subcatLabel}</div>}
                  {rating && <div className="mt-1 text-sm text-black">⭐ {rating}</div>}
                  {location && <div className="mt-1 text-sm text-muted-foreground">{location}</div>}
                </div>
              </div>
              <div className="flex gap-2">
                <button className="btn btn-primary">Contactar</button>
                <button className="btn btn-outline">Guardar</button>
                <button className="btn btn-outline">Compartir</button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-xl border border-brand/10 bg-white p-4 text-center">
                <div className="text-2xl font-semibold text-foreground">{metrics.jobs}</div>
                <div className="text-xs text-muted-foreground">Trabajos</div>
              </div>
              <div className="rounded-xl border border-brand/10 bg-white p-4 text-center">
                <div className="text-2xl font-semibold text-foreground">{metrics.success}</div>
                <div className="text-xs text-muted-foreground">Tasa de éxito</div>
              </div>
              <div className="rounded-xl border border-brand/10 bg-white p-4 text-center">
                <div className="text-2xl font-semibold text-foreground">{metrics.onTime}</div>
                <div className="text-xs text-muted-foreground">Entregas a tiempo</div>
              </div>
              <div className="rounded-xl border border-brand/10 bg-white p-4 text-center">
                <div className="text-2xl font-semibold text-foreground">{metrics.since}</div>
                <div className="text-xs text-muted-foreground">Miembro desde</div>
              </div>
            </div>
          </>
        )}

        <TabsNav
          baseHref={`/profesionales/${id}`}
          tabs={
            isProvider
              ? [
                  { href: `/profesionales/${id}`, label: "Resumen", key: "resumen" },
                  { href: `/profesionales/${id}/productos`, label: "Productos", key: "productos" },
                  { href: `/profesionales/${id}/catalogo`, label: "Catálogo", key: "catalogo" },
                  { href: `/profesionales/${id}/resenas`, label: "Reseñas", key: "resenas" },
                ]
              : undefined
          }
        />

        {children}
      </section>
    </main>
  );
}
