# isp-manager — Lista de Tareas: Fase 1

> Estado: ⬜ pendiente | 🔄 en progreso | ✅ completado | ❌ bloqueado

---

## Fase 1 — Fundación

### T01 — Scaffolding del Proyecto
- [ ] Crear proyecto Next.js (TypeScript strict, App Router, Tailwind, src/)
- [ ] Instalar dependencias de producción (prisma, next-auth, bcryptjs, zod, date-fns, lucide-react)
- [ ] Instalar devDependencias (vitest, tsx, @vitejs/plugin-react)
- [ ] Inicializar shadcn/ui + instalar componentes base
- [ ] Escribir docker-compose.yml (PostgreSQL 16)
- [ ] Crear .env.example y .env con variables requeridas
- [ ] Configurar vitest.config.ts
- [ ] Agregar scripts npm: db:migrate, db:seed, db:studio, typecheck
- [ ] Crear CLAUDE.md del proyecto
- [ ] Verificar: `npm run dev` + `npm run typecheck` sin errores

**Bloqueante para:** T02

---

### T02 — Schema Prisma Completo + Seed
- [ ] Escribir schema.prisma completo (todos los modelos y enums del SPEC.md)
- [ ] Crear src/lib/db.ts (singleton Prisma)
- [ ] Escribir prisma/seed.ts (Empresa, PermisoModulo defaults, empleado admin@isp.local)
- [ ] Ejecutar migración inicial
- [ ] Ejecutar seed y verificar en Prisma Studio
- [ ] Verificar permisos defaults: DUENO=todo, TECNICO sin PRESUPUESTOS/ADMIN

**Bloqueante para:** T03

---

### T03 — Autenticación End-to-End
- [ ] Configurar NextAuth.js v5 en src/lib/auth.ts (credentials provider)
- [ ] Crear src/app/api/auth/[...nextauth]/route.ts
- [ ] Escribir middleware.ts (proteger /dashboard/*, redirect /)
- [ ] Crear página login: src/app/(auth)/login/page.tsx (formulario responsive)
- [ ] Agregar loginSchema a src/lib/validations.ts
- [ ] Manejar errores: credenciales inválidas, cuenta inactiva
- [ ] Test: login exitoso → /dashboard, fallo → error visible
- [ ] Test: acceso a /dashboard sin sesión → redirige a /login

**Bloqueante para:** T04

---

### T04 — Layout + Sidebar Responsive con RBAC
- [ ] Crear src/lib/permissions.ts (getPermisosEmpleado, checkPermission)
- [ ] Crear src/app/(dashboard)/layout.tsx con sidebar + header
- [ ] Crear src/components/layout/Sidebar.tsx (desktop: fijo, mobile: Sheet/drawer)
- [ ] Crear src/components/layout/Header.tsx (nombre empresa, usuario, logout)
- [ ] Filtrar NavLinks según permisos del usuario logueado
- [ ] Crear src/app/(dashboard)/page.tsx (placeholder bienvenida)
- [ ] Test: DUENO ve todos los módulos, TECNICO no ve PRESUPUESTOS/ADMIN
- [ ] Test mobile: sidebar oculto en < 768px, hamburguesa visible

**Bloqueante para:** T05

---

### T05 — ABM Empleados (Slice Vertical)
- [ ] Agregar crearEmpleadoSchema + editarEmpleadoSchema a validations.ts
- [ ] Escribir src/modules/empleados/actions.ts (getEmpleados, getById, create, update, toggle, cambiarContraseña)
- [ ] Crear empleados/page.tsx (tabla desktop / cards mobile)
- [ ] Crear empleados/nuevo/page.tsx (formulario)
- [ ] Crear empleados/[id]/page.tsx (detalle)
- [ ] Crear empleados/[id]/editar/page.tsx (formulario edición)
- [ ] Guards: no cambiar rol propio, no desactivar propio usuario
- [ ] Test unitario: crearEmpleadoSchema casos válidos e inválidos
- [ ] Test: crear empleado duplicado → error descriptivo

**Bloqueante para:** T06

---

### T06 — Panel Admin: RBAC Visual
- [ ] Escribir src/modules/admin/actions.ts (getPermisosMatrix, togglePermiso)
- [ ] Invariante: DUENO no puede perder acceso a ADMIN
- [ ] Crear admin/page.tsx (landing admin)
- [ ] Crear admin/permisos/page.tsx (tabla rol × módulo con toggles)
- [ ] Optimistic update en toggles
- [ ] Bloquear toggle DUENO/ADMIN con tooltip explicativo
- [ ] Test unitario: permissions.test.ts (checkPermission, invariante DUENO)
- [ ] Test E2E básico: cambiar permiso → verificar en sidebar

---

## ✅ Checkpoint Fase 1

Cuando todos los ítems anteriores estén marcados:
- [ ] `npm run typecheck` — 0 errores
- [ ] `npm test` — todos los tests pasan
- [ ] `npm run build` — build de producción exitoso
- [ ] Flujo completo manual: login → sidebar → empleados → permisos → logout

---

## ✅ Fase 2 — Módulos Operativos (completada)
- [x] T07 — Módulo Flota (Vehículos ABM)
- [x] T08 — Módulo Combustible (Registros + resumen mensual)
- [x] T09 — Módulo Cuadrillas (con empleados reales)

---

## Fase 3 — Módulos de Gestión
- [ ] T10 — Módulo Presupuestos (ABM + editor + PDF)
- [ ] T11 — ABM Clientes e Items/Servicios

---

## Backlog — Mejoras pendientes

### Combustible: Filtro por calendario
**Origen:** usuario pidió poder filtrar registros por fecha con visualización
de qué días hubo cargas.

**Diseño acordado:**
- Mini-calendario en la página `/combustible` (componente propio, sin librerías externas)
- Días con al menos una carga pintados con punto de color o fondo tenue
- Click en un día filtra la lista al feed de ese día
- Navegación mes anterior / mes siguiente
- Datos cargados server-side: `getCargarPorMes(año, mes)` retorna
  `{ fecha: string; cantidad: number; costo: number }[]`
- URL state: `?mes=2026-05` para que el filtro sea linkeable y sobreviva recarga
- Filtro por vehículo adicional (select) que se combina con el calendario

**Cuándo implementar:** después de completar Fase 3 (Presupuestos), como
primera mejora de la Fase de pulido.

---

## Fase RED — Módulo FTTH / ONUs (rama `feat/modulo-red`)

### Fase 0 — Setup
- [x] T0 — rama `feat/modulo-red` + `.env` (secretos reales) + `.env.example` (placeholders)

### Fase 1 — Datos base  ✅ (migración aplicada en dev; typecheck 0 errores)
- [x] T1a — schema: `Modulo.RED`, `FuenteOlt`, modelos `Olt/Onu/ContratoWispro/RegistroConfiguracion`
- [x] T1b — migración `20260609105106_modulo_red` (generada + aplicada en dev) + client regenerado
- [x] T1c — seed: `RED` en `PERMISOS_DEFAULT` (55 permisos sembrados)
- [x] T1d — audit.ts: módulo `RED` + acciones `SYNC_ONUS`, `CONFIGURAR_ONU`

### Fase 2 — Lógica pura + tests  ✅ (11 tests verde)
- [x] T2a — `potencia.ts` (clasificarSenal) + test
- [x] T2b — `fuentes/parse-arrays.ts` (parseArrays) + test

### Fase 3 — Ingesta
- [x] T3 — WisPro: `wispro/cliente.ts` + `wispro/sync-contratos.ts`
- [x] T4 — fuente PANEL: `fuentes/tipos.ts` + `fuentes/panel.ts`

### Fase 4 — Server actions
- [x] T5 — `modules/red/actions.ts` (getOnus / getOnuById / sincronizarOnus / getResumenRed)

### Fase 5 — UI  ✅ (estilo MEJORAS_VISUALES, ui-ux-pro-max)
- [x] T6 — `/red/page.tsx` + `_components/sync-bar.tsx` (KPIs, tabla+cards, semáforo, ?q=, filtros OLT/nivel, sync)
- [x] T7 — `/red/[id]/page.tsx` (detalle + potencia destacada + historial config)
- [x] T8 — sidebar: ítem `RED` en grupo Operaciones

### Fase 6 — Reporte vsol-config
- [x] T9 — `/api/red/configuracion/route.ts` (bearer token, Zod, RegistroConfiguracion + audit)

### Fase 7 — Verificación  ✅
- [x] T10 — typecheck 0 · eslint 0 · 130/130 tests · `npm run build` OK

### Pendientes (siguientes tareas)
- [ ] Ingesters SNMP/TELNET para las otras ~5 OLTs (hoy solo PANEL/El Mollar)
- [ ] Wiring del cliente `vsol-config` (escritorio) para que haga POST a `/api/red/configuracion`
- [ ] Resolver nombre de plan (plan_id → /plans) en la cache WisPro
- [ ] Optimizar sync de contratos WisPro (hoy upsert secuencial de ~3134)
- [ ] Smoke test en vivo: `npm run dev` → /red → «Sincronizar» (requiere VPN)

---
