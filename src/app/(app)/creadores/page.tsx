import ProfilesList from "@/components/profiles/profiles-list";
import ProfilesHeader from "@/components/profiles/profiles-header";
import ProfilesSkeleton from "@/components/profiles/profiles-skeleton";
import PageShell from "@/components/layout/page-shell";
import { Suspense } from "react";
import JobsList from "@/components/jobs/jobs-list";
export default async function CreadoresPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const filters = {
    q: Array.isArray(sp.q) ? sp.q[0] : sp.q,
    subcat: Array.isArray(sp.subcat) ? sp.subcat[0] : sp.subcat,
    city: Array.isArray(sp.city) ? sp.city[0] : sp.city,
    hood: Array.isArray(sp.hood) ? sp.hood[0] : sp.hood,
  };
  return (
    <PageShell title="Creadores" description="Talento creativo para impulsar tu marca.">
      <ProfilesHeader category="creators" />
      <Suspense fallback={<ProfilesSkeleton />}>
        {/* @ts-expect-error Async Server Component */}
        <ProfilesList
          category="creators"
          filters={filters}
          hideEmpty
        />
      </Suspense>
      <div className="mt-8">
        <h2 className="mb-3 text-lg font-semibold text-black/80">Trabajos recientes para creadores</h2>
        {/* Listado de trabajos filtrados por categoría = creators */}
        {/* @ts-expect-error Async Server Component */}
        <JobsList
          filters={{
            category: "creators",
            subcat: filters.subcat,
            city: filters.city,
            hood: filters.hood,
            q: filters.q,
          }}
        />
      </div>
    </PageShell>
  );
}
