import ProfilesList from "@/components/profiles/profiles-list";
import ProfilesFilters from "@/components/profiles/profiles-filters";
import { Suspense } from "react";
import ProfilesSkeleton from "@/components/profiles/profiles-skeleton";

export default function ProveedoresPage({ searchParams }: { searchParams?: Record<string, string> }) {
  return (
    <main className="min-h-[calc(100vh-80px)] bg-white">
      <section className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="text-2xl font-semibold text-black/90">Proveedores</h1>
        <p className="mt-1 text-sm text-black/60">Productos y servicios para tu negocio.</p>
        <div className="mt-6">
          <ProfilesFilters category="providers" />
        </div>
        <div className="mt-6">
          <Suspense fallback={<ProfilesSkeleton />}>
            {/* @ts-expect-error Async Server Component */}
            <ProfilesList
              category="providers"
              filters={{ q: searchParams?.q, subcat: searchParams?.subcat, city: searchParams?.city, hood: searchParams?.hood }}
            />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
