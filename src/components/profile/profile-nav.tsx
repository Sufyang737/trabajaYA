"use client";

import Link from "next/link";

const items = [
  { href: "/historial-trabajo", label: "Historial de trabajo" },
  { href: "/cargar-trabajo", label: "Crear trabajo" },
  { href: "/resenas", label: "Reseñas" },
  { href: "/guardados", label: "Guardados" },
];

export default function ProfileNav() {
  return (
    <nav className="md:w-56">
      <ul className="flex gap-2 md:flex-col">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="block rounded-md px-3 py-2 text-sm font-medium text-brand hover:bg-brand/10"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
