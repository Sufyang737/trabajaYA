import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { SignedIn } from "@clerk/nextjs";
import ClientRedirect from "@/components/auth/client-redirect";
export const dynamic = "force-dynamic";

export default async function Home() {
  const { userId } = auth();
  if (userId) {
    redirect("/buscar");
  }
  return (
    <main className="min-h-[calc(100vh-80px)] bg-white">
      {/* Client-side fallback redirect in case server auth isn't available */}
      <SignedIn>
        <ClientRedirect to="/buscar" />
      </SignedIn>

      <section className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-8 px-6 py-24 text-center">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Tu portal para encontrar oportunidades
        </h1>
        <p className="text-balance text-base text-black/70 sm:text-lg">
          Crea una cuenta o inicia sesión para comenzar. Gestiona tu perfil, postula a trabajos y sigue tus procesos.
        </p>

        <div className="mt-4 flex w-full flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/sign-in"
            className="btn btn-outline active:translate-y-[1px]"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/sign-up"
            className="btn btn-primary active:translate-y-[1px]"
          >
            Crear cuenta
          </Link>
        </div>

        <p className="mt-6 text-xs text-black/60">
          Al continuar aceptas nuestros Términos y Política de Privacidad.
        </p>
      </section>
    </main>
  );
}
