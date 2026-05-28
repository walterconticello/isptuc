# isp-manager — Plan de Implementación: Fase 1

> Fundación: scaffolding, schema, autenticación, empleados, RBAC
> Última actualización: 2026-05-28

---

## Grafo de Dependencias

```
T01 (Scaffolding)
  └─► T02 (Schema + Seed)
        └─► T03 (Auth + Login)
              └─► T04 (Layout + Sidebar)
                    └─► T05 (ABM Empleados)
                          └─► T06 (Admin: RBAC Visual)
                                └─► ✅ CHECKPOINT Fase 1
```

Cada tarea es un slice vertical completo: toca DB, server actions, UI y tests.
No hay tareas "solo frontend" ni "solo backend".

---

## T01 — Scaffolding del Proyecto

**Entrega:** El proyecto levanta en localhost:3000 con DB corriendo.

### Qué hacer
- Crear Next.js con `create-next-app` (TypeScript strict, App Router, Tailwind, src/)
- Instalar dependencias: `prisma`, `@prisma/client`, `next-auth@beta`, `bcryptjs`, `zod`, `date-fns`, `lucide-react`
- Instalar devDeps: `vitest`, `@vitejs/plugin-react`, `tsx`
- Configurar shadcn/ui (init + componentes base: button, input, label, card, table, badge, dialog, select, dropdown-menu, sheet, separator, avatar)
- Escribir `docker-compose.yml` (PostgreSQL 16, puerto 5432, volumen persistente)
- Escribir `.env.example` y `.env` con DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL
- Configurar `vitest.config.ts`
- Agregar scripts en package.json: `db:migrate`, `db:seed`, `db:studio`, `typecheck`
- Crear `CLAUDE.md` del proyecto con convenciones básicas

### Criterios de Aceptación
- [ ] `docker-compose up -d` levanta PostgreSQL sin errores
- [ ] `npm run dev` sirve localhost:3000 sin errores de compilación
- [ ] `npm run typecheck` pasa (0 errores)
- [ ] `npm run lint` pasa
- [ ] Estructura de carpetas coincide con SPEC.md §4

### Verificación
```bash
docker-compose up -d
npm run dev
# Abrir localhost:3000 — debe mostrar la pantalla de Next.js base
npm run typecheck
```

---

## T02 — Schema Prisma Completo + Seed Inicial

**Entrega:** Todas las tablas en la DB, seed con empresa placeholder y usuario DUENO.

### Qué hacer
- Escribir `prisma/schema.prisma` completo (todos los modelos del SPEC.md §5):
  - Empleado, PermisoModulo, Empresa
  - Vehiculo, Cuadrilla, MiembroCuadrilla, RegistroCombustible
  - Cliente, ItemServicio, Presupuesto, PresupuestoItem, Impuesto
  - Almacen, Producto, StockProducto, MovimientoStock, AsignacionHerramienta
  - Todos los enums: Rol, Modulo, TipoVehiculo, EstadoVehiculo, EstadoCuadrilla, TipoCombustible, EstadoPresupuesto, CategoriaProducto, TipoMovimiento
- Escribir `prisma/seed.ts`:
  - 1 registro Empresa (nombre placeholder)
  - 10 registros PermisoModulo con defaults del SPEC.md §6 (todos los rol × modulo)
  - 1 empleado DUENO: `admin@isp.local` / `admin123` (hash bcrypt)
- Crear `src/lib/db.ts` (singleton Prisma)
- Escribir tests unitarios en `tests/unit/validations.test.ts` (schemas Zod básicos)

### Criterios de Aceptación
- [ ] `npm run db:migrate` aplica migración sin errores
- [ ] `npm run db:seed` carga los datos sin errores
- [ ] Prisma Studio muestra todas las tablas con datos del seed
- [ ] El empleado DUENO tiene acceso a todos los módulos en PermisoModulo
- [ ] El empleado TECNICO NO tiene acceso a PRESUPUESTOS ni ADMIN en PermisoModulo

### Verificación
```bash
npm run db:migrate
npm run db:seed
npm run db:studio
# Verificar tablas Empleado (1 fila), PermisoModulo (50 filas = 5 roles × 10 módulos), Empresa (1 fila)
```

---

## T03 — Autenticación End-to-End

**Entrega:** Login funcional con sesión persistente y middleware de protección de rutas.

### Qué hacer
- Configurar NextAuth.js v5 en `src/lib/auth.ts`:
  - Credentials provider: buscar Empleado por email, verificar bcrypt, verificar `activo: true`
  - Session incluye: `id`, `nombre`, `apellido`, `email`, `rol`
  - JWT strategy
- Crear `src/app/api/auth/[...nextauth]/route.ts`
- Crear `middleware.ts` en raíz:
  - Rutas `/(dashboard)/*` requieren sesión activa
  - Redirige `/` → `/dashboard` si hay sesión, `/login` si no
- Construir página de login `src/app/(auth)/login/page.tsx`:
  - Formulario: email + contraseña
  - Validación client-side con Zod
  - Manejo de error "credenciales inválidas" y "cuenta inactiva"
  - Responsive (mobile-first)
- Agregar schema Zod `loginSchema` en `src/lib/validations.ts`
- Test unitario: `tests/unit/validations.test.ts` — validar loginSchema

### Criterios de Aceptación
- [ ] `admin@isp.local` / `admin123` → login exitoso → redirige a `/dashboard`
- [ ] Credenciales incorrectas → mensaje de error en el formulario
- [ ] Empleado con `activo: false` → mensaje "Cuenta desactivada"
- [ ] Acceder a `/dashboard` sin sesión → redirige a `/login`
- [ ] La sesión persiste al recargar la página
- [ ] Formulario de login es usable en mobile (320px)

### Verificación
```bash
npm run dev
# 1. Ir a localhost:3000/dashboard sin sesión → debe redir a /login
# 2. Login con admin@isp.local / admin123 → debe llegar a /dashboard
# 3. Login con contraseña incorrecta → debe mostrar error
# 4. Recargar /dashboard con sesión → debe mantenerse logueado
```

---

## T04 — Layout del Dashboard + Sidebar Responsive con RBAC

**Entrega:** Shell de la aplicación: sidebar que filtra módulos según el rol del usuario logueado.

### Qué hacer
- Crear `src/lib/permissions.ts`:
  - `getPermisosEmpleado(empleadoId)` — consulta DB, retorna `Set<Modulo>`
  - `checkPermission(empleadoId, modulo)` — retorna boolean
  - Cachear permisos en la sesión (evitar query por cada render)
- Crear layout `src/app/(dashboard)/layout.tsx`:
  - Sidebar desktop: fijo izquierda, 240px
  - Sidebar mobile: Sheet (drawer) con botón hamburguesa en header
  - Header: logo/nombre empresa, nombre del usuario, botón logout
  - Solo renderiza links de módulos donde `checkPermission` = true
- Crear `src/components/layout/Sidebar.tsx` y `Header.tsx`
- Crear `src/app/(dashboard)/page.tsx` — placeholder "Bienvenido, [nombre]"
- Definir la lista completa de módulos con: ruta, label, icono (lucide)

### Criterios de Aceptación
- [ ] Usuario DUENO ve todos los módulos en el sidebar
- [ ] Usuario TECNICO no ve PRESUPUESTOS, EMPLEADOS, ADMIN en el sidebar
- [ ] En mobile (< 768px): sidebar oculto, aparece con botón hamburguesa
- [ ] Logout desde el header destruye sesión y redirige a /login
- [ ] El link activo tiene estilo destacado
- [ ] No hay hydration errors en consola

### Verificación
```bash
npm run dev
# Login como DUENO → verificar todos los módulos visibles
# Reducir ventana a 375px → sidebar se oculta, aparece hamburguesa
# Click hamburguesa → sidebar abre como drawer
# Click logout → redirige a /login
```

---

## T05 — ABM de Empleados (Slice Vertical Completo)

**Entrega:** CRUD completo de empleados con validación, roles, y control de acceso.

### Qué hacer
- Escribir `src/lib/validations.ts` — agregar schemas:
  - `crearEmpleadoSchema`: nombre, apellido, email, dni?, telefono?, rol, contraseña (min 8)
  - `editarEmpleadoSchema`: igual pero contraseña opcional
- Escribir `src/modules/empleados/actions.ts`:
  - `getEmpleados()` — lista todos con paginación simple
  - `getEmpleadoById(id)` — detalle sin passwordHash
  - `createEmpleado(data)` — hash bcrypt 12 rounds, verificar email único
  - `updateEmpleado(id, data)` — no permite cambiar rol propio
  - `toggleEmpleadoActivo(id)` — no permite desactivar propio usuario
  - `cambiarContraseña(id, nueva)` — solo DUENO/ADMIN o el propio usuario
  - Cada action: verificar `checkPermission(session.id, 'EMPLEADOS')` primero
- Construir páginas:
  - `empleados/page.tsx` — tabla con nombre, apellido, email, rol (badge color), estado (activo/inactivo), acciones
  - `empleados/nuevo/page.tsx` — formulario de creación
  - `empleados/[id]/page.tsx` — detalle (lectura)
  - `empleados/[id]/editar/page.tsx` — formulario de edición
- Tests unitarios: `tests/unit/validations.test.ts` — crearEmpleadoSchema casos válidos e inválidos

### Criterios de Aceptación
- [ ] Crear empleado → aparece en la lista inmediatamente
- [ ] Email duplicado → error "Ya existe un empleado con ese email"
- [ ] Editar empleado propio → no puede cambiar su propio rol
- [ ] Desactivar empleado → aparece como inactivo, no puede iniciar sesión
- [ ] No se puede desactivar el propio usuario
- [ ] Usuario sin permiso EMPLEADOS → `checkPermission` retorna error 403
- [ ] Badges de rol: DUENO=morado, GERENTE=azul, ADMIN=naranja, ADMINISTRATIVO=verde, TECNICO=gris
- [ ] Vista de lista usable en mobile (cards en lugar de tabla en < 768px)

### Verificación
```bash
npm run dev
npm test # validations.test.ts pasa
# Login como DUENO
# Crear nuevo empleado con rol TECNICO
# Verificar aparece en lista
# Editar: cambiar teléfono
# Desactivar empleado
# Login con empleado desactivado → debe rechazar con "Cuenta desactivada"
```

---

## T06 — Panel Admin: RBAC Visual

**Entrega:** Tabla interactiva que permite a DUENO/ADMIN configurar permisos por rol y módulo.

### Qué hacer
- Escribir `src/modules/admin/actions.ts`:
  - `getPermisosMatrix()` — retorna todos los PermisoModulo como matriz rol×módulo
  - `togglePermiso(rol, modulo)` — invierte el booleano `puede`
  - Guards: solo DUENO y ADMIN pueden invocar estas actions
  - Validar que DUENO nunca pierda acceso a ADMIN (invariante)
- Construir `admin/permisos/page.tsx`:
  - Tabla: filas = módulos, columnas = roles
  - Cada celda: checkbox o toggle
  - Optimistic update: UI cambia inmediatamente, persiste en background
  - Badge visual: módulo con todos los roles sin acceso → fila destacada en rojo
- Construir `admin/page.tsx` — landing del admin con links a subsecciones
- Test unitario: `tests/unit/permissions.test.ts`:
  - `checkPermission` retorna true/false correctamente
  - DUENO siempre tiene permiso ADMIN (invariante)

### Criterios de Aceptación
- [ ] Toggle de permiso persiste en DB al refrescar
- [ ] Cambio de permiso se refleja en sidebar sin necesidad de relogin (siguiente navegación)
- [ ] DUENO no puede quitarse permiso ADMIN (toggle bloqueado con tooltip)
- [ ] Usuario sin rol DUENO ni ADMIN → redirige a /dashboard con error
- [ ] Test de permisos: 100% pasan

### Verificación
```bash
npm test # permissions.test.ts pasa
npm run dev
# Login como DUENO
# Ir a /admin/permisos
# Quitar permiso PRESUPUESTOS al rol TECNICO → guardar
# Login como TECNICO → verificar que no aparece PRESUPUESTOS en sidebar
# Volver como DUENO → re-habilitar permiso
```

---

## ✅ CHECKPOINT — Fase 1 Completa

Al completar T06, el sistema base está operativo:

| Capacidad | Estado |
|-----------|--------|
| Login con email/contraseña | ✓ |
| Sesión persistente + logout | ✓ |
| Middleware protege todas las rutas | ✓ |
| Sidebar filtra módulos por permiso | ✓ |
| CRUD completo de empleados | ✓ |
| Roles asignados a empleados | ✓ |
| RBAC configurable desde admin | ✓ |
| Responsive (mobile + desktop) | ✓ |
| TypeScript strict (0 errores) | ✓ |
| Tests unitarios pasando | ✓ |

**Siguiente:** Fase 2 — Módulos Operativos (Flota, Combustible, Cuadrillas)

---

## Notas de Implementación

### Caché de Permisos
Los permisos se consultan en cada server action. Para evitar N queries por request:
- Incluir permisos en el JWT de NextAuth al hacer login (snapshot al momento de login)
- Los permisos del sidebar se leen del JWT
- Las server actions consultan DB directamente (los permisos pueden cambiar)
- Si el admin modifica permisos, el siguiente request del usuario afectado ya los ve actualizados

### Patrón de Server Actions
```typescript
// Toda server action sigue este patrón:
export async function createEmpleado(data: unknown) {
  const session = await getServerSession()
  if (!session) return { success: false, error: 'No autenticado' }

  const canAccess = await checkPermission(session.user.id, 'EMPLEADOS')
  if (!canAccess) return { success: false, error: 'Sin permisos' }

  const parsed = crearEmpleadoSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: parsed.error.message }

  // ... lógica de negocio
  return { success: true, data: result }
}
```

### Mobile-First
- Tablas de listas → en mobile renderizar como cards (usar `hidden md:table` / `md:hidden`)
- Formularios → stack vertical, campos full-width en mobile
- Sidebar → Sheet (drawer) en mobile, sidebar fijo en desktop
