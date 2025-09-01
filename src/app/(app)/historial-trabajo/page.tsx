import ProfileNav from "@/components/profile/profile-nav";
import PageShell from "@/components/layout/page-shell";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import JobsHistory from "@/components/profile/jobs-history";

export const dynamic = "force-dynamic";

export default async function HistorialTrabajoPage() {
  return (
    <PageShell title="Historial de trabajo" description="Revisa tus postulaciones y trabajos realizados.">
      <SignedIn>
        <div className="flex flex-col gap-8 md:flex-row">
          <ProfileNav />
          <section className="flex-1">
            <div className="rounded-2xl border border-brand/10 bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold text-foreground">Tus actividades</h2>
              <JobsHistory />
            </div>
          </section>
        </div>
      </SignedIn>
      <SignedOut>
        <div className="rounded-2xl border border-brand/10 bg-white p-6 text-center">
          <h2 className="mb-2 text-lg font-semibold text-foreground">Inicia sesión para ver tu historial</h2>
          <p className="mb-4 text-sm text-muted-foreground">Tu historial de trabajo está disponible cuando estás autenticado.</p>
          <SignInButton mode="modal">
            <button className="btn btn-primary">Iniciar sesión</button>
          </SignInButton>
        </div>
      </SignedOut>
    </PageShell>
  );
}
