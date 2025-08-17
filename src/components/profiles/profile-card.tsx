import { fileUrl } from "@/services/pb";

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
            <span className="text-xs text-black">{profile.rating.toFixed(1)}</span>
          )}
        </div>
        {subcategory && <div className="text-sm text-black">{subcategory}</div>}
        {location && <div className="text-xs text-muted-foreground">{location}</div>}
      </div>
    </article>
  );
}

