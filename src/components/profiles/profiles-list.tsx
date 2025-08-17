import { getPocketBase } from "@/services/pb";
import ProfileCard from "@/components/profiles/profile-card";

type Category = "workers" | "creators" | "providers";

export default async function ProfilesList({ category, limit = 30, filters }: { category: Category; limit?: number; filters?: { q?: string; subcat?: string; city?: string; hood?: string } }) {
  let profiles: any[] = [];
  try {
    const pb = getPocketBase();
    const subFilter = filters?.subcat ? ` && subcategory = "${filters.subcat}"` : "";
    const res = await pb.collection("interests").getList(1, limit, {
      filter: `category = "${category}"${subFilter}`,
      expand: "profile_id",
      sort: "-created",
    });
    const map = new Map<string, any>();
    for (const it of res.items) {
      const p = (it as any).expand?.profile_id;
      if (p && !map.has(p.id)) map.set(p.id, p);
    }
    profiles = Array.from(map.values());

    // In-memory filters on expanded profiles
    const q = filters?.q?.toLowerCase().trim();
    const city = filters?.city?.toLowerCase().trim();
    const hood = filters?.hood?.toLowerCase().trim();
    profiles = profiles.filter((p) => {
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
      <div className="rounded-2xl border border-black/10 bg-white p-8 text-center text-sm text-black/60">
        No hay resultados por el momento.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {profiles.map((p) => (
        <ProfileCard key={p.id} profile={p} />
      ))}
    </div>
  );
}
