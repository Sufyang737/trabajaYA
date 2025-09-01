"use client";

export type WorkMode = "on_site" | "remote" | "both";
export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
export type DayBlock = { morning?: boolean; afternoon?: boolean; evening?: boolean };
export type AvailabilityMap = Record<DayKey, DayBlock>;

export const STEP_PATHS = [
  "/onboarding/profile",
  "/onboarding/interests",
  "/onboarding/availability",
  "/onboarding/portfolio",
  "/onboarding/confirm",
] as const;

export async function fetchProfile() {
  const res = await fetch("/api/profile", { cache: "no-store" });
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()).record as any;
}

export async function saveOnboardingPart(payload: any) {
  const res = await fetch("/api/onboarding", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export const CATEGORY_OPTIONS = [
  { key: "workers", label: "Trabajadores" },
  { key: "creators", label: "Creadores" },
  { key: "providers", label: "Proveedores" },
] as const;

export const SUBCATEGORY_OPTIONS: Record<(typeof CATEGORY_OPTIONS)[number]["key"], { key: string; label: string }[]> = {
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
