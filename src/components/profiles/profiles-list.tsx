import { getPocketBase } from "@/services/pb";
import ProfileCard from "@/components/profiles/profile-card";
import { SUBCATEGORY_OPTIONS } from "@/lib/categories";

type Category = "workers" | "creators" | "providers";

export default async function ProfilesList({
  category,
  limit = 30,
  filters,
}: {
  category: Category;
  limit?: number;
  filters?: { q?: string; subcat?: string; city?: string; hood?: string };
}) {
  let profiles: { profile: any; subcat?: string }[] = [];
  try {
    const pb = getPocketBase();
    const subFilter = filters?.subcat ? ` && subcategory = "${filters.subcat}"` : "";
    const res = await pb.collection("interests").getList(1, limit, {
      filter: `category = "${category}"${subFilter}`,
      expand: "profile_id",
      sort: "-created",
    });
    const map = new Map<string, { profile: any; subcat?: string }>();
    for (const it of res.items) {
      const p = (it as any).expand?.profile_id;
      if (p && !map.has(p.id)) map.set(p.id, { profile: p, subcat: (it as any).subcategory });
    }
    profiles = Array.from(map.values());

    // In-memory filters on expanded profiles
    const q = filters?.q?.toLowerCase().trim();
    const city = filters?.city?.toLowerCase().trim();
    const hood = filters?.hood?.toLowerCase().trim();
    profiles = profiles.filter(({ profile: p }) => {
      const name = `${p.first_name || ""} ${p.last_name || ""}`.toLowerCase();
      const bio = (p.bio || "").toLowerCase();
      const pCity = (p.city || "").toLowerCase();
      const pHood = (p.neighborhood || "").toLowerCase();
      if (q && !(name.includes(q) || bio.includes(q))) return false;
      if (city && !pCity.includes(city)) return false;
      if (hood && !pHood.includes(hood)) return false;
      return true;
    });
  } catch (e) {
    profiles = [];
  }

  if (!profiles.length) {
    return (
      <div className="rounded-2xl border border-brand/10 bg-white p-8 text-center text-sm text-muted-foreground">
        No hay resultados por el momento.
      </div>
    );
  }

  const count = profiles.length;
  return (
    <div>
      <div className="mb-4 text-sm text-brand">{`Mostrando ${count} profesionales`}</div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {profiles.map(({ profile, subcat }) => {
          const label = SUBCATEGORY_OPTIONS[category].find((o) => o.key === subcat)?.label;
          return <ProfileCard key={profile.id} profile={profile} subcategory={label} />;
        })}
      </div>
    </div>
  );
}
