export default function ProfilesSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-brand/10 bg-white p-4 shadow-sm">
          <div className="skeleton mb-3 h-5 w-1/2"></div>
          <div className="skeleton mb-2 h-3 w-1/3"></div>
          <div className="skeleton h-4 w-full"></div>
        </div>
      ))}
    </div>
  );
}

