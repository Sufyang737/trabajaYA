import ProfileNav from "@/components/profile/profile-nav";
import PageShell from "@/components/layout/page-shell";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

export const dynamic = "force-dynamic";

export default async function ResenasPage() {
  return (
    <PageShell title="Reseñas" description="Gestiona y visualiza tus reseñas recibidas.">
      <SignedIn>
        <div className="flex flex-col gap-8 md:flex-row">
          <ProfileNav />
          <section className="flex-1">
            <div className="rounded-2xl border border-brand/10 bg-white p-6">
              <h2 className="mb-2 text-lg font-semibold text-foreground">Tus reseñas</h2>
              <p className="text-sm text-muted-foreground">
                Aún no tienes reseñas. Cuando recibas reseñas de tus clientes o contratantes, aparecerán aquí.
              </p>
            </div>
          </section>
        </div>
      </SignedIn>
      <SignedOut>
        <div className="rounded-2xl border border-brand/10 bg-white p-6 text-center">
          <h2 className="mb-2 text-lg font-semibold text-foreground">Inicia sesión para ver tus reseñas</h2>
          <p className="mb-4 text-sm text-muted-foreground">Tus reseñas están disponibles cuando estás autenticado.</p>
          <SignInButton mode="modal">
            <button className="btn btn-primary">Iniciar sesión</button>
          </SignInButton>
        </div>
      </SignedOut>
    </PageShell>
  );
}
