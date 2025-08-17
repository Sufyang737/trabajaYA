"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default function HomeHeader() {
  const pathname = usePathname();
  const link = (href: string, label: string) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={
          "whitespace-nowrap transition-colors hover:text-black " +
          (active ? "text-brand border-b-2 border-brand pb-0.5" : "text-black/60")
        }
      >
        {label}
      </Link>
    );
  };

  return (
    <div className="sticky top-0 z-40 w-full border-b border-black/10 bg-white">
      <div className="container mx-auto h-16 px-4 sm:px-6 lg:px-8">
        <div className="grid h-full grid-cols-[auto_1fr_auto] items-center">
          {/* Left: Logo */}
          <div className="justify-self-start">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="TrabajarYa Logo"
                width={160}
                height={48}
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2logoISOLOGO--Z9jQzI6l6O5mUPA7fjec6sgkFTStB1.png"
              />
            </Link>
          </div>

          {/* Center: Nav (responsive) */}
          <div className="hidden justify-self-center md:block">
            <nav className="flex items-center justify-center gap-4 px-2 text-sm font-medium md:gap-6 overflow-x-auto">
              {link("/", "Inicio")}
              {link("/oficios", "Oficios")}
              {link("/creadores", "Creadores")}
              {link("/proveedores", "Proveedores")}
              {link("/asistente", "Asistente Laboral")}
              {link("/planes", "Planes")}
            </nav>
          </div>

          {/* Right: Auth actions */}
          <div className="justify-self-end">
            <div className="flex items-center gap-2">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="btn btn-outline h-9 sm:h-10">Iniciar Sesión</button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="btn btn-outline h-9 sm:h-10">Registrarse</button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
