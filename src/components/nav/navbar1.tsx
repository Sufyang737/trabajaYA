"use client";

import Link from "next/link";
import { useState } from "react";
import { Book, Menu, Sunset, Trees, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

interface MenuItem {
  title: string;
  url: string;
  description?: string;
  icon?: React.ReactNode;
  items?: MenuItem[];
}

interface Navbar1Props {
  logo?: {
    url: string;
    src: string;
    alt: string;
    title: string;
  };
  menu?: MenuItem[];
}

const defaultLogo = {
  url: "/",
  src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2logoISOLOGO--Z9jQzI6l6O5mUPA7fjec6sgkFTStB1.png",
  alt: "TrabajarYa",
  title: "TrabajarYa",
};

const defaultMenu: MenuItem[] = [
  { title: "Inicio", url: "/" },
  {
    title: "Oficios",
    url: "/oficios",
    items: [
      { title: "Electricistas", description: "Profesionales verificados", icon: <Zap className="size-5" />, url: "/oficios" },
      { title: "Plomeros", description: "Urgencias y mantenimiento", icon: <Sunset className="size-5" />, url: "/oficios" },
      { title: "Carpinteros", description: "A medida y reparación", icon: <Trees className="size-5" />, url: "/oficios" },
    ],
  },
  {
    title: "Creadores",
    url: "/creadores",
    items: [
      { title: "Diseño", description: "Branding y UI/UX", icon: <Book className="size-5" />, url: "/creadores" },
      { title: "Contenido", description: "Foto, video y social", icon: <Zap className="size-5" />, url: "/creadores" },
    ],
  },
  { title: "Proveedores", url: "/proveedores" },
  { title: "Asistente Laboral", url: "/asistente" },
  { title: "Planes", url: "/planes" },
];

export function Navbar1({ logo = defaultLogo, menu = defaultMenu }: Navbar1Props) {
  const [open, setOpen] = useState(false);
  return (
    <header className="w-full border-b border-black/10 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid h-16 lg:h-20 grid-cols-[auto_1fr_auto] items-center">
          {/* Left: Logo */}
          <div className="justify-self-start">
            <Link href={logo.url} className="flex items-center gap-2" aria-label={logo.title}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logo.src}
                width={240}
                height={72}
                className="h-16 w-auto"
                alt={logo.alt}
              />
            </Link>
          </div>

          {/* Center: Nav */}
          <nav className="hidden justify-self-center lg:block">
            <ul className="flex items-center gap-5 text-sm font-medium">
              {menu.map((item) => (
                <li key={item.title} className="relative group">
                  <Link href={item.url} className="rounded-md px-3 py-2 text-black/70 transition-colors hover:text-black">
                    {item.title}
                  </Link>
                  {item.items && (
                    <div className="pointer-events-none absolute left-0 top-full z-30 hidden w-80 translate-y-1 rounded-lg border border-black/10 bg-white p-2 shadow-md group-hover:block group-hover:pointer-events-auto">
                      {item.items.map((sub) => (
                        <Link key={sub.title} href={sub.url} className="flex items-start gap-3 rounded-md p-2 hover:bg-[#f6f6f6]">
                          <div className="text-black/80">{sub.icon}</div>
                          <div>
                            <div className="text-sm font-semibold text-black/90">{sub.title}</div>
                            {sub.description && <p className="text-xs text-black/60">{sub.description}</p>}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Right: Auth + Mobile menu */}
          <div className="justify-self-end flex items-center gap-2">
            <Link href="/cargar-trabajo">
              <Button size="sm">Cargar trabajo</Button>
            </Link>
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="outline" size="sm">Iniciar Sesión</Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button size="sm">Registrarse</Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <Button variant="outline" size="icon" className="lg:hidden" onClick={() => setOpen(true)} aria-label="Abrir menú">
              <Menu className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile sheet */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setOpen(false)}>
          <div className="absolute right-0 top-0 h-full w-80 bg-white p-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <Link href={logo.url} className="flex items-center gap-2" onClick={() => setOpen(false)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logo.src} className="h-12 w-auto" alt={logo.alt} />
              </Link>
              <Button variant="outline" size="icon" onClick={() => setOpen(false)} aria-label="Cerrar">×</Button>
            </div>
            <div className="flex flex-col gap-4">
              {menu.map((item) => (
                <div key={item.title}>
                  <Link href={item.url} className="text-md font-semibold" onClick={() => setOpen(false)}>
                    {item.title}
                  </Link>
                  {item.items && (
                    <div className="mt-2 ml-2 flex flex-col gap-2">
                      {item.items.map((sub) => (
                        <Link key={sub.title} href={sub.url} className="text-sm text-black/70" onClick={() => setOpen(false)}>
                          {sub.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <Link href="/cargar-trabajo" onClick={() => setOpen(false)}>
                <Button className="w-full">Cargar trabajo</Button>
              </Link>
              <div className="mt-4 flex flex-col gap-2">
                <SignedOut>
                  <SignInButton mode="modal">
                    <Button variant="outline" onClick={() => setOpen(false)}>Iniciar Sesión</Button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <Button onClick={() => setOpen(false)}>Registrarse</Button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <UserButton afterSignOutUrl="/" />
                </SignedIn>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
