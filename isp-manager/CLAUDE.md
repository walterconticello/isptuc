# isp-manager

Sistema de gestión integral para empresa ISP.

## Stack

Next.js 16 + TypeScript strict + Prisma 7 + PostgreSQL + NextAuth.js v5 + shadcn/ui + Tailwind v4 + Zod + Vitest

## Comandos clave

```bash
npm run dev          # localhost:3000
npm run typecheck    # tsc --noEmit
npm test             # Vitest
npm run db:migrate   # Prisma migrate dev
npm run db:seed      # Seed inicial
docker-compose up -d # PostgreSQL en puerto 5434
```

## Convenciones

- **Server Actions** para mutaciones; API routes solo para NextAuth
- **Patrón de respuesta:** `{ success: true, data } | { success: false, error: string }`
- **Zod** en toda frontera (server action, API route, formulario)
- **checkPermission(empleadoId, modulo)** al inicio de cada server action
- Sin `any`, sin `@ts-ignore`
- Errores en español

## Estructura

```
src/
  app/(auth)/login/         # Login
  app/(dashboard)/          # Rutas protegidas
  lib/                      # db, auth, permissions, validations, utils
  modules/<nombre>/actions.ts  # Server actions por módulo
  components/ui/            # shadcn/ui
  components/layout/        # Sidebar, Header
```

## Base de datos

PostgreSQL local en puerto **5434** (docker-compose).
Prisma schema en `prisma/schema.prisma`.

## Roles

`DUENO > GERENTE > ADMIN > ADMINISTRATIVO > TECNICO`

Permisos configurables por módulo desde `/admin/permisos`.
