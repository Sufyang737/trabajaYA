type JobRecord = {
  id: string;
  title?: string;
  description?: string;
  category?: string;
  subcategory?: string;
  price?: number;
  currency?: "ARS" | "USD" | string;
  price_unit?: "hour" | "project" | "monthly" | string;
  modality?: "full_time" | "part_time" | "freelance" | "per_hour" | "temporary" | "permanent_job" | string;
  status?: string;
  city?: string;
  neighborhood?: string;
  images?: string[];
  created?: string;
  photo_job?: string;
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

import Link from "next/link";
import SaveJobButton from "@/components/saves/save-job-button";

export default function JobsCard({ job, imageBaseUrl, freelanceProfile }: { job: JobRecord; imageBaseUrl?: string; freelanceProfile?: { id: string; name: string; avatar?: string; location?: string } }) {
  const location = [job.neighborhood, job.city].filter(Boolean).join(", ");
  const cat = CATEGORY_LABEL[job.category || ""] || job.category;
  const sub = SUBCATEGORY_LABEL[job.subcategory || ""] || job.subcategory;
  const price = formatPrice(job.price, job.currency, job.price_unit);
  const modality = MODALITY_LABEL[job.modality || ""] || job.modality;
  const created = job.created ? new Date(job.created).toLocaleDateString("es-AR") : null;

  const image = job.photo_job
    ? job.photo_job
    : imageBaseUrl && job.images && job.images.length
    ? `${imageBaseUrl}/jobs/${job.id}/${job.images[0]}`
    : null;

  return (
    <Link href={`/trabajos/${job.id}`} className="block">
      <article className="group relative overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
        <div className="relative h-44 w-full overflow-hidden">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt="Imagen del trabajo" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
          ) : (
            <div className="h-full w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand/15 to-white" />
          )}
          <div className="absolute right-2 top-2 flex items-center gap-2">
            {price && (
              <span className="rounded-full bg-brand px-2 py-0.5 text-xs font-medium text-brand-foreground shadow">
                {price}
              </span>
            )}
            <SaveJobButton jobId={job.id} variant="icon" />
          </div>
        </div>
        <div className="grid gap-2 p-4">
          <h3 className="text-base font-semibold text-foreground line-clamp-1">{job.title || "Sin título"}</h3>
          {job.description && <p className="text-sm text-black/70 line-clamp-2">{job.description}</p>}
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-black/70">
            {cat && <span className="rounded-full bg-black/5 px-2 py-0.5">{cat}</span>}
            {sub && <span className="rounded-full bg-black/5 px-2 py-0.5">{sub}</span>}
            {modality && <span className="rounded-full bg-black/5 px-2 py-0.5">{modality}</span>}
            {location && <span className="rounded-full bg-black/5 px-2 py-0.5">{location}</span>}
          </div>
          <div className="mt-1 text-xs text-black/50">{created ? `Publicado ${created}` : ''}</div>

          {freelanceProfile && (
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-black/10 bg-white p-2">
              {freelanceProfile.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={freelanceProfile.avatar} alt={freelanceProfile.name} className="h-8 w-8 rounded-full object-cover" />
              ) : (
                <div className="h-8 w-8 rounded-full bg-black/10" />
              )}
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-foreground">{freelanceProfile.name}</div>
                {freelanceProfile.location && (
                  <div className="truncate text-[11px] text-black/60">{freelanceProfile.location}</div>
                )}
              </div>
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
