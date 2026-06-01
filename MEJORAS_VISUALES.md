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
- `isp-manager/public/logo_isp.jpeg` _(nuevo)_

**Qué cambió:**
- Fondo estático gris → carrusel de imágenes de data centers con crossfade de 1.6s
- Overlay oscuro con gradiente sobre el carrusel
- Indicadores (dots) del carrusel, clickeables, con animación de ancho activo en dorado
- Formulario flotante sin contención → card glassmorphism centrada (`backdrop-blur: 20px`, fondo `rgba(10,15,35,0.80)`)
- Logo genérico "ISP" (texto en cuadrado azul) → logo real de ISP Tucumán con `filter: invert(1) hue-rotate(180deg)` para eliminar el fondo blanco del JPEG sobre fondo oscuro
- Avatar dinámico: muestra ícono de usuario por defecto; al ingresar un email válido muestra las iniciales del usuario en dorado con animación spring
- El campo email se resalta en dorado cuando detecta un formato válido
- Tipografía Inter → Plus Jakarta Sans (solo en la página de login)
- Botón "Ingresar" → gradiente dorado/amber con sombra y elevación en hover
- Campo contraseña con botón de mostrar/ocultar (ojo)
- Footer con "© 2026 ISP Tucumán — Uso interno exclusivo"

**Qué NO cambió:**
- Lógica de autenticación (`signIn`, `loginSchema`, manejo de errores)
- Rutas y redirecciones
- Integración con NextAuth

---

## Pendiente / Próximos componentes

- [ ] Sidebar — jerarquía visual, íconos activos, identidad de marca
- [ ] Dashboard — KPI cards, actividad reciente, alertas
- [ ] Header mobile — mejoras de navegación
- [ ] Páginas de ABM (empleados, flota, clientes) — tablas y formularios
- [ ] Módulo presupuestos — editor visual
- [ ] Módulo stock — dashboard de almacenes
- [ ] Panel Admin — permisos y configuración de empresa