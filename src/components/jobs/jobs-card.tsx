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

import Link from "next/link";

export default function JobsCard({ job, imageBaseUrl }: { job: JobRecord; imageBaseUrl?: string }) {
  const location = [job.neighborhood, job.city].filter(Boolean).join(", ");
  const cat = CATEGORY_LABEL[job.category || ""] || job.category;
  const sub = SUBCATEGORY_LABEL[job.subcategory || ""] || job.subcategory;
  const price = formatPrice(job.price, job.currency, job.price_unit);
  const modality = MODALITY_LABEL[job.modality || ""] || job.modality;
  const created = job.created ? new Date(job.created).toLocaleDateString("es-AR") : null;

  const image = imageBaseUrl && job.images && job.images.length
    ? `${imageBaseUrl}/jobs/${job.id}/${job.images[0]}`
    : null;

  return (
    <Link href={`/trabajos/${job.id}`} className="block">
      <article className="group overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm transition hover:shadow-md">
        {image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="Imagen del trabajo" className="h-40 w-full object-cover"/>
        )}
        <div className="grid gap-2 p-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-base font-semibold text-black/90 line-clamp-1">{job.title || "Sin título"}</h3>
            {price && <span className="rounded-full bg-brand px-2 py-0.5 text-xs text-brand-foreground">{price}</span>}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-black/60">
            {cat && <span className="badge bg-white">{cat}</span>}
            {sub && <span className="badge bg-white">{sub}</span>}
            {modality && <span className="badge bg-white">{modality}</span>}
            {location && <span className="badge bg-white">{location}</span>}
          </div>
          {job.description && (
            <p className="text-sm text-black/70 line-clamp-2">{job.description}</p>
          )}
          <div className="mt-1 flex items-center justify-between text-xs text-black/50">
            <span>{created ? `Publicado ${created}` : ""}</span>
            <span className="uppercase">{job.currency || ""}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
