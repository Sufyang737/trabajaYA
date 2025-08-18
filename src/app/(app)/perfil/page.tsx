import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getPocketBase } from "@/services/pb";
import ProfileForm from "@/components/profile/profile-form";

export default async function PerfilPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  let profile: any = {};
  try {
    const pb = getPocketBase();
    profile = await pb.collection("profiles").getFirstListItem(`clerk_id = "${userId}"`);
  } catch {
    profile = {};
  }

  return (
    <main className="min-h-[calc(100vh-80px)] bg-white">
      <section className="mx-auto max-w-3xl px-6 py-8">
        <h1 className="text-2xl font-semibold text-black/90">Mi perfil</h1>
        <p className="mt-1 text-sm text-black/60">Gestioná tus datos visibles en la plataforma.</p>

        <div className="mt-6">
          <ProfileForm initial={profile} />
        </div>
      </section>
    </main>
  );
}
