import ProfilesList from "@/components/profiles/profiles-list";
import ProfilesFilters from "@/components/profiles/profiles-filters";
import { Suspense } from "react";
import ProfilesSkeleton from "@/components/profiles/profiles-skeleton";

export default function OficiosPage({ searchParams }: { searchParams?: Record<string, string> }) {
  return (
    <main className="min-h-[calc(100vh-80px)] bg-white">
      <section className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="text-2xl font-semibold text-black/90">Oficios</h1>
        <p className="mt-1 text-sm text-black/60">Profesionales verificados para tus necesidades.</p>
        <div className="mt-6">
          <ProfilesFilters category="workers" />
        </div>
        <div className="mt-6">
          <Suspense fallback={<ProfilesSkeleton />}>
            {/* @ts-expect-error Async Server Component */}
            <ProfilesList
              category="workers"
              filters={{ q: searchParams?.q, subcat: searchParams?.subcat, city: searchParams?.city, hood: searchParams?.hood }}
            />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
