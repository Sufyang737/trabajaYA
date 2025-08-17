## TrabajaYA — Plataforma de perfiles, trabajos y onboarding con Clerk + PocketBase

Aplicación Next.js (App Router) con autenticación Clerk, onboarding multi‑paso, integración con PocketBase (webhooks y APIs), listado de trabajos y perfiles filtrables, y un navbar responsivo.

### Características
- Autenticación con Clerk (UI, provider, middleware) y rutas de Sign in/Sign up.
- Webhook verificado (Svix) para crear perfiles en PocketBase al `user.created`.
- Onboarding multi‑página con transiciones (Framer Motion), guardado por paso en PB:
  - Perfil (campos faltantes detectados automáticamente)
  - Intereses (categoría/subcategoría + rol)
  - Disponibilidad (bloques por día → weekly_availabilities)
  - Portfolio (cv/cursos/diplomas + links JSON)
  - Preferencias (roles)
  - Confirmación (finaliza: `is_onboarding_complete`)
- Navbar global sticky, responsivo, con menú desktop + sheet móvil.
- Catálogo de trabajos (jobs) y vista de detalle `/trabajos/[id]`.
- Listado de perfiles por categoría (Oficios/Creadores/Proveedores) con filtros (búsqueda, subcategoría, ciudad, barrio).
- Tema claro, tokens de marca (rojo), animaciones sutiles y skeletons de carga.

### Stack
- Next.js 15 (App Router, server components)
- React 19
- Clerk (`@clerk/nextjs`)
- PocketBase JS SDK
- Svix (verificación webhook Clerk)
- Framer Motion (animaciones entre páginas de onboarding)
- Tailwind CSS v4 (a través de `@tailwindcss/postcss`), utilidades en `globals.css`
- Lucide React (iconos del navbar)

---

## Estructura de proyecto (parcial)

```
src/
  app/
    (app)/
      buscar/             # placeholder (buscador general)
      buscar-freelancer/  # lista de trabajos (JobsList)
      oficios/            # perfiles category=workers (+ filtros)
      creadores/          # perfiles category=creators (+ filtros)
      proveedores/        # perfiles category=providers (+ filtros)
      trabajos/[id]/      # detalle de trabajo
    (onboarding)/
      onboarding/
        layout.tsx        # transiciones framer-motion
        page.tsx          # redirección a /onboarding/profile
        profile/          # paso: perfil
        interests/        # paso: intereses
        availability/     # paso: disponibilidad
        portfolio/        # paso: portfolio
        preferences/      # paso: preferencias
        confirm/          # paso: confirmación
    api/
      webhooks/clerk/     # POST webhook verificado
      onboarding/         # POST guardado por paso/finalizar
      profile/            # GET perfil por clerk_id
    layout.tsx            # ClerkProvider + HeaderGate
    page.tsx              # home (hero)

  components/
    auth-header.tsx       # (legacy) – no se usa en runtime
    header-gate.tsx       # muestra navbar salvo en onboarding
    home/
      home-header.tsx     # wrapper: Navbar1
      home-nav.tsx        # (legacy) – nav segmentado, retirado de uso
    jobs/
      jobs-card.tsx
      jobs-list.tsx
    nav/
      navbar1.tsx         # Navbar principal (logo + menú + sheet mobile)
    onboarding/
      api.ts              # helpers onboarding
      progress.tsx        # barra de progreso
      step-indicator.tsx
      transition-layout.tsx
      steps/              # UI por paso (client components)
    profiles/
      profile-card.tsx
      profiles-list.tsx   # server component (consulta PB + filtros)
      profiles-filters.tsx
      profiles-skeleton.tsx
    ui/
      button.tsx

  lib/
    cn.ts                 # join de clases
    categories.ts         # catálogo categorías/subcategorías (ES)

  services/
    pb.ts                 # cliente PocketBase + helper files URL

middleware.ts             # clerkMiddleware: proteger rutas
```

---

## Configuración

1) Dependencias

```bash
npm i
```

2) Variables de entorno (`.env.local`)

```
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
CLERK_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# PocketBase
POCKETBASE_URL=
POCKETBASE_ADMIN_TOKEN=YOUR_ADMIN_API_TOKEN
```

3) Clerk — Dashboard
- Crear aplicación y copiar Publishable/Secret.
- Webhooks → Add endpoint:
  - URL: `https://<tu-dominio>/api/webhooks/clerk` (en local: `http://localhost:3000/api/webhooks/clerk`)
  - Eventos: `user.created`
  - Copiar Signing secret → `CLERK_WEBHOOK_SECRET`.



5) Ejecutar en desarrollo

```bash
npm run dev
```

Abrir http://localhost:3000

---

## Autenticación y Middleware
- `src/app/layout.tsx` envuelve todo con `ClerkProvider`.
- `src/middleware.ts` usa `clerkMiddleware` y protege todo salvo rutas públicas:
  - Públicas: `/`, `/sign-in(.*)`, `/sign-up(.*)`, `/api/webhooks/(.*)`
  - Onboarding se protege por `auth()` en cada página del grupo.

Rutas UI de auth:
- `/sign-in` y `/sign-up` (componentes de Clerk ya integrados)

---

## Webhook Clerk → PocketBase
- Endpoint: `POST /api/webhooks/clerk`
- Verificación Svix mediante headers `svix-id`, `svix-timestamp`, `svix-signature` y `CLERK_WEBHOOK_SECRET`.
- Evento soportado: `user.created` → crea registro en `profiles` con:
  - `first_name`, `last_name`, `email`, `clerk_id`, `phone_number`
  - defaults: `roles=["provider"]`, `status="draft"`, `is_onboarding_complete=false`, etc.
- Idempotencia: si existe `profiles.clerk_id`, no duplica.

---

## Onboarding (multi‑paso, /onboarding/*)
Pasos:
1. `profile` (detecta campos faltantes del perfil en PB y sólo pide esos)
2. `interests` (categoría/subcategoría, rol: busco/ofrezco)
3. `availability` (bloques Mañana/Tarde/Noche → 1 registro por día en `weekly_availabilities`, respetando índice único)
4. `portfolio` (cv/cursos/diplomas + links JSON)
5. `preferences` (roles: provider/worker/creator)
6. `confirm` (finaliza onboarding)

Guardado por paso:
- `POST /api/onboarding` acepta fragmentos: `{ profile }`, `{ interests }`, `{ weeklyAvailability }`, `{ portfolio }`.
- `finalize: true` marca `profiles.is_onboarding_complete = true` y `status = active`.

Infra del flujo:
- Layout animado: `src/app/(onboarding)/onboarding/layout.tsx` (Framer Motion)
- UI de cada paso en `src/components/onboarding/steps/*`
- Helpers: `src/components/onboarding/api.ts`

---

## Trabajos (Jobs)
- Listado: `/buscar-freelancer` (server component `JobsList`) → `jobs` con `status="active"`, orden `-created`.
- Card: `JobsCard` muestra título, precio (ARS/USD con unidad `/hora|/proyecto|/mes`), modalidad, ubicación y fecha.
- Detalle: `/trabajos/[id]` con galería simple y CTAs (Postular/Guardar placeholders).

---

## Perfiles por categoría + Filtros
Rutas:
- `/oficios` → category `workers`
- `/creadores` → category `creators`
- `/proveedores` → category `providers`

Listado (`ProfilesList`):
- Consulta `interests` filtrando por `category` y opcional `subcategory`, `expand=profile_id` y deduplica perfiles.
- Filtros client‑side (q: nombre/bio, city, hood) sobre el perfil expandido.

UI de filtros (`ProfilesFilters`):
- Búsqueda, subcategoría (según categoría activa), ciudad, barrio.
- Actualiza la URL (`?q=&subcat=&city=&hood=`) y refresca el listado (SSR + Suspense con skeleton).

---

## Navbar
- Componente principal: `src/components/nav/navbar1.tsx` (inspirado en shadcnblocks Navbar1).
- Desktop: mega‑items con hover, centrado, logo a la izquierda, acciones a la derecha.
- Mobile: sheet lateral con el mismo contenido.
- Integración global: `HeaderGate` lo muestra en todo el sitio salvo en onboarding.

---

## Estilo / Tema
- Tema claro forzado. Tokens en `globals.css`:
  - `--brand: #ef4444` (rojo), `--brand-foreground: #fff`
  - `--muted`, `--muted-foreground`, `--radius-md`
- Utilidades:
  - `.btn`, `.btn-primary`, `.btn-outline` (legacy) y `components/ui/button` (preferir este)
  - Animaciones: `.animate-fade-in`, `.animate-slide-up`, `skeleton`

---

## Scripts
```bash
npm run dev      # desarrollo
npm run build    # build de producción
npm start        # servir build
npm run lint     # lint
```

---

## Notas y buenas prácticas
- Variables sensibles sólo vía `.env.local` (no commitear claves reales).
- Los servicios externos (Clerk/PB) deben estar configurados para que `npm run dev` funcione sin errores.
- Para producción, revisar políticas de CORS y dominios permitidos en Clerk y PocketBase.
- Rutas públicas vs protegidas: ajustar `src/middleware.ts` según necesidad (por ejemplo, hacer públicas `/buscar` y `/buscar-freelancer` en demo).

---

## Roadmap (sugerido)
- Paginación/infinite scroll en listados.
- Avatares/fotos de perfil (mapeo desde Clerk o almacenamiento propio en PB).
- Guardados (colección `saves`) y “postular” en Jobs.
- Filtros avanzados (multi‑select, chips removibles, orden por relevancia).
- Tests de integración básicos para API routes.

---

## Licencia
Proyecto interno de TrabajaYA (uso privado). Ajustar licencia si se publica.
