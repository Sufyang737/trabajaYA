
export default function BuscarPage() {
  return (
    <main className="min-h-[calc(100vh-80px)] bg-white">
      <section className="mx-auto max-w-4xl px-6 py-8">
        <h1 className="text-2xl font-semibold text-black/90">Buscar</h1>
        <p className="mt-1 text-sm text-black/60">Encontrá personas y servicios cerca tuyo.</p>
        {/* TODO: search UI */}
        <div className="mt-6 rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
          <p className="text-sm text-black/60">Acá va el buscador y resultados.</p>
        </div>
      </section>
    </main>
  );
}
