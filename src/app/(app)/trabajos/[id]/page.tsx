import Link from "next/link";
import PocketBase from "pocketbase";
import { notFound } from "next/navigation";
import { getProfileData } from "../../profesionales/[id]/_data";
import ProfileSummary from "@/components/professionals/profile-summary";
import ServicesList from "@/components/professionals/services-list";
import PortfolioSection from "@/components/professionals/portfolio-section";
import ReviewsSection from "@/components/professionals/reviews-section";
import JobProfileTabs from "@/components/jobs/job-profile-tabs";
import ProviderHero from "@/components/providers/provider-hero";
import ShareButton from "@/components/common/share-button";
import SaveJobButton from "@/components/saves/save-job-button";

export const dynamic = "force-dynamic";

type JobRecord = {
  id: string;
  title?: string;
  description?: string;
  category?: string;
  subcategory?: string;
  profile_id?: string;
  price?: number;
  currency?: "ARS" | "USD" | string;
  price_unit?: "hour" | "project" | "monthly" | string;
  modality?: "full_time" | "part_time" | "freelance" | "per_hour" | "temporary" | "permanent_job" | string;
  status?: string;
  city?: string;
  neighborhood?: string;
  images?: string[];
  photo_job?: string;
  created?: string;
};

// day labels handled in reused components when needed

const CATEGORY_LABEL: Record<string, string> = {
  workers: "Trabajadores",
  creators: "Creadores",
  providers: "Proveedores",
};

const SUBCATEGORY_LABEL: Record<string, string> = {
  electrician: "Electricista",
  plumber: "Plomero",
  carpenter: "Carpintero",
  painter: "Pintor",
  gas_fitter: "Gasista",
  gardener: "Jardinero",
  mechanic: "Mecánico",
  hairdresser: "Peluquero",
  construction: "Construcción",
  youtuber: "YouTuber",
  influencer: "Influencer",
  photographer: "Fotógrafo",
  podcaster: "Podcaster",
  designer: "Diseñador",
  musician: "Músico",
  gamer: "Gamer",
  clothing_textile: "Indumentaria y textil",
  automotive: "Automotriz",
  appliances: "Electrodomésticos",
  technology: "Tecnología",
  fashion_accessories: "Accesorios de moda",
  toys: "Juguetes",
  food: "Alimentos",
  electronics: "Electrónica",
};

const PRICE_UNIT_LABEL: Record<string, string> = {
  hour: "/hora",
  project: "/proyecto",
  monthly: "/mes",
};

const MODALITY_LABEL: Record<string, string> = {
  full_time: "Tiempo completo",
  part_time: "Medio tiempo",
  freelance: "Freelance",
  per_hour: "Por hora",
  temporary: "Temporal",
  permanent_job: "Permanente",
};

function formatPrice(price?: number, currency?: string, unit?: string) {
  if (price == null) return null;
  const formatter = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: currency === "USD" ? "USD" : "ARS",
    maximumFractionDigits: 0,
  });
  const label = PRICE_UNIT_LABEL[unit || ""] || "";
  return `${formatter.format(price)}${label ? ` ${label}` : ""}`;
}

async function getJob(id: string) {
  const pbUrl = process.env.POCKETBASE_URL || "";
  const token = process.env.POCKETBASE_ADMIN_TOKEN || "";
  if (!pbUrl || !token) return null;
  const pb = new PocketBase(pbUrl);
  pb.authStore.save(token, null);
  try {
    const job = await pb.collection("jobs").getOne<JobRecord>(id);
    return { job, fileBase: `${pbUrl}/api/files` };
  } catch {
    return null;
  } finally {
    pb.authStore.clear();
  }
}

import type { Profile as TProfile, Portfolio as TPortfolio, Availability as TAvailability, Interest as TInterest } from "../../profesionales/[id]/_data";
type ProfileData = { profile: TProfile; portfolio: TPortfolio | null; availability: TAvailability[]; interests: TInterest[] } | null;
type CreatorProps = {
  job: JobRecord;
  cat?: string | null;
  sub?: string | null;
  price?: string | null;
  modality?: string | null;
  location?: string | null;
  created?: string | null;
  images: string[];
  profileData?: ProfileData;
};

function CreatorServiceView({ job, cat, sub, price, modality, location, created, images, profileData }: CreatorProps) {
  const profile = profileData?.profile;
  const portfolio = profileData?.portfolio;
  const P1: any = profile as any;
  const rawPhone =
    P1?.whatsapp ||
    P1?.phone ||
    P1?.whatsapp_number ||
    P1?.phone_number ||
    P1?.telefono ||
    P1?.celular ||
    P1?.mobile ||
    P1?.mobile_phone;
  const waPhone = rawPhone ? rawPhone.replace(/[^0-9]/g, "") : "";
  const waHref = waPhone ? `https://wa.me/${waPhone}` : null;
  return (
    <main className="min-h-[calc(100vh-80px)] bg-white">
      <section className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-4 text-sm">
          <Link href="/buscar-freelancer" className="text-black/60 hover:text-black">← Volver</Link>
        </div>

        {/* Cabecera de perfil/servicio */}
        <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">{job.title || sub || "Servicio de creador"}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-black/70">
                {cat && <span className="badge">{cat}</span>}
                {sub && <span className="badge">{sub}</span>}
                {modality && <span className="badge">{modality}</span>}
                {location && <span className="badge">{location}</span>}
                {created && <span className="badge">Publicado {created}</span>}
                <span className="badge">Destacado</span>
                <span className="badge">Verificado</span>
              </div>
              {job.description && (
                <p className="mt-3 max-w-2xl text-sm text-black/80">{job.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2 self-start">
              {price && <span className="rounded-full bg-brand px-3 py-1 text-xs font-medium text-white">{price}</span>}
              {waHref ? (
                <a href={waHref} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                  Contactar
                </a>
              ) : (
                <button className="btn btn-primary">Contactar</button>
              )}
              <SaveJobButton jobId={job.id} />
              <ShareButton className="btn btn-outline">Compartir perfil</ShareButton>
            </div>
          </div>
        </div>

        {/* Galería de imágenes del trabajo */}
        {images && images.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={images[0]} alt="Imagen principal" className="col-span-3 h-64 w-full rounded-xl object-cover sm:col-span-2" />
            {images.slice(1, 4).map((src: string, i: number) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={src} alt="Imagen" className="h-32 w-full rounded-xl object-cover" />
            ))}
          </div>
        )}

        {/* Métricas */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-black/10 bg-white p-6">
            <div className="text-sm text-black/60">Calificación</div>
            <div className="mt-1 text-2xl font-semibold text-foreground">— ⭐</div>
          </div>
          <div className="rounded-2xl border border-black/10 bg-white p-6">
            <div className="text-sm text-black/60">Seguidores</div>
            <div className="mt-1 text-2xl font-semibold text-foreground">—</div>
          </div>
          <div className="rounded-2xl border border-black/10 bg-white p-6">
            <div className="text-sm text-black/60">Vistas promedio</div>
            <div className="mt-1 text-2xl font-semibold text-foreground">—</div>
          </div>
          <div className="rounded-2xl border border-black/10 bg-white p-6">
            <div className="text-sm text-black/60">Engagement</div>
            <div className="mt-1 text-2xl font-semibold text-foreground">—</div>
          </div>
        </div>

        {/* Contenido + Aside */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="grid gap-6 lg:col-span-2">
            <JobProfileTabs
              resumen={
                <div className="grid gap-6">
                  <div>
                    <h3 className="mb-2 text-lg font-semibold text-foreground">Resumen del servicio</h3>
                    <p className="text-sm text-black/80">
                      Presentación del creador y el servicio ofrecido. Podés detallar el alcance, entregables y formatos. Si no hay
                      descripción específica, se muestra este texto guía.
                    </p>
                  </div>
                  {profileData && (
                    <ProfileSummary
                      profile={profile}
                      portfolio={portfolio}
                      availability={profileData.availability}
                    />
                  )}
                </div>
              }
              portfolio={<PortfolioSection items={[portfolio?.diplomas_url, portfolio?.courses_url].filter(Boolean) as string[]} />}
              servicios={
                profileData ? (
                  <ServicesList
                    interests={profileData.interests}
                    baseHref={`/profesionales/${profile?.id}/servicios`}
                  />
                ) : (
                  <div />
                )
              }
              resenas={<ReviewsSection />}
            />

            <div className="rounded-2xl border border-black/10 bg-white p-6">
              <h3 className="mb-3 text-lg font-semibold text-foreground">Estadísticas</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-black/10 p-4">
                  <div className="text-xs text-black/60">Visualizaciones</div>
                  <div className="mt-1 text-xl font-semibold text-foreground">—</div>
                </div>
                <div className="rounded-lg border border-black/10 p-4">
                  <div className="text-xs text-black/60">Crecimiento mensual</div>
                  <div className="mt-1 text-xl font-semibold text-foreground">—</div>
                </div>
                <div className="rounded-lg border border-black/10 p-4">
                  <div className="text-xs text-black/60">Engagement</div>
                  <div className="mt-1 text-xl font-semibold text-foreground">—</div>
                </div>
                <div className="rounded-lg border border-black/10 p-4">
                  <div className="text-xs text-black/60">Colaboraciones</div>
                  <div className="mt-1 text-xl font-semibold text-foreground">—</div>
                </div>
              </div>
            </div>
          </div>

          <aside className="h-fit rounded-2xl border border-black/10 bg-white p-6">
            <h3 className="mb-3 text-lg font-semibold text-foreground">Información de contacto</h3>
            <ul className="grid gap-2 text-sm text-black/80">
              {price && (
                <li>
                  <span className="font-medium">Precio:</span> {price}
                </li>
              )}
              {modality && (
                <li>
                  <span className="font-medium">Modalidad:</span> {modality}
                </li>
              )}
              {location && (
                <li>
                  <span className="font-medium">Ubicación:</span> {location}
                </li>
              )}
              <li>
                <span className="font-medium">Disponibilidad:</span> —
              </li>
              <li>
                <span className="font-medium">Tiempo de respuesta:</span> —
              </li>
              <li>
                <span className="font-medium">Idiomas:</span> —
              </li>
            </ul>
            <div className="mt-4 flex gap-2">
              <button className="btn btn-primary">Postular</button>
              <button className="btn btn-outline">Guardar</button>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getJob(id);
  if (!data?.job) return notFound();

  const { job, fileBase } = data;
  const cat = CATEGORY_LABEL[job.category || ""] || job.category;
  const sub = SUBCATEGORY_LABEL[job.subcategory || ""] || job.subcategory;
  const price = formatPrice(job.price, job.currency, job.price_unit);
  const modality = MODALITY_LABEL[job.modality || ""] || job.modality;
  const created = job.created ? new Date(job.created).toLocaleDateString("es-AR") : null;
  const location = [job.neighborhood, job.city].filter(Boolean).join(", ");
  const images = (job.images || []).map((img) => `${fileBase}/jobs/${job.id}/${img}`);

  if (job.category === "creators") {
    const profileData = job.profile_id ? await getProfileData(job.profile_id) : null;
    return (
      <CreatorServiceView
        job={job}
        cat={cat}
        sub={sub}
        price={price}
        modality={modality}
        location={location}
        created={created}
        images={images}
        profileData={profileData}
      />
    );
  }

  if (job.category === "providers") {
    const profileData = job.profile_id ? await getProfileData(job.profile_id) : null;
    const nameLocation = location;
    const P2: any = profileData?.profile as any;
    const rawPhone =
      P2?.whatsapp ||
      P2?.phone ||
      P2?.whatsapp_number ||
      P2?.phone_number ||
      P2?.telefono ||
      P2?.celular ||
      P2?.mobile ||
      P2?.mobile_phone;
    const waPhone = rawPhone ? rawPhone.replace(/[^0-9]/g, "") : "";
    const waHref = waPhone ? `https://wa.me/${waPhone}` : null;
    const hero = job.photo_job || images[0];
    return (
      <main className="min-h-[calc(100vh-80px)] bg-white">
        <section className="mx-auto max-w-5xl px-6 py-8">
          <div className="mb-4 text-sm">
            <Link href="/buscar-freelancer" className="text-black/60 hover:text-black">← Volver</Link>
          </div>

          {/* Encabezado del trabajo */}
          <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-foreground">{job.title || sub || "Trabajo"}</h1>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-black/70">
                  {cat && <span className="badge">{cat}</span>}
                  {sub && <span className="badge">{sub}</span>}
                  {modality && <span className="badge">{modality}</span>}
                  {nameLocation && <span className="badge">{nameLocation}</span>}
                  {created && <span className="badge">Publicado {created}</span>}
                </div>
                {job.description && (
                  <p className="mt-3 max-w-2xl text-sm text-black/80">{job.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2 self-start">
                {price && <span className="rounded-full bg-brand px-3 py-1 text-xs font-medium text-white">{price}</span>}
                <SaveJobButton jobId={job.id} />
                <ShareButton className="btn btn-outline">Compartir</ShareButton>
                {waHref ? (
                  <a href={waHref} target="_blank" rel="noopener noreferrer" className="btn btn-primary">Contactar</a>
                ) : (
                  <button className="btn btn-primary">Contactar</button>
                )}
              </div>
            </div>
          </div>

          {/* Imagen destacada (si hay) */}
          {hero && (
            <div className="mt-4 overflow-hidden rounded-2xl border border-black/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={hero} alt="Imagen del trabajo" className="h-72 w-full object-cover" />
            </div>
          )}

          {/* Hero de proveedor */}
          {profileData && (
            <ProviderHero profile={profileData.profile} subcategoryLabel={sub} />
          )}

          {/* Tabs y contenido reutilizado del perfil */}
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="grid gap-6 lg:col-span-2">
              <JobProfileTabs
                resumen={
                  <div className="grid gap-6">
                    {profileData && (
                      <ProfileSummary
                        profile={profileData.profile}
                        portfolio={profileData.portfolio}
                        availability={profileData.availability}
                      />
                    )}
                  </div>
                }
                portfolio={
                  profileData ? (
                    <PortfolioSection
                      items={[
                        profileData.portfolio?.diplomas_url,
                        profileData.portfolio?.courses_url,
                      ].filter(Boolean) as string[]}
                    />
                  ) : (
                    <div />
                  )
                }
                servicios={
                  profileData ? (
                    <ServicesList
                      interests={profileData.interests}
                      baseHref={`/profesionales/${profileData.profile.id}/servicios`}
                    />
                  ) : (
                    <div />
                  )
                }
                resenas={<ReviewsSection />}
              />

              {/* Galería de imágenes del trabajo (si existiera) */}
              {images.length > 0 && (
                <div className="rounded-2xl border border-black/10 bg-white p-6">
                  <h3 className="mb-3 text-lg font-semibold text-foreground">Imágenes</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={images[0]} alt="Imagen principal" className="col-span-3 h-64 w-full rounded-xl object-cover sm:col-span-2" />
                    {images.slice(1, 4).map((src, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={i} src={src} alt="Imagen" className="h-32 w-full rounded-xl object-cover" />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Aside de condiciones del trabajo si aplicara */}
            <aside className="h-fit rounded-2xl border border-black/10 bg-white p-6">
              <h3 className="mb-3 text-lg font-semibold text-foreground">Información de contacto</h3>
              <ul className="grid gap-2 text-sm text-black/80">
                {price && (
                  <li>
                    <span className="font-medium">Precio:</span> {price}
                  </li>
                )}
                {modality && (
                  <li>
                    <span className="font-medium">Modalidad:</span> {modality}
                  </li>
                )}
                {nameLocation && (
                  <li>
                    <span className="font-medium">Ubicación:</span> {nameLocation}
                  </li>
                )}
                <li>
                  <span className="font-medium">Tiempo de respuesta:</span> 24 horas
                </li>
                <li>
                  <span className="font-medium">Envío nacional:</span> Disponible
                </li>
              </ul>
              <div className="mt-4 flex gap-2">
                {waHref ? (
                  <a href={waHref} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                    Contactar
                  </a>
                ) : (
                  <button className="btn btn-primary">Contactar</button>
                )}
                <SaveJobButton jobId={job.id} />
              </div>
            </aside>

            {/* Condiciones comerciales moved below as full-width */}
          </div>

          {/* Condiciones comerciales - full width rectangle below */}
          <div className="mt-6 rounded-2xl border border-black/10 bg-white p-6">
            <h3 className="mb-3 text-lg font-semibold text-foreground">Condiciones comerciales</h3>
            <ul className="grid gap-2 text-sm text-black/80">
              <li>
                <span className="font-medium">Pedido mínimo:</span> $50.000 o 50 unidades surtidas
              </li>
              <li>
                <span className="font-medium">Formas de pago:</span> transferencia, efectivo, tarjetas (hasta 3 cuotas sin interés)
              </li>
              <li>
                <span className="font-medium">Tiempo de entrega:</span> 3–5 días hábiles (AMBA), 5–10 (interior)
              </li>
            </ul>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-80px)] bg-white">
      <section className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-4 text-sm">
          <Link href="/buscar-freelancer" className="text-black/60 hover:text-black">← Volver</Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h1 className="text-2xl font-semibold text-black/90">{job.title || "Sin título"}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-black/60">
              {cat && <span className="badge">{cat}</span>}
              {sub && <span className="badge">{sub}</span>}
              {modality && <span className="badge">{modality}</span>}
              {location && <span className="badge">{location}</span>}
              {created && <span className="badge">Publicado {created}</span>}
            </div>

            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={images[0]} alt="Imagen principal" className="col-span-3 h-64 w-full rounded-xl object-cover sm:col-span-2" />
                {images.slice(1, 4).map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={src} alt="Imagen" className="h-32 w-full rounded-xl object-cover" />
                ))}
              </div>
            )}

            {job.description && (
              <div className="prose prose-sm mt-6 max-w-none text-black/80">
                <p>{job.description}</p>
              </div>
            )}
          </div>

          <aside className="h-fit rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
            <div className="grid gap-3">
              {price && (
                <div>
                  <div className="text-xs text-black/60">Presupuesto</div>
                  <div className="text-xl font-semibold">{price}</div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg border border-black/10 bg-white p-3">
                  <div className="text-xs text-black/60">Modalidad</div>
                  <div className="font-medium text-black/80">{modality || "-"}</div>
                </div>
                <div className="rounded-lg border border-black/10 bg-white p-3">
                  <div className="text-xs text-black/60">Ubicación</div>
                  <div className="font-medium text-black/80">{location || "-"}</div>
                </div>
              </div>
              <button className="btn btn-primary">Postular</button>
              <button className="btn btn-outline">Guardar</button>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
