import JobsList from "@/components/jobs/jobs-list";

export default function BuscarFreelancerPage() {
  return (
    <main className="min-h-[calc(100vh-80px)] bg-white">
      <section className="mx-auto max-w-4xl px-6 py-8">
        <h1 className="text-2xl font-semibold text-black/90">Buscar trabajos freelancer</h1>
        <p className="mt-1 text-sm text-black/60">Explorá ofertas freelance por categoría y ubicación.</p>
        <div className="mt-6">
          {/* Listado de trabajos activos */}
          {/* @ts-expect-error Async Server Component */}
          <JobsList />
        </div>
      </section>
    </main>
  );
}
