type Profile = {
  bio?: string;
  created?: string;
  neighborhood?: string;
  city?: string;
  country?: string;
};

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

const DAY_LABEL: Record<string, string> = {
  monday: "Lunes",
  tuesday: "Martes",
  wednesday: "Miércoles",
  thursday: "Jueves",
  friday: "Viernes",
  saturday: "Sábado",
  sunday: "Domingo",
};

export default function ProfileSummary({
  profile,
  portfolio,
  availability,
}: {
  profile: Profile;
  portfolio?: Portfolio | null;
  availability: Availability[];
}) {
  const memberSince = profile.created ? new Date(profile.created).getFullYear() : null;
  const location = [profile.neighborhood, profile.city, profile.country].filter(Boolean).join(", ");
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
    <div className="grid gap-6">
      {profile.bio && <p className="mt-2 text-sm text-black/80">{profile.bio}</p>}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-brand/10 bg-white p-6">
          <h4 className="mb-4 text-lg font-semibold text-foreground">Información General</h4>
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
          <h4 className="mb-4 text-lg font-semibold text-foreground">Certificaciones</h4>
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

      <div className="rounded-2xl border border-brand/10 bg-white p-6">
        <h4 className="mb-4 text-lg font-semibold text-foreground">Disponibilidad</h4>
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
    </div>
  );
}

