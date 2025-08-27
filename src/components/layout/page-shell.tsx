import React from "react";

export default function PageShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main className="bg-muted min-h-[calc(100vh-80px)] py-8">
      <section className="mx-auto max-w-6xl px-6">
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-black">{title}</h1>
          <p className="mt-1 text-sm text-black/80">{description}</p>
          <div className="mt-6 space-y-6">{children}</div>
        </div>
      </section>
    </main>
  );
}
