# isp-manager — Especificación del Sistema

> Sistema de gestión integral para empresa ISP. Versión 1.0.
> Última actualización: 2026-05-28

---

## 1. Objetivo

**¿Qué construimos?**
Una plataforma web interna que unifica la gestión operativa de una empresa ISP: empleados, flota vehicular, combustible, cuadrillas, presupuestos y stock/inventario, con un sistema de login centralizado y control de acceso por rol y módulo.

**¿Para quién?**
Equipo interno de 2–10 personas con distintos niveles de acceso:
- **Dueño / Gerente** — visión completa del negocio, acceso a presupuestos y reportes
- **Admin** — gestión del sistema, permisos, configuración
- **Administrativo** — clientes, presupuestos básicos, stock
- **Técnico** — registro de combustible, cuadrillas, herramientas asignadas

**Criterios de éxito:**
- Un empleado inicia sesión y ve únicamente los módulos habilitados para su rol
- Dueño/Gerente crean y gestionan presupuestos con exportación PDF
- Técnicos registran cargas de combustible y ven sus cuadrillas asignadas
- El admin configura permisos por módulo y rol desde el panel de administración
- El stock refleja movimientos de entrada/salida y el encargado de cada almacén puede gestionarlo
- Las herramientas asignadas a empleados quedan registradas y son rastreables

---

## 2. Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js (App Router) + TypeScript strict |
| ORM | Prisma |
| Base de datos | PostgreSQL (Docker en dev, servidor propio en prod) |
| Auth | NextAuth.js v5 (credentials provider, JWT sessions) |
| UI | shadcn/ui + Tailwind CSS v4 |
| Validación | Zod (en toda frontera API/acción) |
| PDF | jsPDF + react-to-print |
| Tests unitarios | Vitest |
| Tests E2E | Playwright |
| Iconos | Lucide React |
| Fechas | date-fns |

**Deploy:**
- Desarrollo: Docker local (`docker-compose up`)
- Producción: servidor propio + dominio propio (LAN → web)

---

## 3. Comandos

```bash
npm run dev           # Dev server en http://localhost:3000
npm run build         # Build de producción
npm run start         # Servidor de producción
npm run lint          # ESLint
npm run typecheck     # TypeScript (tsc --noEmit)
npm test              # Tests unitarios (Vitest)
npm run test:e2e      # Tests E2E (Playwright)
npm run db:migrate    # Aplicar migraciones Prisma
npm run db:seed       # Seed inicial (empresa, roles, usuario admin)
npm run db:studio     # Prisma Studio
docker-compose up -d  # Levantar PostgreSQL en Docker
```

---

## 4. Estructura del Proyecto

```
isp-manager/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/                    # Página de login
│   │   ├── (dashboard)/                  # Rutas protegidas
│   │   │   ├── layout.tsx                # Layout con sidebar + header
│   │   │   ├── page.tsx                  # Dashboard principal
│   │   │   ├── empleados/                # ABM de empleados
│   │   │   │   ├── page.tsx
│   │   │   │   ├── nuevo/page.tsx
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx
│   │   │   │       └── editar/page.tsx
│   │   │   ├── flota/                    # Gestión de vehículos
│   │   │   │   ├── page.tsx
│   │   │   │   ├── nuevo/page.tsx
│   │   │   │   └── [id]/
│   │   │   ├── combustible/              # Registros de combustible
│   │   │   │   ├── page.tsx
│   │   │   │   └── nuevo/page.tsx
│   │   │   ├── cuadrillas/               # Gestión de cuadrillas
│   │   │   │   ├── page.tsx
│   │   │   │   ├── nueva/page.tsx
│   │   │   │   └── [id]/
│   │   │   ├── presupuestos/             # Presupuestos (DUEÑO/GERENTE/ADMIN)
│   │   │   │   ├── page.tsx
│   │   │   │   ├── nuevo/page.tsx
│   │   │   │   └── [id]/
│   │   │   ├── clientes/                 # ABM de clientes
│   │   │   ├── items/                    # ABM de items/servicios
│   │   │   ├── stock/                    # Stock e inventario
│   │   │   │   ├── page.tsx              # Dashboard de stock
│   │   │   │   ├── almacenes/            # ABM de almacenes
│   │   │   │   ├── productos/            # Catálogo de productos
│   │   │   │   └── movimientos/          # Movimientos de entrada/salida
│   │   │   └── admin/                    # Administración del sistema
│   │   │       ├── page.tsx
│   │   │       ├── permisos/             # Config RBAC visual por rol/módulo
│   │   │       ├── empresa/              # Config de la empresa
│   │   │       └── auditoria/            # Log de acciones (futuro)
│   │   ├── api/
│   │   │   └── auth/[...nextauth]/       # Handler NextAuth
│   │   ├── layout.tsx
│   │   └── page.tsx                      # Redirect → /dashboard
│   ├── components/
│   │   ├── ui/                           # shadcn/ui base
│   │   ├── layout/                       # Sidebar, Header, NavLinks
│   │   ├── presupuesto/                  # Editor WYSIWYG, PDF preview
│   │   ├── stock/                        # Tabla de stock, badge de alerta
│   │   └── shared/                       # Componentes reutilizables
│   ├── lib/
│   │   ├── auth.ts                       # NextAuth config
│   │   ├── db.ts                         # Prisma client singleton
│   │   ├── permissions.ts                # RBAC helpers (checkPermission)
│   │   ├── validations.ts                # Schemas Zod globales
│   │   └── utils.ts                      # Utilidades compartidas
│   └── modules/                          # Server Actions por módulo
│       ├── empleados/actions.ts
│       ├── flota/actions.ts
│       ├── combustible/actions.ts
│       ├── cuadrillas/actions.ts
│       ├── presupuestos/actions.ts
│       ├── clientes/actions.ts
│       ├── items/actions.ts
│       ├── stock/actions.ts
│       └── admin/actions.ts
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── tests/
│   ├── unit/
│   │   ├── calculations.test.ts
│   │   ├── permissions.test.ts
│   │   └── validations.test.ts
│   └── e2e/
│       ├── auth.spec.ts
│       ├── presupuestos.spec.ts
│       └── combustible.spec.ts
├── public/
├── docker-compose.yml
├── .env.example
├── SPEC.md
└── CLAUDE.md
```

---

## 5. Modelo de Datos (Prisma)

### Empleados / Usuarios

```prisma
model Empleado {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  nombre       String
  apellido     String
  dni          String?  @unique
  telefono     String?
  rol          Rol
  activo       Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  // Relaciones
  cuadrillas             MiembroCuadrilla[]
  registrosCombustible   RegistroCombustible[]
  presupuestosCreados    Presupuesto[]
  herramientasAsignadas  AsignacionHerramienta[]
  almacenesACargo        Almacen[]
  movimientosStock       MovimientoStock[]
}

enum Rol {
  DUENO
  GERENTE
  ADMIN
  ADMINISTRATIVO
  TECNICO
}
```

### Permisos por Módulo (RBAC configurable)

```prisma
model PermisoModulo {
  id     String  @id @default(cuid())
  rol    Rol
  modulo Modulo
  puede  Boolean @default(false)

  @@unique([rol, modulo])
}

enum Modulo {
  DASHBOARD
  EMPLEADOS
  FLOTA
  COMBUSTIBLE
  CUADRILLAS
  PRESUPUESTOS
  CLIENTES
  ITEMS
  STOCK
  ADMIN
}
```

### Empresa

```prisma
model Empresa {
  id        String   @id @default(cuid())
  nombre    String
  cuit      String
  direccion String?
  telefono  String?
  email     String?
  logoUrl   String?
  updatedAt DateTime @updatedAt
}
```

### Flota

```prisma
model Vehiculo {
  id              String        @id @default(cuid())
  patente         String        @unique
  marca           String
  modelo          String
  anio            Int
  tipo            TipoVehiculo
  estado          EstadoVehiculo
  odometroActual  Float         @default(0)
  cuadrillaId     String?
  notas           String?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  cuadrilla        Cuadrilla?          @relation(fields: [cuadrillaId], references: [id])
  registrosCombustible RegistroCombustible[]
}

enum TipoVehiculo  { AUTO CAMIONETA MOTO FURGON }
enum EstadoVehiculo { ACTIVO MANTENIMIENTO INACTIVO }
```

### Cuadrillas

```prisma
model Cuadrilla {
  id          String        @id @default(cuid())
  nombre      String
  descripcion String?
  estado      EstadoCuadrilla @default(ACTIVA)
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  miembros    MiembroCuadrilla[]
  vehiculos   Vehiculo[]
}

model MiembroCuadrilla {
  id          String    @id @default(cuid())
  cuadrillaId String
  empleadoId  String
  esJefe      Boolean   @default(false)
  desde       DateTime  @default(now())

  cuadrilla   Cuadrilla @relation(fields: [cuadrillaId], references: [id])
  empleado    Empleado  @relation(fields: [empleadoId], references: [id])

  @@unique([cuadrillaId, empleadoId])
}

enum EstadoCuadrilla { ACTIVA INACTIVA }
```

### Combustible

```prisma
model RegistroCombustible {
  id              String    @id @default(cuid())
  vehiculoId      String
  empleadoId      String
  fecha           DateTime
  litros          Float
  precioPorLitro  Float
  costoTotal      Float
  odometro        Float
  kmDesdeUltimo   Float?
  consumo         Float?
  tipoCombustible TipoCombustible
  estacion        String?
  notas           String?
  createdAt       DateTime  @default(now())

  vehiculo  Vehiculo  @relation(fields: [vehiculoId], references: [id])
  empleado  Empleado  @relation(fields: [empleadoId], references: [id])
}

enum TipoCombustible { NAFTA DIESEL GNC PREMIUM }
```

### Presupuestos

```prisma
model Cliente {
  id        String   @id @default(cuid())
  nombre    String
  cuit      String?
  direccion String?
  telefono  String?
  email     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  presupuestos Presupuesto[]
}

model ItemServicio {
  id             String   @id @default(cuid())
  codigo         String?
  descripcion    String
  precioUnitario Decimal  @db.Decimal(10, 2)
  unidad         String
  activo         Boolean  @default(true)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  lineas PresupuestoItem[]
}

model Presupuesto {
  id            String             @id @default(cuid())
  numero        Int                @unique @default(autoincrement())
  clienteId     String
  estado        EstadoPresupuesto  @default(BORRADOR)
  fechaEmision  DateTime           @default(now())
  validezDias   Int                @default(15)
  fechaVencimiento DateTime
  notas         String?
  subtotal      Decimal            @db.Decimal(12, 2)
  ivaPorcentaje Decimal            @db.Decimal(5, 2)
  ivaImporte    Decimal            @db.Decimal(12, 2)
  total         Decimal            @db.Decimal(12, 2)
  creadoPorId   String
  createdAt     DateTime           @default(now())
  updatedAt     DateTime           @updatedAt

  cliente    Cliente          @relation(fields: [clienteId], references: [id])
  creadoPor  Empleado         @relation(fields: [creadoPorId], references: [id])
  items      PresupuestoItem[]
}

model PresupuestoItem {
  id               String       @id @default(cuid())
  presupuestoId    String
  itemServicioId   String?
  descripcionCustom String?
  cantidad         Decimal      @db.Decimal(10, 2)
  precioUnitario   Decimal      @db.Decimal(10, 2)
  subtotal         Decimal      @db.Decimal(12, 2)
  orden            Int

  presupuesto Presupuesto  @relation(fields: [presupuestoId], references: [id], onDelete: Cascade)
  itemServicio ItemServicio? @relation(fields: [itemServicioId], references: [id])
}

model Impuesto {
  id         String   @id @default(cuid())
  nombre     String
  porcentaje Decimal  @db.Decimal(5, 2)
  activo     Boolean  @default(true)
  esDefault  Boolean  @default(false)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

enum EstadoPresupuesto { BORRADOR ENVIADO ACEPTADO RECHAZADO }
```

### Stock / Inventario

```prisma
model Almacen {
  id          String   @id @default(cuid())
  nombre      String
  ubicacion   String?
  encargadoId String?
  activo      Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  encargado  Empleado?        @relation(fields: [encargadoId], references: [id])
  stock      StockProducto[]
  movimientos MovimientoStock[]
}

model Producto {
  id           String        @id @default(cuid())
  codigo       String?       @unique
  nombre       String
  descripcion  String?
  categoria    CategoriaProducto
  unidad       String
  stockMinimo  Int           @default(0)
  esHerramienta Boolean      @default(false)
  activo       Boolean       @default(true)
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  stock        StockProducto[]
  movimientos  MovimientoStock[]
  asignaciones AsignacionHerramienta[]
}

model StockProducto {
  id         String   @id @default(cuid())
  almacenId  String
  productoId String
  cantidad   Int      @default(0)
  updatedAt  DateTime @updatedAt

  almacen  Almacen  @relation(fields: [almacenId], references: [id])
  producto Producto @relation(fields: [productoId], references: [id])

  @@unique([almacenId, productoId])
}

model MovimientoStock {
  id          String          @id @default(cuid())
  almacenId   String
  productoId  String
  empleadoId  String
  tipo        TipoMovimiento
  cantidad    Int
  motivo      String?
  referencia  String?
  fecha       DateTime        @default(now())
  createdAt   DateTime        @default(now())

  almacen  Almacen  @relation(fields: [almacenId], references: [id])
  producto Producto @relation(fields: [productoId], references: [id])
  empleado Empleado @relation(fields: [empleadoId], references: [id])
}

model AsignacionHerramienta {
  id          String    @id @default(cuid())
  productoId  String
  empleadoId  String
  cantidad    Int       @default(1)
  fechaAsignacion DateTime @default(now())
  fechaDevolucion DateTime?
  notas       String?

  producto Producto @relation(fields: [productoId], references: [id])
  empleado Empleado @relation(fields: [empleadoId], references: [id])
}

enum CategoriaProducto { RED FIBRA_OPTICA HERRAJE HERRAMIENTA MATERIAL_ELECTRICO CONSUMIBLE OTRO }
enum TipoMovimiento    { ENTRADA SALIDA AJUSTE TRANSFERENCIA }
```

---

## 6. RBAC — Permisos por Defecto

| Módulo        | DUENO | GERENTE | ADMIN | ADMINISTRATIVO | TECNICO |
|---------------|:-----:|:-------:|:-----:|:--------------:|:-------:|
| DASHBOARD     | ✓     | ✓       | ✓     | ✓              | ✓       |
| EMPLEADOS     | ✓     | ✓       | ✓     | ✗              | ✗       |
| FLOTA         | ✓     | ✓       | ✓     | ✓              | ✓       |
| COMBUSTIBLE   | ✓     | ✓       | ✓     | ✓              | ✓       |
| CUADRILLAS    | ✓     | ✓       | ✓     | ✓              | ✓       |
| PRESUPUESTOS  | ✓     | ✓       | ✓     | ✗              | ✗       |
| CLIENTES      | ✓     | ✓       | ✓     | ✓              | ✗       |
| ITEMS         | ✓     | ✓       | ✓     | ✓              | ✗       |
| STOCK         | ✓     | ✓       | ✓     | ✓              | ✓       |
| ADMIN         | ✓     | ✗       | ✓     | ✗              | ✗       |

> Los permisos son configurables desde el módulo Admin. Esta tabla define los valores del seed inicial.

---

## 7. Estilo de Código

- **TypeScript strict mode** — sin `any`, sin `@ts-ignore`
- **Zod** en toda frontera: server actions, API routes, formularios
- **Server Actions** para mutaciones; API routes solo para NextAuth
- **Patrón de respuesta uniforme:** `{ success: true, data } | { success: false, error: string }`
- **Módulos independientes:** cada módulo tiene su `actions.ts` sin importar de otros módulos directamente (usar `lib/` para utilidades compartidas)
- **Un schema Zod por entidad** en `lib/validations.ts`, reutilizado en cliente y servidor
- **Fechas:** guardar como ISO en DB, formatear con `date-fns` solo para display
- **Decimales monetarios:** `Decimal` de Prisma, no `Float`
- Sin comentarios obvios; solo comentar invariantes no evidentes

---

## 8. Estrategia de Testing

- **Unit (Vitest):** lógica de cálculos de presupuesto, helpers RBAC, schemas Zod
- **Integration (Vitest + test DB):** server actions contra DB real, no mocks de DB
- **E2E (Playwright):** flujo de login, crear presupuesto, registrar combustible, movimiento de stock
- Cobertura mínima en flujos críticos: auth, presupuestos, permisos

---

## 9. Límites del Proyecto

### Siempre hacer
- Validar con Zod antes de tocar la DB
- Verificar permisos en cada server action (además del middleware)
- Hash de contraseñas con bcrypt (mínimo 12 rounds)
- Retornar errores descriptivos en español (es la UI del usuario)
- El módulo de combustible es independiente del módulo de stock

### Preguntar primero
- Cambios en el schema que afecten migraciones de datos existentes
- Cambios en la tabla de permisos por defecto
- Agregar nuevos roles al enum `Rol`
- Integración con servicios externos (WhatsApp, email, facturación AFIP)

### Nunca hacer
- Guardar contraseñas en texto plano
- Saltear verificación de permisos con `// TODO`
- Usar `any` para escapar TypeScript
- Poner lógica de negocio en componentes React
- Duplicar validaciones — definir una vez en `lib/validations.ts`
- Combinar el módulo de combustible con el de stock

---

## 10. Fases de Desarrollo

### Fase 1 — Fundación (MVP)
1. Scaffolding del proyecto Next.js + Prisma + NextAuth
2. Schema completo en Prisma + seed inicial
3. Login + middleware de autenticación
4. ABM de Empleados + gestión de roles
5. Sistema RBAC (tabla de permisos + helper `checkPermission`)

### Fase 2 — Módulos Operativos
6. Módulo de Flota (vehículos)
7. Módulo de Combustible
8. Módulo de Cuadrillas (con empleados reales)

### Fase 3 — Módulos de Gestión
9. Módulo de Presupuestos (migrado de presupuestos-app)
10. ABM de Clientes e Items

### Fase 4 — Stock e Inventario
11. Catálogo de productos + categorías
12. Almacenes con encargado
13. Movimientos de stock (entrada/salida/ajuste)
14. Asignación de herramientas a empleados

### Fase 5 — Administración
15. Panel de administración (RBAC visual, config empresa)
16. Dashboard con métricas consolidadas
17. Tests E2E de flujos críticos
