# PENDIENTE — Reconstruir Presupuestos al estilo WYSIWYG

> Handoff para la próxima sesión. Tarea acordada, decisiones tomadas, todo listo para construir.
> Proyecto: `C:\ISP Tuc\isp-manager` (Next 16 + Prisma 7 + NextAuth v5 + Tailwind v4).
> Metodología: server actions, patrón `{ success, data } | { success, error }`, Zod en fronteras,
> `checkPermission` al inicio, errores en español, sin `any`. TDD + commits atómicos.

## Objetivo

Reemplazar el formulario actual de presupuestos por un **editor WYSIWYG**: el documento ES la
pantalla (como una factura/presupuesto imprimible). A medida que se agregan ítems, se ven en vivo
dentro del documento, con encabezado de empresa + logo y botón Imprimir/PDF.

## Referencia (copiar el estilo, NO el código tal cual)

Demo que le gustó al usuario:
`C:\SOFT\presupuestos-app\src\components\presupuesto\PresupuestoEditor.tsx`
(usa API routes + `ClienteAutocomplete` + `ItemLineAutocomplete` + estilos `print:`).
Encabezado con logo/empresa, "PRESUPUESTO N°", fecha/validez, ítems inline, totales, `window.print()`.

**Importante:** la demo usa API routes; el isp-manager usa **server actions**. Reusar la action existente,
NO copiar las API routes.

## Decisiones ya tomadas por el usuario

1. **Layout**: WYSIWYG estilo demo (logo + datos de empresa arriba, ítems inline en vivo, totales, Imprimir/PDF).
2. **Auto-ajuste de tamaño de letra de los ítems**: nivel **medio, mínimo 11px**.
   - Empezar ~15px y achicar gradualmente según cantidad de ítems, con **piso 11px** (nunca menos).
   - Fórmula sugerida (ajustar a gusto):
     ```ts
     const itemFontPx = Math.max(11, 15 - Math.max(0, lineas.length - 8) * 0.45);
     // 15px hasta 8 ítems; baja 0.45px por ítem extra; toca 11px ~ítem 17.
     ```
   - Aplicar al bloque de ítems con `style={{ fontSize: \`${itemFontPx}px\` }}`.
3. **Alcance**: también pasar la **vista `[id]`** al mismo estilo WYSIWYG.

## El modelo de datos YA encaja (no hace falta migración)

- `Empresa` tiene `nombre, cuit, direccion?, telefono?, email?, logoUrl?` → ya hay config en `/admin/empresa`.
- `Cliente`, `ItemServicio (codigo?, descripcion, precioUnitario, unidad)`.
- `Presupuesto`: numero, estado, validezDias, fechaVencimiento, notas, subtotal, ivaPorcentaje, ivaImporte, total.
- `PresupuestoItem`: itemServicioId?, descripcionCustom?, cantidad, precioUnitario, subtotal, orden.
- `Impuesto` para opciones de IVA.

## Archivos a tocar

- **`src/app/(dashboard)/presupuestos/nuevo/page.tsx`** (server):
  ya carga `clientes`, `items`, `impuesto default`. **Agregar** `db.empresa.findFirst(...)` y pasarla como prop `empresa`.
- **`src/app/(dashboard)/presupuestos/_components/presupuesto-editor.tsx`** (client):
  rediseñar a WYSIWYG. Hoy recibe `{ clientes, items, ivaPorcentajeDefault }` y llama
  `createPresupuesto`. **Agregar** prop `empresa` y el bloque-documento (logo/encabezado/totales/print).
  Mantener el payload que ya arma para `createPresupuesto` (clienteId, validezDias, ivaPorcentaje, notas,
  items[{ itemServicioId, descripcionCustom, cantidad, precioUnitario, orden }]).
- **`src/app/(dashboard)/presupuestos/[id]/page.tsx`** (vista): pasar al mismo documento WYSIWYG
  (modo lectura/print). Reusar el componente del documento o extraer uno compartido (`presupuesto-doc.tsx`).

## Acciones disponibles (`src/modules/presupuestos/actions.ts`)

- `createPresupuesto(rawData)` · `getPresupuestoById(id)` · `cambiarEstado(id, estado)` · `getPresupuestos()`

## Print / PDF

- Botón con `onClick={() => window.print()}`.
- Ocultar controles al imprimir con la variante `print:hidden`; el documento en `print:` debe quedar
  limpio (sin borde/sombra). El documento puede usar fondo blanco/tinta oscura fija (la demo lo hace)
  para que el PDF se vea bien en cualquier tema.

## Verificación (antes de commitear)

1. `npm run typecheck` · `npm test -- --run` (49 unit) · `npm run build`.
2. e2e: `npx playwright test` (necesita `docker-compose up -d` y dev server; login admin@isp.local / admin123).
   - El spec `tests/e2e/sistema.spec.ts` ya recorre `/presupuestos/nuevo`. Conviene agregar un test:
     agregar ítems → el total se actualiza en vivo; y que el encabezado muestre el nombre de empresa.
3. Screenshot del editor con varios ítems para confirmar el auto-ajuste de letra (piso 11px) y el print layout.

## Estado del repo al cerrar la sesión anterior

Rama `feat/fase-1-scaffolding`. Combustible, revisión del sistema, tipos de vehículo, selector de color,
responsive y pulido tipográfico (golden ratio) ya están commiteados y verificados. Ver `MEMORY.md`.
Esto (presupuestos WYSIWYG) es lo único pendiente acordado.
