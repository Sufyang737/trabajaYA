export default function ReviewsSection({ count = 0 }: { count?: number }) {
  return (
    <div className="mt-6 rounded-2xl border border-brand/10 bg-white p-6">
      <h4 className="mb-2 text-lg font-semibold text-foreground">Reseñas</h4>
      {count > 0 ? (
        <div className="text-sm text-black/80">{count} reseñas</div>
      ) : (
        <p className="text-sm text-muted-foreground">Aún no hay reseñas para este perfil.</p>
      )}
    </div>
  );
}

