export default function PortfolioSection({ items }: { items: string[] }) {
  return (
    <div className="mt-6 rounded-2xl border border-brand/10 bg-white p-6">
      <h4 className="mb-4 text-lg font-semibold text-foreground">Portfolio</h4>
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

