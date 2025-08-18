import Link from "next/link";
import { notFound } from "next/navigation";
import { getPocketBase, fileUrl } from "@/services/pb";
import { SUBCATEGORY_OPTIONS, type CategoryKey } from "@/lib/categories";

export const dynamic = "force-dynamic";

type Profile = {
  id: string;
  first_name?: string;
  last_name?: string;
  bio?: string;
  city?: string;
  neighborhood?: string;
  country?: string;
  avatar?: string;
  rating?: number;
  created?: string;
  jobs_completed?: number;
  success_rate?: number;
  on_time_rate?: number;
};

type Interest = { category: CategoryKey; subcategory?: string };

type Portfolio = {
  courses_url?: string;
  diplomas_url?: string;
};

type Availability = {
  day_of_week: string;
  start_time: string;
  end_time: string;
  is_active?: boolean;
};

const CATEGORY_PATH: Record<CategoryKey, string> = {
  workers: "oficios",
  creators: "creadores",
  providers: "proveedores",
};

const DAY_LABEL: Record<string, string> = {
  monday: "Lunes",
  tuesday: "Martes",
  wednesday: "Miércoles",
  thursday: "Jueves",
  friday: "Viernes",
  saturday: "Sábado",
  sunday: "Domingo",
};

async function getProfile(id: string) {
  const pb = getPocketBase();
  try {
    const profile = await pb.collection("profiles").getOne<Profile>(id);
    const interestsRes = await pb
      .collection("interests")
      .getList<Interest>(1, 10, { filter: `profile_id = "${id}"` });
    const portfolio = await pb
      .collection("portfolios")
      .getFirstListItem<Portfolio>(`profile_id = "${id}"`)
      .catch(() => null);
    const availabilityRes = await pb
      .collection("weekly_availabilities")
      .getList<Availability>(1, 20, { filter: `profile_id = "${id}"` })
      .catch(() => ({ items: [] }));
    return {
      profile,
      interests: interestsRes.items,
      portfolio,
      availability: availabilityRes.items,
    };
  } catch {
    return null;
  } finally {
    pb.authStore.clear();
  }
}

export default async function ProfessionalPage({ params }: { params: { id: string } }) {
  const data = await getProfile(params.id);
  if (!data) return notFound();
  const { profile, interests, portfolio, availability } = data;

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

  const certs = [portfolio?.diplomas_url, portfolio?.courses_url].filter(Boolean) as string[];

  const daysOrder = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];
  const availMap: Record<string, { start: string; end: string } | null> = {};
  for (const d of daysOrder) availMap[d] = null;
  for (const a of availability) {
    if (a.is_active === false) continue;
    availMap[a.day_of_week] = { start: a.start_time, end: a.end_time };
  }

  return (
    <main className="min-h-[calc(100vh-80px)] bg-white">
      <section className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-4 text-sm">
          <Link href={backHref} className="text-brand hover:underline">
            ← Volver a profesionales
          </Link>
        </div>

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

        {profile.bio && (
          <p className="mt-4 text-sm text-black/80">{profile.bio}</p>
        )}

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

        <nav className="mt-8 flex gap-6 border-b border-brand/10 text-sm">
          <span className="border-b-2 border-brand pb-2 font-medium text-brand">Resumen</span>
          <span className="pb-2 text-muted-foreground">Servicios</span>
          <span className="pb-2 text-muted-foreground">Portfolio</span>
          <span className="pb-2 text-muted-foreground">Reseñas</span>
        </nav>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-brand/10 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Información General</h2>
            <ul className="grid gap-2 text-sm text-black/80">
              {memberSince && (
                <li>
                  <span className="font-medium">Miembro desde:</span> {memberSince}
                </li>
              )}
              {location && (
                <li>
                  <span className="font-medium">Ubicación:</span> {location}
                </li>
              )}
            </ul>
          </div>

          <div className="rounded-2xl border border-brand/10 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Certificaciones</h2>
            {certs.length ? (
              <ul className="grid gap-2 text-sm text-black/80">
                {certs.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Sin certificaciones</p>
            )}
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-brand/10 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Disponibilidad</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-7">
            {daysOrder.map((d) => {
              const slot = availMap[d];
              return (
                <div
                  key={d}
                  className="rounded-lg border border-brand/10 bg-white p-3 text-center"
                >
                  <div className="text-sm font-medium text-foreground">{DAY_LABEL[d]}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {slot ? `${slot.start} - ${slot.end}` : "No disponible"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
