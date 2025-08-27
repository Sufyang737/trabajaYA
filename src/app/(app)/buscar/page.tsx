import { getPocketBase } from "@/services/pb";
import { auth } from "@clerk/nextjs/server";
import { SUBCATEGORY_OPTIONS, type CategoryKey } from "@/lib/categories";
import SwipeCards from "@/components/search/swipe-cards";

type Candidate = {
  id: string;
  name: string;
  bio?: string;
  image?: string | null;
  location?: string;
  category: CategoryKey;
  subcategoryLabel?: string;
};

async function getCandidates(limit = 25): Promise<Candidate[]> {
  try {
    const { userId } = await auth();
    const pb = getPocketBase();
    // Excluir perfiles ya swiped por el usuario logueado
    const swipedIds = new Set<string>();
    if (userId) {
      try {
        const sw = await pb.collection("swipes").getList(1, 100, { filter: `clerk_id = "${userId}"` });
        for (const s of sw.items as any[]) swipedIds.add(s.profile_id);
      } catch {}
    }
    type InterestRecord = {
      category: CategoryKey;
      subcategory?: string;
      expand?: { profile_id?: { id: string; first_name?: string; last_name?: string; bio?: string; avatar?: string; city?: string; country?: string; neighborhood?: string } };
    };
    const res = await pb.collection("interests").getList<InterestRecord>(1, limit, {
      expand: "profile_id",
      sort: "-created",
    });
    const map = new Map<string, Candidate>();
    for (const it of res.items) {
      const p = it.expand?.profile_id;
      if (!p || map.has(p.id)) continue;
      if (swipedIds.has(p.id)) continue;
      const name = [p.first_name, p.last_name].filter(Boolean).join(" ") || "Perfil";
      const location = [p.neighborhood, p.city, p.country].filter(Boolean).join(", ");
      const url = process.env.POCKETBASE_URL ? `${process.env.POCKETBASE_URL}/api/files/profiles/${p.id}/${p.avatar}` : undefined;
      const subLabel = SUBCATEGORY_OPTIONS[it.category as CategoryKey]?.find((s) => s.key === it.subcategory)?.label;
      map.set(p.id, {
        id: p.id,
        name,
        bio: p.bio,
        image: p.avatar ? url || null : null,
        location,
        category: it.category as CategoryKey,
        subcategoryLabel: subLabel,
      });
    }
    pb.authStore.clear();
    return Array.from(map.values());
  } catch {
    return [];
  }
}

export default async function BuscarPage() {
  const candidates = await getCandidates(30);
  return (
    <main className="min-h-[calc(100vh-80px)] bg-white">
      <section className="mx-auto max-w-4xl px-6 py-8">
        <h1 className="text-2xl font-semibold text-black/90">Buscar</h1>
        <p className="mt-1 text-sm text-black/60">Deslizá para explorar perfiles y servicios.</p>

        <div className="mt-6">
          {/* @ts-expect-error Server/Client boundary */}
          <SwipeCards initialItems={candidates} />
        </div>
      </section>
    </main>
  );
}
