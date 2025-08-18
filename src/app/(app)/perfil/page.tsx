import ProfileForm from "@/components/profile/profile-form";
import ProfileNav from "@/components/profile/profile-nav";
import PageShell from "@/components/layout/page-shell";

export default function PerfilPage() {
  return (
    <PageShell
      title="Mi perfil"
      description="Gestiona tus datos visibles en la plataforma."
    >
      <div className="flex flex-col gap-8 md:flex-row">
        <ProfileNav />
        <ProfileForm />
      </div>
    </PageShell>
  );
}

