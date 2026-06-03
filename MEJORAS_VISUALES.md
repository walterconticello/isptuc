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
**Archivos:** `login/page.tsx` · `globals.css` · `public/logo_isp_v2.png`

- Carrusel de 4 imágenes de data centers con crossfade 1.6s + dots navegables
- Card glassmorphism centrada (`backdrop-blur: 20px`)
- Logo real ISP Tucumán con `filter: invert(1) hue-rotate(180deg)`
- Avatar dinámico: iniciales en dorado al detectar email válido
- Toggle mostrar/ocultar contraseña
- Botón "INGRESAR" con gradiente dorado, sombra y elevación en hover
- Tipografía Plus Jakarta Sans

---

### 2. Sidebar + Header mobile — Rediseño dark
**Fecha:** 2026-06-02
**Archivos:** `layout.tsx` · `sidebar-content.tsx` · `header.tsx` · `public/logo_isp_v2.png`

- Fondo `#0f172a` oscuro permanente
- Logo real con filtro CSS
- Módulos agrupados: General / Operaciones / Gestión comercial / Sistema
- Ítem activo: barra indigo lateral (3px) + fondo sutil
- Footer: avatar con iniciales + gradiente indigo + logout
- Header mobile: logo real centrado, drawer oscuro con botón X

---

### 3. Dashboard — KPI cards renovadas
**Fecha:** 2026-06-02
**Archivos:** `dashboard/page.tsx`

- Color único por módulo + borde superior 3px por card
- Mini sparklines (7 barras) en cards principales
- Trend pills con ícono y porcentaje
- Alertas: banners de ancho completo con subtítulo
- Actividad: tags de color + actor + tiempo con separadores

---

### 4. Empleados — Tabla renovada
**Fecha:** 2026-06-03
**Archivos:** `empleados/page.tsx`

- Avatar con iniciales + gradiente de color por rol
- Nombre + email en una celda con avatar (de 5 a 4 columnas)
- Buscador funcional via `?q=` por nombre/email
- Headers en uppercase con tracking
- Acciones como botones icono (ojo + lápiz)
- Estado con dot de color + halo
- Filas inactivas con `opacity-60`
- Breadcrumb + contadores en el header

---

### 5. Flota — Tabla renovada
**Fecha:** 2026-06-03
**Archivos:** `flota/page.tsx`

- Ícono SVG por tipo de vehículo (Car/Truck/Bike) con fondo ámbar
- Patente como badge monoespaciado destacado
- De 7 a 5 columnas (vehículo + patente + tipo unificados)
- Estado con dot de color + halo (verde/ámbar/rojo)
- Odómetro con barra de progreso relativa al máximo de la flota
  - < 50%: ámbar · 50-80%: naranja · > 80%: rojo
- Cuadrilla como tag con color primario
- Buscador funcional via `?q=` por patente/marca/modelo
- Inactivos opacity 50%, en mantenimiento opacity 70%
- Acciones como botones icono (ojo + lápiz)

---

### 6. Clientes — Tabla renovada
**Fecha:** 2026-06-03
**Archivos:** `clientes/page.tsx`

- Avatar circular con iniciales de las primeras 2 palabras del nombre
- Color del avatar generado por hash del nombre (7 paletas rotativas)
- De 5 a 4 columnas (teléfono + email consolidados en "Contacto")
- CUIT en columna propia en monoespaciado
- Datos faltantes en gris muy suave en lugar de "—" invasivo
- Buscador funcional via `?q=` por nombre/CUIT/email
- Dos acciones: Ver presupuestos (FileText) + Editar (Pencil)
- Breadcrumb "Gestión comercial › Clientes"

---

## Pendiente

- [ ] Formularios — inputs, selects, validación visual
- [ ] Módulo presupuestos — editor visual
- [ ] Módulo stock — dashboard de almacenes
- [ ] Panel Admin — permisos y configuración de empresa