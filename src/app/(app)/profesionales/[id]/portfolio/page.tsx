import { notFound } from "next/navigation";
import { getProfileData } from "../_data";

export const dynamic = "force-dynamic";

export default async function PortfolioPage({ params }: { params: { id: string } }) {
  const data = await getProfileData(params.id);
  if (!data) return notFound();
  const { portfolio } = data;
  const items = [portfolio?.diplomas_url, portfolio?.courses_url].filter(Boolean) as string[];

  return (
    <div className="mt-6 rounded-2xl border border-brand/10 bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold text-foreground">Portfolio</h2>
      {items.length ? (
        <ul className="grid gap-2 text-sm text-black/80">
          {items.map((c, i) => (
            <li key={i}>{c}</li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">Este profesional aún no cargó su portfolio.</p>
      )}
    </div>
  );
}

