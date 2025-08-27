import { fileUrl } from "@/services/pb";
import { CheckCircle2, Phone, Bookmark, Share2 } from "lucide-react";

export default function ProviderHero({
  profile,
  subcategoryLabel,
}: {
  profile: {
    id: string;
    first_name?: string;
    last_name?: string;
    avatar?: string;
    city?: string;
    country?: string;
    neighborhood?: string;
    rating?: number;
    created?: string;
  };
  subcategoryLabel?: string;
}) {
  const name = [profile.first_name, profile.last_name].filter(Boolean).join(" ") || "Proveedor";
  const avatar = profile.avatar ? fileUrl("profiles", profile.id, profile.avatar) : null;
  const location = [profile.neighborhood, profile.city, profile.country].filter(Boolean).join(", ");
  const rating = typeof profile.rating === "number" ? profile.rating.toFixed(1) : "4.8";
  const reviews = 124; // Placeholder hasta conectar reseñas reales
  const years = profile.created ? Math.max(1, new Date().getFullYear() - new Date(profile.created).getFullYear()) : 1;

  return (
    <div className="rounded-2xl border border-brand/10 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatar} alt={name} className="h-20 w-20 rounded-full object-cover" />
          ) : (
            <div className="h-20 w-20 rounded-full bg-brand/5" />
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold text-foreground">{name}</h1>
              <CheckCircle2 className="h-5 w-5 text-brand" />
              <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs text-black">Destacado</span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-black/70">
              {subcategoryLabel && <span className="badge">{subcategoryLabel}</span>}
              {location && <span className="badge">{location}</span>}
              <span className="badge">{years} años operando</span>
            </div>
            <div className="mt-1 text-sm text-black">
              ⭐ {rating} <span className="text-black/60">({reviews} reseñas)</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 self-start">
          <button className="btn btn-primary inline-flex items-center gap-1">
            <Phone className="h-4 w-4" /> Contactar
          </button>
          <button className="btn btn-outline inline-flex items-center gap-1">
            <Bookmark className="h-4 w-4" /> Guardar
          </button>
          <button className="btn btn-outline inline-flex items-center gap-1">
            <Share2 className="h-4 w-4" /> Compartir
          </button>
        </div>
      </div>

      {/* Métricas */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-brand/10 bg-white p-4 text-center">
          <div className="text-2xl font-semibold text-foreground">342</div>
          <div className="text-xs text-muted-foreground">Clientes activos</div>
        </div>
        <div className="rounded-xl border border-brand/10 bg-white p-4 text-center">
          <div className="text-2xl font-semibold text-foreground">98%</div>
          <div className="text-xs text-muted-foreground">Entregas a tiempo</div>
        </div>
        <div className="rounded-xl border border-brand/10 bg-white p-4 text-center">
          <div className="text-2xl font-semibold text-foreground">76%</div>
          <div className="text-xs text-muted-foreground">Clientes recurrentes</div>
        </div>
        <div className="rounded-xl border border-brand/10 bg-white p-4 text-center">
          <div className="text-2xl font-semibold text-foreground">{years}</div>
          <div className="text-xs text-muted-foreground">Años de experiencia</div>
        </div>
      </div>
    </div>
  );
}

