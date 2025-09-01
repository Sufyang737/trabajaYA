import PageShell from "@/components/layout/page-shell";
import ProfileNav from "@/components/profile/profile-nav";
import JobsCard from "@/components/jobs/jobs-card";
import { SignInButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { getPocketBase, fileUrl } from "@/services/pb";

type Job = any;
type Profile = {
  id: string;
  first_name?: string;
  last_name?: string;
  avatar?: string;
  avatar_url?: string;
  photo_client?: string;
  city?: string;
  country?: string;
  neighborhood?: string;
};

async function fetchSaved(userId: string) {
  const pb = getPocketBase();
  try {
    const me = await pb.collection("profiles").getFirstListItem(`clerk_id = "${userId}"`);

    const jobsSaves = await pb.collection("saves").getList(1, 100, { filter: `profile_id = "${me.id}"` });
    const jobIds = jobsSaves.items.map((it: any) => it.job_id).filter(Boolean) as string[];
    const jobs: Job[] = [];
    for (const id of jobIds) {
      try {
        const j = await pb.collection("jobs").getOne(id);
        jobs.push(j);
      } catch {}
    }

    let profiles: Profile[] = [];
    try {
      const profSaves = await pb
        .collection("saved_profiles")
        .getList(1, 100, { filter: `saver_profile_id = "${me.id}"` });
      const profileIds = profSaves.items.map((it: any) => it.target_profile_id).filter(Boolean) as string[];
      const tmp: Profile[] = [];
      for (const pid of profileIds) {
        try {
          const p = await pb.collection("profiles").getOne<Profile>(pid);
          tmp.push(p);
        } catch {}
      }
      profiles = tmp;
    } catch {
      // collection may not exist yet
      profiles = [];
    }

    return { jobs, profiles };
  } finally {
    pb.authStore.clear();
  }
}

export default async function GuardadosPage() {
  const { userId } = await auth();
  if (!userId) {
    return (
      <PageShell title="Guardados" description="Tus trabajos y perfiles guardados.">
        <div className="rounded-2xl border border-brand/10 bg-white p-6 text-center">
          <h2 className="mb-2 text-lg font-semibold text-foreground">Inicia sesión para ver tus guardados</h2>
          <p className="mb-4 text-sm text-muted-foreground">Debes estar autenticado para ver tus guardados.</p>
          <SignInButton mode="modal">
            <button className="btn btn-primary">Iniciar sesión</button>
          </SignInButton>
        </div>
      </PageShell>
    );
  }

  const saved = await fetchSaved(userId);

  return (
    <PageShell title="Guardados" description="Tus trabajos y perfiles guardados.">
      <div className="flex flex-col gap-8 md:flex-row">
        <ProfileNav />
        <section className="flex-1 grid gap-8">
          <div>
            <h2 className="mb-3 text-lg font-semibold text-foreground">Trabajos guardados</h2>
                  {saved.jobs.length ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {saved.jobs.map((j: any) => (
                        <JobsCard key={j.id} job={j} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No tenés trabajos guardados.</p>
                  )}
                </div>

          <div>
            <h2 className="mb-3 text-lg font-semibold text-foreground">Perfiles guardados</h2>
                  {saved.profiles.length ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {saved.profiles.map((p) => {
                  const name = [p.first_name, p.last_name].filter(Boolean).join(" ") || "Perfil";
                  const avatar = p.photo_client
                    ? p.photo_client
                    : p.avatar_url
                    ? p.avatar_url
                    : p.avatar
                    ? (p.avatar.startsWith("http") ? p.avatar : fileUrl("profiles", p.id, p.avatar))
                    : null;
                  const location = [p.neighborhood, p.city, p.country].filter(Boolean).join(", ");
                  return (
                    <a key={p.id} href={`/profesionales/${p.id}`} className="block group">
                      <article className="relative flex items-center gap-3 rounded-2xl border border-black/10 bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-sm">
                        <div className="absolute right-3 top-3">
                          {/* icon variant save button to allow quick un-save */}
                          {/* @ts-expect-error server/client boundary acceptable */}
                          <SaveProfileButton profileId={p.id} variant="icon" />
                        </div>
                        {avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={avatar} alt={name} className="h-12 w-12 rounded-full object-cover" />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-brand/10" />
                        )}
                        <div>
                          <div className="text-sm font-semibold text-foreground">{name}</div>
                          {location && <div className="text-xs text-black/60">{location}</div>}
                        </div>
                      </article>
                    </a>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No tenés perfiles guardados.</p>
            )}
          </div>
        </section>
      </div>
    </PageShell>
  );
}
