import ProfilesList from "@/components/profiles/profiles-list";
import ProfilesHeader from "@/components/profiles/profiles-header";
import { Suspense } from "react";
import ProfilesSkeleton from "@/components/profiles/profiles-skeleton";

export default function CreadoresPage({ searchParams }: { searchParams?: Record<string, string> }) {
  return (
    <main className="min-h-[calc(100vh-80px)] bg-white">
      <section className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="text-2xl font-semibold text-black/90">Creadores</h1>
        <p className="mt-1 text-sm text-black/60">Talento creativo para impulsar tu marca.</p>
        <div className="mt-6">
          <ProfilesHeader category="creators" />
        </div>
        <div className="mt-6">
          <Suspense fallback={<ProfilesSkeleton />}>
            {/* @ts-expect-error Async Server Component */}
            <ProfilesList
              category="creators"
              filters={{ q: searchParams?.q, subcat: searchParams?.subcat, city: searchParams?.city, hood: searchParams?.hood }}
            />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
