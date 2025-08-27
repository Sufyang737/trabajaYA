import Link from "next/link";
import { fileUrl } from "@/services/pb";
import { Star, MapPin } from "lucide-react";

type Profile = {
  id: string;
  first_name?: string;
  last_name?: string;
  city?: string;
  country?: string;
  neighborhood?: string;
  avatar?: string;
  rating?: number;
};

export default function ProfileCard({ profile, subcategory }: { profile: Profile; subcategory?: string }) {
  const name = [profile.first_name, profile.last_name].filter(Boolean).join(" ") || "Perfil";
  const location = [profile.neighborhood, profile.city, profile.country].filter(Boolean).join(", ");
  const image = profile.avatar ? fileUrl("profiles", profile.id, profile.avatar) : null;

  return (
    <Link href={`/profesionales/${profile.id}`} className="block">
      <article className="group overflow-hidden rounded-2xl border border-brand/10 bg-white shadow-sm transition hover:shadow-md">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="Foto del perfil" className="h-40 w-full object-cover" />
        ) : (
          <div className="h-40 w-full bg-brand/5" />
        )}
        <div className="grid gap-2 p-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="line-clamp-1 text-base font-semibold text-foreground">{name}</h3>
            {typeof profile.rating === "number" && (
              <div className="flex items-center gap-1 text-xs text-black">
                <Star className="h-4 w-4 fill-brand text-brand" />
                {profile.rating.toFixed(1)}
              </div>
            )}
          </div>
          {subcategory && (
            <span className="inline-block rounded-full bg-brand/10 px-2 py-0.5 text-xs text-black">{subcategory}</span>
          )}
          {location && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 text-black" />
              <span>{location}</span>
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}

