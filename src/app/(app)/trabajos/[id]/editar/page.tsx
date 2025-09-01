import PageShell from "@/components/layout/page-shell";
import JobForm from "@/components/jobs/job-form";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

export default async function EditarTrabajoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <PageShell title="Editar trabajo" description="Actualiza los detalles de tu publicación.">
      <SignedIn>
        <JobForm jobId={id} />
      </SignedIn>
      <SignedOut>
        <div className="rounded-2xl border border-brand/10 bg-white p-6 text-center">
          <h2 className="mb-2 text-lg font-semibold text-foreground">Inicia sesión para editar</h2>
          <p className="mb-4 text-sm text-muted-foreground">Debes estar autenticado para editar tus trabajos.</p>
          <SignInButton mode="modal">
            <button className="btn btn-primary">Iniciar sesión</button>
          </SignInButton>
        </div>
      </SignedOut>
    </PageShell>
  );
}

