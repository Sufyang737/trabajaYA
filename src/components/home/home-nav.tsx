"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function BriefcaseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      <path d="M2 13h20" />
    </svg>
  );
}

export default function HomeNav() {
  const pathname = usePathname();
  const isBuscar = pathname === "/buscar" || pathname === "/"; // home resalta Buscar
  const isFreelance = pathname === "/buscar-freelancer";

  return (
    <nav className="mx-auto mb-8 w-full max-w-4xl">
      <div className="mx-auto flex w-full items-center justify-center">
        <div className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-white p-1 shadow-sm">
          <Link
            href="/buscar"
            className={
              "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition " +
              (isBuscar ? "bg-brand text-brand-foreground" : "text-black/70 hover:bg-[#f6f6f6]")
            }
          >
            <SearchIcon />
            Buscar
          </Link>
          <Link
            href="/buscar-freelancer"
            className={
              "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition " +
              (isFreelance ? "bg-brand text-brand-foreground" : "text-black/70 hover:bg-[#f6f6f6]")
            }
          >
            <BriefcaseIcon />
            Buscar trabajos freelancer
          </Link>
        </div>
      </div>
    </nav>
  );
}
