import PocketBase from "pocketbase";
import JobsCard from "@/components/jobs/jobs-card";

type Category = "workers" | "creators" | "providers";

type JobsListProps = {
  limit?: number;
  filters?: {
    category?: Category;
    subcat?: string;
    city?: string;
    hood?: string;
    q?: string;
  };
};

export default async function JobsList({ limit = 12, filters }: JobsListProps) {
  const pbUrl = process.env.POCKETBASE_URL || "";
  const token = process.env.POCKETBEASE_ADMIN_TOKEN || process.env.POCKETBASE_ADMIN_TOKEN || "";
  const pb = new PocketBase(pbUrl);
  if (token) pb.authStore.save(token, null);

  let items: any[] = [];
  try {
    if (!pbUrl || !token) throw new Error("PB config missing");
    let filter = 'status = "active"';
    if (filters?.category) filter += ` && category = "${filters.category}"`;
    if (filters?.subcat) filter += ` && subcategory = "${filters.subcat}"`;
    const res = await pb.collection("jobs").getList(1, limit, { filter, sort: "-created" });
    items = res.items;
  } catch (e) {
    // ignore and show empty state
  } finally {
    pb.authStore.clear();
  }

  // In-memory filters
  const q = filters?.q?.toLowerCase().trim();
  const city = filters?.city?.toLowerCase().trim();
  const hood = filters?.hood?.toLowerCase().trim();
  if (q || city || hood) {
    items = items.filter((job) => {
      const title = (job.title || "").toLowerCase();
      const description = (job.description || "").toLowerCase();
      const jCity = (job.city || "").toLowerCase();
      const jHood = (job.neighborhood || "").toLowerCase();
      if (q && !(title.includes(q) || description.includes(q))) return false;
      if (city && !jCity.includes(city)) return false;
      if (hood && !jHood.includes(hood)) return false;
      return true;
    });
  }

  if (!items.length) {
    return (
      <div className="rounded-2xl border border-black/10 bg-white p-8 text-center text-sm text-black/60">
        No hay trabajos activos por el momento.
      </div>
    );
  }

  const fileBase = pbUrl ? `${pbUrl}/api/files` : undefined;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((job) => (
        <JobsCard key={job.id} job={job} imageBaseUrl={fileBase} />
      ))}
    </div>
  );
}
