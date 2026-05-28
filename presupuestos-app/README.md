# Presupuestos App — ISP TUC

Sistema interno de presupuestos para empresa de telecomunicaciones (ISP).

## Descripción

Herramienta web para generar, gestionar y exportar presupuestos de servicios de internet y telecomunicaciones. Pensada para uso interno, con despliegue local vía Docker.

## Stack

- **Frontend/Backend:** Next.js 14 (App Router) + TypeScript
- **Base de datos:** PostgreSQL 16 via Prisma ORM
- **UI:** Tailwind CSS + shadcn/ui
- **Auth:** NextAuth.js
- **Contenedores:** Docker + Docker Compose
- **PDF:** react-to-print + jsPDF

## Funcionalidades

- Login / logout
- Dashboard con tabla de presupuestos (borrador / enviado / aceptado)
- Vista WYSIWYG del documento
- Autocomplete de clientes con creación inline
- Autocomplete de ítems/servicios con creación inline
- Cálculo automático de totales
- Validez configurable: 10, 15 o 30 días
- Logo y CUIT de la empresa en el encabezado
- Export a PDF e impresión
- ABM de Clientes
- ABM de Ítems/Servicios
- Portable a servidor propio vía variables de entorno

## Inicio rápido

```bash
# Copiar variables de entorno
cp .env.example .env
# Editar .env con tus valores

# Levantar todo con Docker
docker compose up -d

# Abrir en el navegador
# http://localhost:3000
```

## Ramas

| Rama | Contenido |
|------|-----------|
| `main` | Documentación del proyecto |
| `mockups` | Código fuente — estado inicial / mockups |

## Licencia

Uso interno — ISP TUC.
