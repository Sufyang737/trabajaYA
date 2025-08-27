import ProfilesList from "@/components/profiles/profiles-list";
import ProfilesHeader from "@/components/profiles/profiles-header";
import ProfilesSkeleton from "@/components/profiles/profiles-skeleton";
import PageShell from "@/components/layout/page-shell";
import { Suspense } from "react";

export default async function OficiosPage({
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
    <PageShell title="Profesionales de Oficios" description="Profesionales verificados para tus necesidades.">
      <ProfilesHeader category="workers" />
      <Suspense fallback={<ProfilesSkeleton />}>
        {/* @ts-expect-error Async Server Component */}
        <ProfilesList
          category="workers"
          filters={filters}
          hideEmpty
        />
      </Suspense>
    </PageShell>
  );
}
