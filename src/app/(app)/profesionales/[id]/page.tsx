import { notFound } from "next/navigation";
import { getProfileData } from "./_data";
import { SUBCATEGORY_OPTIONS } from "@/lib/categories";

export const dynamic = "force-dynamic";

const DAY_LABEL: Record<string, string> = {
  monday: "Lunes",
  tuesday: "Martes",
  wednesday: "Miércoles",
  thursday: "Jueves",
  friday: "Viernes",
  saturday: "Sábado",
  sunday: "Domingo",
};

export default async function ProfessionalPage({ params }: { params: { id: string } }) {
  const data = await getProfileData(params.id);
  if (!data) return notFound();
  const { profile, portfolio, availability, interests } = data as any;

  const mainInterest = interests?.[0];
  const isProvider = mainInterest?.category === "providers";

  const memberSince = profile.created ? new Date(profile.created).getFullYear() : null;
  const location = [profile.neighborhood, profile.city, profile.country].filter(Boolean).join(", ");
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

  if (isProvider) {
    const years = memberSince ? Math.max(1, new Date().getFullYear() - memberSince) : undefined;
    return (
      <>
        {profile.bio && <p className="mt-4 text-sm text-black/80">{profile.bio}</p>}

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-brand/10 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Información General</h2>
            <p className="text-sm text-black/80 mb-3">
              Somos un proveedor especializado en productos de {mainInterest?.subcategory ? (SUBCATEGORY_OPTIONS["providers"].find(s => s.key === mainInterest.subcategory)?.label || mainInterest.subcategory) : "categoría"}.
            </p>
            <ul className="grid gap-2 text-sm text-black/80">
              {memberSince && (
                <li>
                  <span className="font-medium">Empresa fundada:</span> {memberSince}
                </li>
              )}
              {location && (
                <li>
                  <span className="font-medium">Ubicación:</span> {location}
                </li>
              )}
              <li>
                <span className="font-medium">Tiempo de respuesta:</span> 24 horas
              </li>
              <li>
                <span className="font-medium">Envío nacional:</span> Disponible
              </li>
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
              <ul className="grid gap-2 text-sm text-black/80">
                <li>Cámara Argentina de Comercio (CAC • 2015)</li>
                <li>Certificación de Calidad Textil (INTI • 2018)</li>
              </ul>
            )}
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-brand/10 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Condiciones comerciales</h2>
          <ul className="grid gap-2 text-sm text-black/80">
            <li>
              <span className="font-medium">Pedido mínimo:</span> $50.000 o 50 unidades surtidas
            </li>
            <li>
              <span className="font-medium">Formas de pago:</span> transferencia, efectivo, tarjetas (hasta 3 cuotas sin interés)
            </li>
            <li>
              <span className="font-medium">Tiempo de entrega:</span> 3–5 días hábiles (AMBA), 5–10 (interior)
            </li>
          </ul>
        </div>
      </>
    );
  }

  return (
    <>
      {profile.bio && <p className="mt-4 text-sm text-black/80">{profile.bio}</p>}

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
              <div key={d} className="rounded-lg border border-brand/10 bg-white p-3 text-center">
                <div className="text-sm font-medium text-foreground">{DAY_LABEL[d]}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {slot ? `${slot.start} - ${slot.end}` : "No disponible"}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
