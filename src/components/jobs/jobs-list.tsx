import PocketBase from "pocketbase";
import JobsCard from "@/components/jobs/jobs-card";

type JobsListProps = {
  perPage?: number;
  page?: number;
};

export default async function JobsList({ perPage = 12, page = 1 }: JobsListProps) {
  const pbUrl = process.env.POCKETBASE_URL || "";
  const token = process.env.POCKETBASE_ADMIN_TOKEN || "";
  const pb = new PocketBase(pbUrl);
  if (token) pb.authStore.save(token, null);

  let items: any[] = [];
  try {
    if (!pbUrl || !token) throw new Error("PocketBase config missing");
    const res = await pb.collection("jobs").getList(page, perPage, {
      filter: 'status = "active"',
      sort: "-created",
    });
    items = res.items;
  } catch (e) {
    // ignore and show empty state
  } finally {
    pb.authStore.clear();
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
