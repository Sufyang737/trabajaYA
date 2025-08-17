export type CategoryKey = "workers" | "creators" | "providers";

export const CATEGORY_LABEL: Record<CategoryKey, string> = {
  workers: "Trabajadores",
  creators: "Creadores",
  providers: "Proveedores",
};

export const SUBCATEGORY_OPTIONS: Record<CategoryKey, { key: string; label: string }[]> = {
  workers: [
    { key: "electrician", label: "Electricista" },
    { key: "plumber", label: "Plomero" },
    { key: "carpenter", label: "Carpintero" },
    { key: "painter", label: "Pintor" },
    { key: "gas_fitter", label: "Gasista" },
    { key: "gardener", label: "Jardinero" },
    { key: "mechanic", label: "Mecánico" },
    { key: "hairdresser", label: "Peluquero" },
    { key: "construction", label: "Construcción" },
  ],
  creators: [
    { key: "youtuber", label: "YouTuber" },
    { key: "influencer", label: "Influencer" },
    { key: "photographer", label: "Fotógrafo" },
    { key: "podcaster", label: "Podcaster" },
    { key: "designer", label: "Diseñador" },
    { key: "musician", label: "Músico" },
    { key: "gamer", label: "Gamer" },
  ],
  providers: [
    { key: "clothing_textile", label: "Indumentaria y textil" },
    { key: "automotive", label: "Automotriz" },
    { key: "appliances", label: "Electrodomésticos" },
    { key: "technology", label: "Tecnología" },
    { key: "fashion_accessories", label: "Accesorios de moda" },
    { key: "toys", label: "Juguetes" },
    { key: "food", label: "Alimentos" },
    { key: "electronics", label: "Electrónica" },
  ],
};

