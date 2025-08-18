import JobForm from "@/components/jobs/job-form";
import PageShell from "@/components/layout/page-shell";

export default function CargarTrabajoPage() {
  return (
    <PageShell title="Cargar trabajo" description="Publica tu oportunidad laboral aquí.">
      <JobForm />
    </PageShell>
  );
}
