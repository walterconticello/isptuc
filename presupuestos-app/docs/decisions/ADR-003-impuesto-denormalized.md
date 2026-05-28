# ADR-003: IVA almacenado como porcentaje numérico en Presupuesto (no FK a Impuesto)

**Date:** 2026-05-27  
**Status:** Accepted

## Context

Al agregar la entidad `Impuesto` (ABM configurable de tasas de impuestos), surgió la pregunta de cómo vincular el impuesto elegido a un `Presupuesto`. Dos opciones:

1. **FK a Impuesto** (`presupuesto.impuestoId → impuesto.id`): el presupuesto referencia el registro de impuesto.
2. **Denormalizado numérico** (`presupuesto.ivaPorcentaje: Decimal`): el presupuesto guarda el porcentaje como número en el momento de emisión.

## Decision

**Opción 2 — porcentaje numérico denormalizado.**

`Presupuesto.ivaPorcentaje` es un campo `Decimal` que almacena el valor porcentual (ej. `21.00`) en el momento de guardar el presupuesto.

## Rationale

Un presupuesto es un **documento histórico con valor legal/comercial**. Si el usuario cambia la tasa de "IVA 21%" a 22% en el futuro, todos los presupuestos emitidos bajo el 21% deben seguir mostrando 21%. Con FK, un `UPDATE` al registro de `Impuesto` alteraría retroactivamente el cálculo de documentos ya emitidos.

La denormalización es la solución estándar para documentos financieros (facturas, órdenes de compra, presupuestos): se congela el valor en el momento de emisión.

## Consequences

- **Positivo:** Integridad histórica garantizada. Cambiar una tasa no altera presupuestos pasados.
- **Positivo:** El `PresupuestoEditor` muestra el dropdown dinámico de impuestos activos, pero al guardar solo persiste el número, no la referencia.
- **Negativo:** No hay trazabilidad directa de "qué impuesto se usó" (solo el porcentaje). Aceptable para el caso de uso ISP.
- **Negativo menor:** Si se quiere filtrar presupuestos "con IVA 21%", se filtra por `ivaPorcentaje = 21` igualmente.
