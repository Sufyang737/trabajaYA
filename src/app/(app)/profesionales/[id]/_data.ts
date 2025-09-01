import { getPocketBase } from "@/services/pb";
import { SUBCATEGORY_OPTIONS, type CategoryKey } from "@/lib/categories";

export type Profile = {
  id: string;
  first_name?: string;
  last_name?: string;
  bio?: string;
  city?: string;
  neighborhood?: string;
  country?: string;
  avatar?: string;
  avatar_url?: string;
  photo_client?: string;
  rating?: number;
  created?: string;
  jobs_completed?: number;
  success_rate?: number;
  on_time_rate?: number;
  // Contact details (optional)
  phone?: string;
  whatsapp?: string;
};

export type Interest = { category: CategoryKey; subcategory?: string };

export type Portfolio = {
  courses_url?: string;
  diplomas_url?: string;
};

export type Availability = {
  day_of_week: string;
  start_time: string;
  end_time: string;
  is_active?: boolean;
};

export async function getProfileData(id: string) {
  const pb = getPocketBase();
  try {
    const profile = await pb.collection("profiles").getOne<Profile>(id);
    const interestsRes = await pb
      .collection("interests")
      .getList<Interest>(1, 20, { filter: `profile_id = "${id}"` });
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
  } finally {
    pb.authStore.clear();
  }
}

export function subcategoryLabel(category: CategoryKey, key?: string) {
  if (!key) return undefined;
  return SUBCATEGORY_OPTIONS[category]?.find((s) => s.key === key)?.label;
}
