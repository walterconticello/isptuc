# Spec: Presupuestos App — ISP

## Objective

Sistema web para que una empresa de ISP genere presupuestos profesionales para sus clientes.
Dos usuarios: **admin** (gestiona ítems y clientes) y **dueño** (administra y envía presupuestos).
Los presupuestos deben verse como un documento real mientras se arman (WYSIWYG), exportarse a PDF, y quedar guardados para edición futura.

## Tech Stack

- Next.js 14 (App Router) + TypeScript 5
- PostgreSQL 16 + Prisma ORM
- Tailwind CSS + shadcn/ui
- NextAuth.js (credentials)
- react-to-print + jsPDF
- Docker + Docker Compose
- Vitest + Playwright

## Commands

```bash
docker compose up -d          # Levantar todo
npm run dev                   # Dev server
npm run build                 # Build producción
npm test                      # Unit + integration
npm run test:e2e              # E2E Playwright
npm run lint                  # Lint
npx tsc --noEmit              # Type check
npx prisma migrate dev        # Migración dev
npm run db:seed               # Seed inicial
```

## Data Model

### Company (configuración global, una sola fila)
- `id`, `nombre`, `cuit`, `direccion`, `telefono`, `email`, `logoUrl`

### User
- `id`, `email`, `passwordHash`, `role` (ADMIN | OWNER), `nombre`

### Cliente
- `id`, `nombre`, `cuit`, `direccion`, `telefono`, `email`, `createdAt`

### Item (servicios/productos)
- `id`, `codigo`, `descripcion`, `precioUnitario`, `unidad`, `activo`

### Presupuesto
- `id`, `numero` (auto-increment), `clienteId`, `estado` (BORRADOR | ENVIADO | ACEPTADO | RECHAZADO)
- `fechaEmision`, `validezDias` (10 | 15 | 30), `fechaVencimiento` (calculada)
- `notas`, `subtotal`, `iva` (%), `total`
- `createdAt`, `updatedAt`, `creadoPorId`

### PresupuestoItem
- `id`, `presupuestoId`, `itemId`, `descripcionCustom`, `cantidad`, `precioUnitario`, `subtotal`

### Impuesto
- `id`, `nombre`, `porcentaje` (Decimal 5,2), `activo`, `esDefault`, `createdAt`, `updatedAt`
- ABM completo en `/impuestos`
- Solo uno puede tener `esDefault = true` (enforced a nivel aplicación)
- `Presupuesto.ivaPorcentaje` almacena el porcentaje numérico al momento de emisión (denormalizado, ver ADR-003)

## UX Flow (Golden Path)

```
Login
  └── Dashboard (tabla presupuestos)
        └── [Nuevo Presupuesto]
              └── Vista WYSIWYG del documento
                    ├── Header: logo empresa + CUIT + datos
                    ├── Campo CLIENTE (autocomplete)
                    │     └── No existe → "¿Crear cliente?" → form inline → guardado
                    ├── Tabla de ITEMS (autocomplete por fila)
                    │     └── No existe → "¿Crear ítem?" → form inline → guardado
                    ├── Subtotal / IVA / TOTAL (calculado automático)
                    ├── Validez: selector 10 / 15 / 30 días
                    ├── Notas adicionales
                    └── Acciones: [Guardar Borrador] [Generar PDF] [Imprimir]
```

## Project Structure

```
src/app/(auth)/login/          → Login page
src/app/(dashboard)/           → Dashboard + rutas protegidas
src/app/api/                   → API Routes
src/components/presupuesto/    → WYSIWYG + PDF
src/components/cliente/        → Autocomplete + form inline
src/components/item/           → Autocomplete + form inline
src/lib/                       → db, auth, validations, pdf
prisma/schema.prisma           → Schema
docs/decisions/                → ADRs
```

## Code Style

```tsx
// Named exports, functional components, Zod at boundaries
export function ClienteAutocomplete({ onSelect }: ClienteAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  // ...
}
```

## Testing Strategy

- **Unit (Vitest ~80%):** Cálculos de totales, validaciones Zod, formateo de datos
- **Integration (Vitest ~15%):** API routes + DB con test database
- **E2E (Playwright ~5%):** Flujo completo: login → crear presupuesto → PDF

Tests colocados junto al código: `Component.test.tsx`

## Boundaries

- **Always:** Spec antes de código, Zod en APIs, tests antes de commit, ADRs para decisiones
- **Ask first:** Nuevas dependencias, cambios de schema, cambios de auth
- **Never:** Secrets en repo, stack traces a usuarios, innerHTML con input de usuario

## Success Criteria

- [ ] `docker compose up -d` levanta la app completa en un comando
- [ ] Login funciona con email/password
- [ ] Dashboard muestra tabla paginada de presupuestos
- [ ] Vista WYSIWYG muestra el documento real del presupuesto
- [ ] Autocomplete de clientes con creación inline
- [ ] Autocomplete de ítems con creación inline
- [ ] Totales calculan en tiempo real
- [ ] Validez configurable 10/15/30 días
- [ ] PDF generado con logo, CUIT, datos del cliente e ítems
- [ ] Presupuestos editables post-creación
- [ ] ABM completo de Clientes e Ítems
- [x] ABM completo de Impuestos con esDefault y soft-delete
- [ ] Portable a servidor externo vía `.env`

## Open Questions (resueltas)

- ~~¿PDF o imprimible?~~ → Ambos
- ~~¿Hosted o local?~~ → Local con Docker, luego propio server
- ~~¿Multi-usuario complejo?~~ → Solo 2 roles simples: ADMIN y OWNER
- ~~¿Next.js vs React+Express?~~ → Next.js (App Router, API routes integradas)
- ~~¿TypeScript?~~ → Sí

## ADRs

- [ADR-001](docs/decisions/ADR-001-nextjs-stack.md) — Next.js + Prisma + PostgreSQL
- [ADR-002](docs/decisions/ADR-002-auth.md) — NextAuth credentials
- [ADR-003](docs/decisions/ADR-003-impuesto-denormalized.md) — IVA denormalizado en Presupuesto
