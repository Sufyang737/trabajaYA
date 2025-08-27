export const dynamic = "force-dynamic";

export default function ProductosPage() {
  return (
    <div className="mt-6 rounded-2xl border border-brand/10 bg-white p-6">
      <h2 className="mb-2 text-lg font-semibold text-foreground">Productos</h2>
      <p className="text-sm text-muted-foreground">Este proveedor aún no cargó productos.</p>
    </div>
  );
}

