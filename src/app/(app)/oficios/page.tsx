import ProfilesList from "@/components/profiles/profiles-list";
import ProfilesHeader from "@/components/profiles/profiles-header";
import { Suspense } from "react";
import ProfilesSkeleton from "@/components/profiles/profiles-skeleton";

function buildQuery(sp: Record<string, string | undefined>) {
  const q = new URLSearchParams();
  Object.entries(sp).forEach(([k, v]) => {
    if (v) q.set(k, String(v));
  });
  return q.toString();
}

export default function OficiosPage({ searchParams }: { searchParams?: Record<string, string> }) {
  const page = Number(searchParams?.page || 1);
  return (
    <main className="min-h-[calc(100vh-80px)] bg-white">
      <section className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="text-2xl font-semibold text-black">Profesionales de Oficios</h1>
        <p className="mt-1 text-sm text-black/80">Profesionales verificados para tus necesidades.</p>
        <div className="mt-6">
          <ProfilesHeader category="workers" />
        </div>
        <div className="mt-6">
          <Suspense fallback={<ProfilesSkeleton />}>
            {/* @ts-expect-error Async Server Component */}
            <ProfilesList
              category="workers"
              filters={{ q: searchParams?.q, subcat: searchParams?.subcat, city: searchParams?.city, hood: searchParams?.hood }}
              page={page}
              />
          </Suspense>
        </div>
        <div className="mt-6 flex justify-center">
          <a className="btn btn-outline" href={`?${buildQuery({ ...searchParams, page: String(page + 1) })}`}>
            Cargar más
          </a>
        </div>
      </section>
    </main>
  );
}
