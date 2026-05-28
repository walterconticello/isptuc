# ADR-001: Next.js 14 + Prisma + PostgreSQL

## Status
Accepted

## Date
2026-05-26

## Context
Necesitamos un stack para una app web interna de presupuestos ISP.
Requisitos: portable a Docker, hosteable en servidor propio, 2 usuarios, sin servidor separado.

## Decision
Next.js 14 (App Router) + TypeScript + Prisma + PostgreSQL 16.

## Alternatives Considered

### React + Vite + Express separados
- Pros: Separación clara frontend/backend
- Cons: 3 contenedores Docker, más configuración, sin beneficio real para 2 usuarios
- Rejected: Complejidad sin beneficio

### SQLite
- Pros: Zero config, sin container separado
- Cons: No soporta concurrencia real, no apto para producción multi-usuario
- Rejected: PostgreSQL es la opción correcta para producción

## Consequences
- Next.js API Routes reemplazan Express — menos contenedores Docker
- Prisma provee type-safety y migraciones manejadas
- 2 contenedores: app (Next.js) + db (PostgreSQL)
