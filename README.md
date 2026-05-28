# ISP TUC — Ecosistema de Herramientas Internas

Monorepo con las herramientas internas desarrolladas para la gestión operativa de la empresa ISP.

## Proyectos

| Proyecto | Descripción | Estado |
|----------|-------------|--------|
| [`presupuestos-app`](./presupuestos-app) | Sistema de presupuestos para clientes | En desarrollo |
| [`fleet-manager`](./fleet-manager) | Gestión de flota / equipos | En desarrollo |
| [`budget-manager`](./budget-manager) | Gestión de presupuesto interno | Planificado |
| [`agent-skills`](./agent-skills) | Skills de agentes IA para asistir el desarrollo | Activo |

## Stack común

- **Framework:** Next.js 14 + TypeScript
- **Base de datos:** PostgreSQL via Prisma ORM
- **UI:** Tailwind CSS + shadcn/ui
- **Auth:** NextAuth.js
- **Contenedores:** Docker + Docker Compose

## Inicio rápido por proyecto

Cada proyecto tiene su propio `README.md` y `docker-compose.yml`. Consultar la documentación individual de cada uno.

## Ramas

| Rama | Contenido |
|------|-----------|
| `main` | Documentación del ecosistema |
| `mockups` | Código fuente — estado inicial de todos los proyectos |

## Licencia

Uso interno — ISP TUC.
