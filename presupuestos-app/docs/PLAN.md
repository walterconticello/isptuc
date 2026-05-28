# Implementation Plan: Presupuestos App

## Architecture Decisions
- Next.js App Router con API Routes (no servidor separado)
- Prisma ORM — type-safe, migraciones manejadas
- Docker Compose: 2 servicios (app + db)
- Vertical slices: cada tarea entrega funcionalidad end-to-end

## Phase 1: Foundation (Docker + DB + Auth)

- [ ] Task 1: Docker Compose + Prisma schema + DB
  - Acceptance: `docker compose up -d` levanta app y db; `prisma migrate dev` corre sin errores
  - Verify: `docker ps` muestra 2 containers healthy
  - Files: `docker-compose.yml`, `Dockerfile`, `prisma/schema.prisma`, `.env.example`
  - Size: M

- [ ] Task 2: Login con NextAuth
  - Acceptance: POST /api/auth/signin autentica con email+password; redirige a dashboard; ruta protegida rechaza sin sesión
  - Verify: test integration auth + `npm run build`
  - Files: `src/app/(auth)/login/`, `src/lib/auth.ts`, `src/app/api/auth/`
  - Size: M

### Checkpoint 1
- [ ] `docker compose up -d` funciona
- [ ] Login/logout funciona
- [ ] Rutas protegidas redirigen a login sin sesión

## Phase 2: ABM Clientes + Items

- [ ] Task 3: API + UI ABM Clientes
  - Acceptance: CRUD completo clientes via /api/clientes; tabla paginada en /clientes
  - Verify: tests CRUD + manual check UI
  - Files: `src/app/api/clientes/`, `src/app/(dashboard)/clientes/`, `src/components/cliente/`
  - Size: M

- [ ] Task 4: API + UI ABM Items
  - Acceptance: CRUD completo items via /api/items; tabla paginada en /items
  - Verify: tests CRUD + manual check UI
  - Files: `src/app/api/items/`, `src/app/(dashboard)/items/`, `src/components/item/`
  - Size: M

### Checkpoint 2
- [ ] ABM Clientes funciona end-to-end
- [ ] ABM Items funciona end-to-end
- [ ] Tests pasan

## Phase 3: Core — Presupuesto WYSIWYG

- [ ] Task 5: Dashboard tabla presupuestos
  - Acceptance: /dashboard muestra tabla paginada con numero, cliente, fecha, estado, total; botón "Nuevo Presupuesto"
  - Verify: render con datos mock + test
  - Files: `src/app/(dashboard)/page.tsx`, `src/app/api/presupuestos/`
  - Size: S

- [ ] Task 6: Vista WYSIWYG — estructura del documento
  - Acceptance: /presupuestos/nuevo muestra el documento visual con header empresa (logo+CUIT), secciones cliente, items, totales, validez
  - Verify: screenshot visual + render sin errores
  - Files: `src/components/presupuesto/PresupuestoDoc.tsx`, `src/app/(dashboard)/presupuestos/nuevo/`
  - Size: M

- [ ] Task 7: Autocomplete cliente con creación inline
  - Acceptance: campo cliente busca mientras se escribe; si no existe muestra "¿Crear cliente?"; formulario inline guarda y selecciona; cliente nuevo aparece en la lista
  - Verify: test autocomplete + create inline + E2E
  - Files: `src/components/cliente/ClienteAutocomplete.tsx`
  - Size: M

- [ ] Task 8: Autocomplete items con creación inline
  - Acceptance: igual que cliente pero para ítems; múltiples líneas; cantidad y precio editables
  - Verify: test + E2E
  - Files: `src/components/item/ItemLineAutocomplete.tsx`
  - Size: M

- [ ] Task 9: Cálculo de totales en tiempo real
  - Acceptance: subtotal por línea = cantidad × precio; total = suma subtotales + IVA; se actualiza al cambiar cualquier valor
  - Verify: unit tests cálculos + render
  - Files: `src/lib/calculations.ts`, integrado en PresupuestoDoc
  - Size: S

- [ ] Task 10: Guardar presupuesto (borrador + edición)
  - Acceptance: POST /api/presupuestos crea; PATCH /api/presupuestos/:id actualiza; GET carga datos existentes en WYSIWYG
  - Verify: integration tests + manual edit
  - Files: `src/app/api/presupuestos/[id]/`
  - Size: M

### Checkpoint 3
- [ ] Flujo completo: crear presupuesto con cliente nuevo + ítems nuevos → guardar → editar
- [ ] Totales correctos
- [ ] Todos los tests pasan

## Phase 4: PDF + Polish

- [ ] Task 11: Export PDF + Print
  - Acceptance: botón "Generar PDF" descarga PDF con logo, datos empresa, cliente, ítems, totales, validez, "Válido por X días"; botón "Imprimir" abre print dialog
  - Verify: PDF generado visualmente correcto
  - Files: `src/components/presupuesto/PresupuestoPDF.tsx`, `src/lib/pdf.ts`
  - Size: M

- [ ] Task 12: Selector de validez + estado del presupuesto
  - Acceptance: selector 10/15/30 días; campo "fecha de vencimiento" calculado; estado cambiable (BORRADOR→ENVIADO→ACEPTADO/RECHAZADO)
  - Verify: unit tests fecha + UI
  - Files: integrado en PresupuestoDoc
  - Size: S

- [ ] Task 13: Configuración empresa (logo + CUIT)
  - Acceptance: página /configuracion permite cargar logo y datos de empresa; se reflejan en todos los presupuestos
  - Verify: upload logo + render en doc
  - Files: `src/app/(dashboard)/configuracion/`, `src/app/api/company/`
  - Size: M

### Checkpoint 4 — Complete
- [ ] PDF generado correctamente
- [ ] Logo empresa en presupuesto
- [ ] Pre-launch checklist verde
- [ ] `docker compose up -d` funciona en directorio limpio

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| PDF layout complejo | Med | Usar react-to-print primero (print CSS), jsPDF como backup |
| Upload de logo en Docker | Med | Guardar en `/public/uploads` o base64 en DB |
| Autocomplete performance con muchos items | Low | Debounce 300ms + limit 20 resultados |
