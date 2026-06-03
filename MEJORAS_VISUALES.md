# Mejoras Visuales — Rama `mockup_v2`

> Registro de cambios visuales aplicados sobre la rama `mockup_v2`.
> Solo se modifican aspectos de diseño/UI. La lógica de negocio, validaciones y server actions no se tocan.

---

## Convención de trabajo

Antes de cada cambio se genera un mockup HTML comparativo (estado actual vs. propuesta) para aprobación. Recién al confirmar se implementa en el repo.

---

## Cambios aplicados

### 1. Login — Rediseño completo
**Fecha:** 2026-06-01
**Archivos modificados:**
- `isp-manager/src/app/(auth)/login/page.tsx`
- `isp-manager/src/app/globals.css`
- `isp-manager/public/logo_isp_v2.png` _(nuevo)_

**Qué cambió:**
- Fondo estático gris → carrusel de 4 imágenes de data centers con crossfade 1.6s + dots navegables
- Overlay oscuro con gradiente sobre el carrusel
- Formulario flotante → card glassmorphism centrada (`backdrop-blur: 20px`, fondo `rgba(10,15,35,0.80)`)
- Logo genérico → logo real ISP Tucumán con `filter: invert(1) hue-rotate(180deg)` para eliminar fondo blanco
- Avatar dinámico: ícono por defecto → iniciales en dorado al detectar email válido
- Campo email se resalta en dorado con formato válido
- Tipografía Inter → Plus Jakarta Sans
- Botón "INGRESAR" con gradiente dorado/amber, sombra y elevación en hover
- Campo contraseña con toggle mostrar/ocultar
- Footer "© 2026 ISP Tucumán — Uso interno exclusivo"
- Plus Jakarta Sans agregado a `globals.css`

---

### 2. Sidebar — Rediseño dark + logo real + módulos agrupados
**Fecha:** 2026-06-02
**Archivos modificados:**
- `isp-manager/src/app/(dashboard)/layout.tsx`
- `isp-manager/src/components/layout/sidebar-content.tsx`
- `isp-manager/src/components/layout/header.tsx`
- `isp-manager/public/logo_isp_v2.png` _(reemplaza logo_isp.jpeg)_

**Qué cambió:**
- Fondo del sidebar: blanco genérico → `#0f172a` oscuro permanente
- Logo: cuadrado azul "ISP" → logo real con filtro CSS
- Módulos agrupados en 4 categorías: General / Operaciones / Gestión comercial / Sistema
- Ítem activo: fondo sólido → barra indigo lateral (3px) + fondo sutil + texto `text-indigo-300`
- Footer: nombre+rol plano → avatar con iniciales + gradiente indigo + botón logout
- Header mobile: texto "ISP Manager" → logo real centrado, fondo oscuro
- Drawer mobile: mismo estilo oscuro, avatar en footer, botón X para cerrar

---

### 3. Dashboard — KPI cards renovadas + alertas + actividad
**Fecha:** 2026-06-02
**Archivos modificados:**
- `isp-manager/src/app/(dashboard)/dashboard/page.tsx`

**Qué cambió:**
- KPI cards con color único por módulo + borde superior 3px colorido + ícono con fondo coloreado
- Mini sparklines (7 barras) en las 4 cards principales
- Trend pills con ícono y porcentaje
- Hover con elevación `hover:-translate-y-0.5` + sombra
- Alertas: pills pequeñas → banners de ancho completo con subtítulo y flecha
- Actividad: tags de color por tipo + actor + tiempo con separadores · + enlace "Ver todo →"
- Label de KPI en uppercase con tracking para mayor jerarquía

---

### 4. Empleados — Tabla renovada
**Fecha:** 2026-06-03
**Archivos modificados:**
- `isp-manager/src/app/(dashboard)/empleados/page.tsx`

**Qué cambió:**
- Avatar con iniciales generadas de apellido+nombre, gradiente de color por rol (violeta/azul/naranja/verde/slate)
- Columnas Nombre + Email unificadas en una sola celda con avatar — de 5 a 4 columnas
- Buscador funcional por nombre/email via URL searchParam `?q=`
- Headers de tabla en uppercase con letter-spacing — jerarquía visual clara
- Acciones "Ver" / "Editar" (links de texto) → botones icono 32px con hover indigo
- Estado: badge pill → dot de color con halo + texto (verde/rojo)
- Filas de empleados inactivos con `opacity-60` — distinguibles sin eliminarlos
- Header de página con breadcrumb "Operaciones › Empleados" y contadores (total · activos · inactivos)
- Botón "Nuevo empleado" con `rounded-xl`, sombra y elevación en hover
- Mobile cards actualizadas con avatar + mismo sistema de botones icono

---

## Pendiente

- [ ] Flota — tabla con mismo sistema visual que empleados
- [ ] Clientes — tabla consistente
- [ ] Formularios — inputs, selects, validación visual
- [ ] Módulo presupuestos — editor visual
- [ ] Módulo stock — dashboard de almacenes
- [ ] Panel Admin — permisos y configuración de empresa