# isp-manager

## Qué es el proyecto

Plataforma web interna de gestión integral para una empresa ISP (proveedor de
internet). Unifica empleados, flota vehicular, combustible, cuadrillas,
presupuestos, clientes, items/servicios y stock/inventario, con login
centralizado y control de acceso por **rol + módulo** (RBAC). Uso interno para
un equipo de 2–10 personas. Detalle funcional completo en `SPEC.md`.

## Stack

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Framework | Next.js (App Router) | 16.2.6 |
| Lenguaje | TypeScript (strict) | ^5 |
| UI runtime | React / React DOM | 19.2.4 |
| ORM | Prisma + adapter `@prisma/adapter-pg` | ^7.8.0 |
| Base de datos | PostgreSQL | 16 (Docker en dev) |
| Auth | NextAuth.js v5 (Credentials, JWT) | ^5.0.0-beta.25 |
| UI | shadcn/ui + Tailwind CSS v4 + lucide-react | — |
| Validación | Zod | ^3.23.8 |
| PDF | jsPDF | ^2.5.2 |
| Hash passwords | bcryptjs | ^2.4.3 |
| Tests unit | Vitest | ^2.1.8 |
| Tests e2e | Playwright | ^1.60.0 |

> Node: tipos `@types/node` ^20. Gestor de paquetes: npm (hay `package-lock.json`).

## Estructura

```
isp-manager/
  src/
    app/
      (auth)/login/        # Pantalla de login (route group sin layout de dashboard)
      (dashboard)/         # Rutas protegidas: admin, clientes, combustible,
                           #   cuadrillas, dashboard, empleados, flota, items,
                           #   presupuestos, stock
      api/auth/            # Único uso de API routes: handlers de NextAuth
    lib/                   # Infraestructura compartida:
                           #   db.ts (cliente Prisma singleton), auth.ts +
                           #   auth.config.ts (NextAuth), permissions.ts (RBAC),
                           #   validations.ts (schemas Zod), audit.ts (logAudit),
                           #   labels.ts, utils.ts
    modules/<nombre>/      # Lógica de negocio por módulo, sobre todo actions.ts
                           #   (server actions). Algunos tienen helpers puros:
                           #   combustible/{calculos,filtros,rendimiento}.ts,
                           #   presupuestos/{codigo,font-size}.ts
    components/ui/         # Componentes shadcn/ui
    components/layout/     # Sidebar, Header
    generated/prisma/      # Cliente Prisma GENERADO (no editar a mano)
    types/                 # Tipos compartidos / augmentación de next-auth
  prisma/
    schema.prisma          # Modelo de datos (fuente de verdad)
    seed.ts                # Seed: empresa, permisos por rol, admin, IVA 21%
    migrations/            # Migraciones SQL
    migrate-fleet.ts, fix-consumo.ts  # Scripts puntuales de migración de datos
  tests/unit/              # Vitest (lógica pura: cálculos, filtros, validations)
  tests/e2e/               # Playwright (.spec.ts)
  tasks/                   # plan.md, todo.md (planificación de fases)
  docs/                    # Notas de diseño/pendientes
  middleware.ts            # Redirección login/dashboard según cookie de sesión
  docker-compose.yml       # PostgreSQL local
```

## Cómo correrlo

```bash
# 1. Levantar la base de datos (PostgreSQL en puerto 5434 del host)
docker-compose up -d

# 2. Configurar entorno
cp .env.example .env        # ajustar NEXTAUTH_SECRET

# 3. Instalar dependencias
npm install

# 4. Migrar y sembrar la base
npm run db:migrate          # prisma migrate dev (genera también el cliente)
npm run db:seed             # crea admin@isp.local / admin123 (rol DUENO)

# 5. Desarrollo
npm run dev                 # http://localhost:3000

# Calidad
npm run typecheck           # tsc --noEmit
npm run lint                # eslint src
npm test                    # Vitest (tests/unit)
npm run test:e2e            # Playwright (tests/e2e)

# Utilidades DB
npm run db:studio           # Prisma Studio
npm run db:migrate-fleet    # script de migración de flota (tsx)
```

> **Credenciales de desarrollo (seed):** `admin@isp.local` / `admin123`.

## Convenciones

- **Server Actions para todas las mutaciones y lecturas de negocio.** Las API
  routes se usan **solo** para NextAuth (`src/app/api/auth`).
- **Patrón de respuesta uniforme:**
  `{ success: true, data } | { success: false, error: string }`. Se usan
  literales `as const` (`success: false as const`) para tipar el discriminante.
- **Validación con Zod en toda frontera** (server action, formulario). El input
  llega como `unknown` y se valida con `schema.safeParse`; el primer error se
  devuelve como string en español.
- **Autorización en cada server action.** Patrón `guardXxx()` al inicio:
  `auth()` → comprueba sesión → `checkPermission(session.user.id, Modulo.X)`.
  Sin sesión/permiso devuelve `{ success: false, error }` (no lanza).
- **Auditoría:** acciones relevantes llaman `logAudit({...})` (a menudo con
  `void` para no bloquear). Login exitoso/fallido también se auditan.
- **Revalidación:** tras mutar, `revalidatePath("/ruta")` de las vistas afectadas.
- **Import del cliente Prisma:** desde `@/generated/prisma/...`
  (p. ej. `@/generated/prisma/enums`), **no** desde `@prisma/client`. El cliente
  vive en `src/generated/prisma` y se regenera con las migraciones.
- **Alias de imports:** `@/` → `src/`.
- TypeScript strict: sin `any`, sin `@ts-ignore`.
- **Todo el dominio y los mensajes de error en español** (nombres de modelos,
  enums y variables incluidos: `Empleado`, `Cuadrilla`, `RegistroCombustible`…).
- Tests unitarios reservados para lógica pura (cálculos, filtros, validaciones);
  no se testean los server actions con DB en `tests/unit`.

## Integraciones externas

- **No hay integraciones con APIs de terceros actualmente** (no se detectó
  Wispro, WhatsApp, MercadoPago, AFIP ni llamadas HTTP salientes en `src`). El
  sistema es autocontenido contra su propia base PostgreSQL.
- **Autenticación:** NextAuth.js v5 con **Credentials provider** (email +
  password contra la tabla `Empleado`, hash bcrypt). Sesiones **JWT**; el rol y
  nombre se inyectan en el token/sesión vía callbacks (`src/lib/auth.ts`).
- **Credenciales / secretos:** vía `.env` (no commiteado; ver `.env.example`).
  Variables: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`. En dev la DB usa
  `POSTGRES_HOST_AUTH_METHOD: trust` y credenciales fijas `isp/isp123` — solo
  apto para desarrollo local.

## Puntos de atención

- **`src/generated/prisma/` es código generado** — no editar a mano; se
  regenera al migrar. No revisar sus archivos como si fueran fuente.
- **Combustible — unidad de `consumo`:** ver gotcha de migración registrado en
  memoria. El campo `consumo` y el cálculo de rendimiento requieren cuidado con
  las unidades (existe `prisma/fix-consumo.ts` como script correctivo).
- **Middleware de auth es superficial:** `middleware.ts` solo comprueba la
  *existencia* de la cookie de sesión (no verifica el JWT) y solo protege `/` y
  `/dashboard`. La autorización real recae en cada server action vía
  `checkPermission`. Rutas de dashboard adicionales dependen de ese guard, no
  del middleware.
- **Secretos de dev en repo:** `docker-compose.yml` y `seed.ts` traen
  credenciales y password de admin embebidos (`admin123`). Cambiar antes de
  cualquier despliegue real.
- **Scripts de migración puntuales** (`migrate-fleet.ts`, `fix-consumo.ts`) son
  one-off; entender qué hacen antes de reejecutarlos sobre datos existentes.
- **Módulo presupuestos:** el editor WYSIWYG figura como completado, pero el
  archivo `docs/PENDIENTE-presupuestos-wysiwyg.md` conserva el nombre y los
  gotchas de vitest/e2e/docker del módulo — leerlo antes de tocarlo.
- **`tasks/plan.md` describe "Fase 1"** — el plan por fases puede estar
  desactualizado respecto al código actual; verificar contra el repo. *(a confirmar)*
```
