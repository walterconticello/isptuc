# isp-manager — Especificación de feature: Módulo RED (FTTH/ONUs)

> Spec de **feature**, no reemplaza al `SPEC.md` del sistema.
> Estado: PROPUESTA — pendiente de confirmación antes de construir.
> Fecha: 2026-06-09

---

## 1. Objetivo

**¿Qué construimos?**
Un módulo nuevo **RED** dentro de isp-manager que:

1. **Lista las ONUs de la red FTTH** cruzadas con los contratos de WisPro, mostrando
   por cada una: cliente (nombre/contrato), IP, **potencia óptica (dBm)** con
   **semáforo de señal**, OLT/sucursal, puerto PON, estado y fecha de última lectura.
2. Permite **buscar** (por cliente/IP/usuario PPPoE), **ordenar por peor señal** y
   **filtrar** por OLT y estado; con **vista de detalle** por ONU/cliente.
3. **Registra y audita la configuración de equipos** hecha con la herramienta local
   `vsol-config`: qué cliente/ONU se configuró, con qué parámetros y **qué técnico**.

**¿Para quién?**
- **Técnicos:** ven potencias para diagnosticar/reparar; su trabajo de configuración queda registrado.
- **Dueño/Gerente/Admin:** visión de salud de la red y trazabilidad de quién configuró qué.

**Criterios de éxito (aceptación):**
- [ ] Un empleado con permiso al módulo RED ve la tabla de ONUs con potencia y semáforo.
- [ ] La tabla ordena por peor señal por defecto y permite buscar/filtrar por OLT y estado.
- [ ] Cada ONU se cruza con su contrato WisPro por `public_id` y muestra nombre/dirección/plan del cliente cuando existe.
- [ ] La sincronización desde la **fuente PANEL** (OLT El Mollar) puebla/actualiza las ONUs y queda auditada (`SYNC_ONUS`).
- [ ] El diseño soporta **N OLTs** con **fuentes enchufables** (PANEL hoy; SNMP/telnet a futuro) sin cambiar la tabla `Onu` ni la vista.
- [ ] `vsol-config` puede reportar una configuración y queda registrada con técnico, cliente, ONU y parámetros (`CONFIGURAR_ONU`).
- [ ] La migración Prisma queda **generada pero NO aplicada**.

---

## 2. Comandos

Sin comandos nuevos: usa los del sistema (`npm run dev | build | lint | typecheck | test`).
- Migración: `npm run db:migrate` la genera (se deja **sin aplicar** en el entregable; el merge la aplica el responsable).
- Sincronización de ONUs: vía botón en la UI (server action) — no hay CLI nueva.

---

## 3. Estructura (sigue las convenciones de `CLAUDE.md`)

```
prisma/schema.prisma           # + enum Modulo.RED ; modelos Olt, Onu, ContratoWispro, RegistroConfiguracion
prisma/seed-helpers.ts         # + RED en PERMISOS_DEFAULT (acceso por rol)
src/lib/audit.ts               # + acciones SYNC_ONUS, CONFIGURAR_ONU ; + módulo RED (label + color)
src/lib/validations.ts         # + schemas Zod del módulo (si aplica el patrón compartido)
src/modules/red/
  actions.ts                   # server actions: getOnus, getOnuById, sincronizarOnus, getResumenRed
  potencia.ts                  # PURO: clasificación de señal (semáforo) — testeable
  fuentes/
    tipos.ts                   # contrato de una "fuente" de datos de OLT (ingester)
    panel.ts                   # fuente PANEL: login + parseo de arrays.txt (El Mollar)
    parse-arrays.ts            # PURO: parser del JSON arrays.txt -> registros normalizados
  wispro/
    cliente.ts                 # cliente HTTP de la API WisPro (Authorization token)
    sync-contratos.ts          # refresca la cache local ContratoWispro
src/app/(dashboard)/red/
  page.tsx                     # listado (server component): tabla + buscador ?q= + filtros
  [id]/page.tsx                # detalle de una ONU/cliente
  _components/                 # tabla, fila, badge de semáforo, barra de sync (client components)
src/app/api/red/configuracion/route.ts   # endpoint para que vsol-config reporte (ver §6: excepción)
src/components/layout/...      # + ítem "Red" en el sidebar (grupo Operaciones)
tests/unit/red/                # parse-arrays.test.ts, potencia.test.ts, wispro-join.test.ts
.env.example                   # + variables (ver §6)
```

---

## 4. Modelo de datos (Prisma — migración generada, NO aplicada)

- **`Olt`**: `id`, `nombre`, `sucursal`, `ipGestion?`, `vendor?` (ej. "V-SOL"),
  `tipoFuente` (enum `FuenteOlt`: `PANEL | SNMP | TELNET`), `activa`, timestamps.
- **`Onu`**: `id`, `oltId`→Olt, `pon`, `idOnu`, `serial`, `ip?`, `potenciaDbm? Decimal(6,2)`,
  `estado?`, `vlan?`, `pppoeUser?`, `publicIdWispro? Int` (join), `leidoEn DateTime`,
  timestamps. Índices: `oltId`, `publicIdWispro`, `serial`.
- **`ContratoWispro`** (cache de la API): `publicId Int @unique`, `nombreCliente?`,
  `direccion?`, `plan?`, `estado?`, `ip?`, `pppoeUsername?`, `sincronizadoEn`. Evita
  pegarle a la API de WisPro en cada carga de página (3134 contratos, latencia/límites).
- **`RegistroConfiguracion`**: `id`, `empleadoId?`→Empleado, `tecnicoNombre?` (texto libre
  si no matchea empleado), `publicIdWispro? Int`, `serialOnu?`, `marca?`, `accion`
  (ej. "WIFI+WAN"), `parametros Json?`, `resultado` (OK/FALLO), `origen` ("vsol-config"),
  `createdAt`. (Complementa a `AuditLog`; permite consultar el historial por ONU/cliente.)

---

## 5. Estilo de código

Idéntico al del sistema (no se inventa nada nuevo):
- **Server actions** para toda lectura/mutación de negocio; respuesta `{ success: true, data } | { success: false, error }` con `as const`.
- **Guard** al inicio de cada action: `auth()` → `checkPermission(session.user.id, Modulo.RED)`.
- **Zod** en toda frontera; primer error como string en español.
- **`logAudit`** en sync y en registro de configuración.
- Prisma desde `@/generated/prisma/...`; alias `@/`; TypeScript strict (sin `any`).
- Todo el dominio y mensajes en **español**.
- **Lógica pura aislada y testeada** (`potencia.ts`, `parse-arrays.ts`): los ingesters/HTTP no se testean en unit.
- **UI** con shadcn/ui + **ui-ux-pro-max**, siguiendo el estilo de `MEJORAS_VISUALES.md`
  (avatar con iniciales por hash, semáforo con dot+halo, headers uppercase, buscador `?q=`,
  badges monoespaciados para IP/serial, orden "peor señal primero").

**Semáforo de señal (GPON, clase B+ ≈ -28 dBm):**
`Bien` (-8…-25) verde · `Justa` (-25…-28) ámbar · `Baja` (< -28) rojo · `Sin señal` (≤ -40 / sin lectura) rojo · `Muy alta` (> -8) ámbar.

---

## 6. Límites (boundaries)

**Siempre:**
- Respetar convenciones de `CLAUDE.md` (server actions, Zod, RBAC, audit, español).
- Migración Prisma **generada, sin aplicar**.
- Secretos en `.env` (+ documentarlos en `.env.example`), nunca en el repo:
  `WISPRO_API_URL`, `WISPRO_API_TOKEN`, `PANEL_MOLLAR_URL`, `PANEL_MOLLAR_USER`,
  `PANEL_MOLLAR_PASS`, `VSOL_REPORT_TOKEN`.
- Diseño multi-OLT y fuentes enchufables desde el día 1.

**Preguntar primero (decisiones abiertas — ver al pie):**
- Roles con acceso al módulo RED.
- Confirmar la cache local de contratos WisPro vs. consulta en vivo.
- Mecanismo de auth del endpoint que usa `vsol-config`.

**Nunca:**
- Tocar la lógica de NextAuth ni el cliente Prisma generado.
- Aplicar migraciones reales ni `git commit/push` sin tu confirmación.
- Exponer la web del server hacia la ONU del cliente (no es alcanzable; `vsol-config` sigue corriendo local y solo **reporta**).
- Pisar el `SPEC.md` del sistema.

---

## 7. Decisiones que necesito confirmes (defaults propuestos)

1. **Nombre del módulo:** `RED` (ruta `/red`, label "Red"). *Default: RED.*
2. **Acceso por rol (RBAC):** DUENO ✔, GERENTE ✔, ADMIN ✔, TECNICO ✔, ADMINISTRATIVO ✘. *Default propuesto.*
3. **Contratos WisPro:** **cache local** `ContratoWispro` refrescada por sync (recomendado), en vez de consultar la API en cada carga. *Default: cache.*
4. **Endpoint de `vsol-config`:** API route `/api/red/configuracion` (excepción justificada a "API solo para NextAuth", porque el cliente es una app de escritorio sin sesión de browser) protegido por **bearer token de servicio** (`VSOL_REPORT_TOKEN`) + el payload identifica al técnico (email). *Default propuesto.*
5. **Alcance del primer entregable:** fundación + **slice de referencia** (fuente PANEL El Mollar + listado + semáforo + sync + registro de config). Las otras 5 OLTs (SNMP/telnet) y export CSV quedan para tareas siguientes. *Default propuesto.*
