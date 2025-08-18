import ProfilesList from "@/components/profiles/profiles-list";
import ProfilesHeader from "@/components/profiles/profiles-header";
import ProfilesSkeleton from "@/components/profiles/profiles-skeleton";
import PageShell from "@/components/layout/page-shell";
import { Suspense } from "react";

export default function OficiosPage({ searchParams }: { searchParams?: Record<string, string> }) {
  return (
    <PageShell title="Profesionales de Oficios" description="Profesionales verificados para tus necesidades.">
      <ProfilesHeader category="workers" />
      <Suspense fallback={<ProfilesSkeleton />}>
        {/* @ts-expect-error Async Server Component */}
        <ProfilesList
          category="workers"
          filters={{ q: searchParams?.q, subcat: searchParams?.subcat, city: searchParams?.city, hood: searchParams?.hood }}
        />
      </Suspense>
    </PageShell>
  );
}
