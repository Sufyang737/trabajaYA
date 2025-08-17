import Link from "next/link";
import PocketBase from "pocketbase";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type JobRecord = {
  id: string;
  title?: string;
  description?: string;
  category?: string;
  subcategory?: string;
  price?: number;
  currency?: "ARS" | "USD" | string;
  price_unit?: "hour" | "project" | "monthly" | string;
  modality?: "full_time" | "part_time" | "freelance" | "per_hour" | "temporary" | string;
  status?: string;
  city?: string;
  neighborhood?: string;
  images?: string[];
  created?: string;
};

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

export default async function JobDetailPage({ params }: { params: { id: string } }) {
  const data = await getJob(params.id);
  if (!data?.job) return notFound();

  const { job, fileBase } = data;
  const cat = CATEGORY_LABEL[job.category || ""] || job.category;
  const sub = SUBCATEGORY_LABEL[job.subcategory || ""] || job.subcategory;
  const price = formatPrice(job.price, job.currency, job.price_unit);
  const modality = MODALITY_LABEL[job.modality || ""] || job.modality;
  const created = job.created ? new Date(job.created).toLocaleDateString("es-AR") : null;
  const location = [job.neighborhood, job.city].filter(Boolean).join(", ");
  const images = (job.images || []).map((img) => `${fileBase}/jobs/${job.id}/${img}`);

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

