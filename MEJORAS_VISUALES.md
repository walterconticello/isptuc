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
- Formulario flotante sin contención → card glassmorphism centrada (`backdrop-blur: 20px`, fondo `rgba(10,15,35,0.80)`)
- Logo genérico "ISP" → logo real ISP Tucumán (`logo_isp_v2.png`) con `filter: invert(1) hue-rotate(180deg)` para eliminar fondo blanco sobre oscuro
- Avatar dinámico: ícono de usuario por defecto → iniciales del usuario en dorado al detectar email válido
- Campo email se resalta en dorado cuando el formato es válido
- Tipografía Inter → Plus Jakarta Sans
- Botón "INGRESAR" con gradiente dorado/amber, sombra y elevación en hover
- Campo contraseña con toggle mostrar/ocultar (ojo)
- Footer con "© 2026 ISP Tucumán — Uso interno exclusivo"
- Import de Plus Jakarta Sans agregado a `globals.css`

**Qué NO cambió:**
- Lógica de autenticación (`signIn`, `loginSchema`, manejo de errores)
- Rutas y redirecciones
- Integración con NextAuth

---

### 2. Sidebar — Rediseño dark + logo real + módulos agrupados
**Fecha:** 2026-06-02
**Archivos modificados:**
- `isp-manager/src/app/(dashboard)/layout.tsx`
- `isp-manager/src/components/layout/sidebar-content.tsx`
- `isp-manager/src/components/layout/header.tsx`
- `isp-manager/public/logo_isp_v2.png` _(reemplaza logo_isp.jpeg)_

**Qué cambió:**
- Fondo del sidebar: blanco genérico → `#0f172a` oscuro permanente (coherente con el login)
- Logo: cuadrado azul "ISP" → logo real ISP Tucumán con filtro CSS
- Módulos agrupados en 4 categorías: **General / Operaciones / Gestión comercial / Sistema**
- Ítem activo: fondo azul sólido → barra indigo lateral (3px) + fondo sutil `bg-primary/15` + texto `text-indigo-300`
- Íconos inactivos en `text-white/30`, activos en `text-indigo-400`
- Footer de usuario: nombre + rol plano → avatar con iniciales generadas del nombre real + gradiente indigo + botón logout
- Header mobile: texto "ISP Manager" → logo real centrado, fondo oscuro `#0f172a`
- Drawer mobile: mismo estilo oscuro, avatar en footer, botón X para cerrar (ícono `X` de Lucide)

**Qué NO cambió:**
- Sistema de permisos RBAC (los módulos siguen filtrándose por rol)
- Lógica de autenticación y signOut
- ThemeSelector (se conserva)

---

### 3. Dashboard — KPI cards renovadas + alertas + actividad
**Fecha:** 2026-06-02
**Archivos modificados:**
- `isp-manager/src/app/(dashboard)/dashboard/page.tsx`

**Qué cambió:**
- **KPI cards:** color único por módulo con borde superior de 3px e ícono con fondo coloreado
  - Empleados → azul | Flota → ámbar | Combustible → naranja | Presupuestos → verde
  - Cuadrillas → violeta | Stock → rojo | Herramientas → indigo
- **Mini sparklines:** 7 barras de tendencia en las 4 cards principales — la última barra opaca al 80%, las anteriores al 20%
- **Trend pills:** badge pequeño con ícono y porcentaje (rojo si subió el gasto, verde si bajó, ámbar si hay advertencia)
- **Hover con elevación:** cards suben 2px con `hover:-translate-y-0.5` y sombra suave
- **Alertas en banner:** ancho completo con título + subtítulo descriptivo + flecha de navegación (reemplaza las pills pequeñas)
- **Actividad reciente:** tags de color por tipo (combustible/presupuesto/stock) + actor + tiempo separados por puntos · enlace "Ver todo →"
- Label de KPI en mayúsculas con `uppercase tracking-wide` para estilo más profesional
- Valor principal más grande: `text-3xl font-bold` en cards principales

**Qué NO cambió:**
- Lógica de `getDashboardData()` y sus server actions
- Estructura de datos (empleados, vehiculos, cuadrillas, combustible, presupuestos, stockBajoCount, etc.)
- Autenticación y redirección

---

## Pendiente

- [ ] Tablas generales — empleados, flota, clientes (estilos consistentes)
- [ ] Formularios — inputs, selects, validación visual
- [ ] Módulo presupuestos — editor visual
- [ ] Módulo stock — dashboard de almacenes
- [ ] Panel Admin — permisos y configuración de empresa