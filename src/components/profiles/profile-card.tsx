type Profile = {
  id: string;
  first_name?: string;
  last_name?: string;
  bio?: string;
  city?: string;
  country?: string;
  neighborhood?: string;
  roles?: string[];
  links?: any;
};

export default function ProfileCard({ profile }: { profile: Profile }) {
  const name = [profile.first_name, profile.last_name].filter(Boolean).join(" ") || "Perfil";
  const location = [profile.neighborhood, profile.city, profile.country].filter(Boolean).join(", ");

  return (
    <article className="group overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm transition hover:shadow-md">
      <div className="grid gap-2 p-4">
        <h3 className="text-base font-semibold text-black/90 line-clamp-1">{name}</h3>
        {location && <div className="text-xs text-black/60">{location}</div>}
        {profile.bio && <p className="text-sm text-black/70 line-clamp-2">{profile.bio}</p>}
      </div>
    </article>
  );
}

