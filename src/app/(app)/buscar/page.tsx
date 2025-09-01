import JobsList from "@/components/jobs/jobs-list";

export default async function BuscarPage() {
  return (
    <main className="min-h-[calc(100vh-80px)] bg-white">
      <section className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="text-2xl font-semibold text-black/90">Buscar trabajos</h1>
        <p className="mt-1 text-sm text-black/60">Mostrando empleos permanentes y temporales activos.</p>

        <div className="mt-6">
          {/* @ts-expect-error Async Server Component */}
          <JobsList limit={24} filters={{ modalityIn: ["permanent_job", "temporary"] }} />
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-semibold text-black/90">Trabajos recientes para creadores</h2>
          <p className="mt-1 text-sm text-black/60">Diseño, fotografía, influencers y más. Para los freelance mostramos el perfil.</p>
          <div className="mt-4">
            {/* @ts-expect-error Async Server Component */}
            <JobsList limit={12} filters={{ category: "creators" as any }} expandProfileForFreelance />
          </div>
        </div>
      </section>
    </main>
  );
}
