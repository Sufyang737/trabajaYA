import ProfilesList from "@/components/profiles/profiles-list";
import ProfilesHeader from "@/components/profiles/profiles-header";
import ProfilesSkeleton from "@/components/profiles/profiles-skeleton";
import PageShell from "@/components/layout/page-shell";
import { Suspense } from "react";

export default function CreadoresPage({ searchParams }: { searchParams?: Record<string, string> }) {
  return (
    <PageShell title="Creadores" description="Talento creativo para impulsar tu marca.">
      <ProfilesHeader category="creators" />
      <Suspense fallback={<ProfilesSkeleton />}>
        {/* @ts-expect-error Async Server Component */}
        <ProfilesList
          category="creators"
          filters={{ q: searchParams?.q, subcat: searchParams?.subcat, city: searchParams?.city, hood: searchParams?.hood }}
        />
      </Suspense>
    </PageShell>
  );
}
