import JobsList from "@/components/jobs/jobs-list";

function buildQuery(sp: Record<string, string | undefined>) {
  const q = new URLSearchParams();
  Object.entries(sp).forEach(([k, v]) => {
    if (v) q.set(k, String(v));
  });
  return q.toString();
}

export default function BuscarFreelancerPage({ searchParams }: { searchParams?: Record<string, string> }) {
  const page = Number(searchParams?.page || 1);
  return (
    <main className="min-h-[calc(100vh-80px)] bg-white">
      <section className="mx-auto max-w-4xl px-6 py-8">
        <h1 className="text-2xl font-semibold text-black/90">Buscar trabajos freelancer</h1>
        <p className="mt-1 text-sm text-black/60">Explorá ofertas freelance por categoría y ubicación.</p>
        <div className="mt-6">
          {/* Listado de trabajos activos */}
          {/* @ts-expect-error Async Server Component */}
          <JobsList page={page} perPage={12} />
          <div className="mt-6 flex justify-center">
            <a
              className="btn btn-outline"
              href={`?${buildQuery({ ...searchParams, page: String(page + 1) })}`}
            >
              Cargar más
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
