import JobForm from "@/components/jobs/job-form";

export default function CargarTrabajoPage() {
  return (
    <main className="min-h-[calc(100vh-80px)] bg-white">
      <section className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="text-2xl font-semibold text-brand">Cargar trabajo</h1>
        <p className="mt-1 text-sm text-brand/80">Publica tu oportunidad laboral aquí.</p>
        <JobForm />
      </section>
    </main>
  );
}
