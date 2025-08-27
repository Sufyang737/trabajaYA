import ProfilesList from "@/components/profiles/profiles-list";
import ProfilesHeader from "@/components/profiles/profiles-header";
import ProfilesSkeleton from "@/components/profiles/profiles-skeleton";
import PageShell from "@/components/layout/page-shell";
import { Suspense } from "react";
import JobsList from "@/components/jobs/jobs-list";

export default async function ProveedoresPage({
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
    <PageShell title="Proveedores" description="Productos y servicios para tu negocio.">
      <ProfilesHeader category="providers" />
      <Suspense fallback={<ProfilesSkeleton />}>
        {/* @ts-expect-error Async Server Component */}
        <ProfilesList
          category="providers"
          filters={filters}
          hideEmpty
        />
      </Suspense>
      <div className="mt-8">
        <h2 className="mb-3 text-lg font-semibold text-black/80">Trabajos recientes para proveedores</h2>
        {/* @ts-expect-error Async Server Component */}
        <JobsList
          filters={{
            category: "providers",
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
