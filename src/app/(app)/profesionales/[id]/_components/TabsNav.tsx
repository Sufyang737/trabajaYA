"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = { baseHref: string };

export default function TabsNav({ baseHref }: Props) {
  const pathname = usePathname();

  const tabs = [
    { href: baseHref, label: "Resumen", key: "resumen" },
    { href: `${baseHref}/servicios`, label: "Servicios", key: "servicios" },
    { href: `${baseHref}/portfolio`, label: "Portfolio", key: "portfolio" },
    { href: `${baseHref}/resenas`, label: "Reseñas", key: "resenas" },
  ];

  function isActive(href: string, key: string) {
    if (key === "resumen") return pathname === baseHref;
    return pathname.startsWith(href);
  }

  return (
    <nav className="mt-8 flex gap-6 border-b border-brand/10 text-sm">
      {tabs.map((t) => (
        <Link
          key={t.key}
          href={t.href}
          className={
            (isActive(t.href, t.key)
              ? "border-b-2 border-brand font-medium text-brand"
              : "text-muted-foreground") + " pb-2"
          }
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
