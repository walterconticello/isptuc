# ADR-002: NextAuth.js con Credentials Provider

## Status
Accepted

## Date
2026-05-26

## Context
Solo 2 usuarios internos (admin + dueño). No necesitamos OAuth social ni registro público.

## Decision
NextAuth.js v5 con CredentialsProvider. Passwords hasheados con bcrypt (12 rounds).
Sesión via JWT httpOnly cookie.

## Alternatives Considered

### OAuth (Google/GitHub)
- Pros: Sin manejo de passwords
- Cons: Dependencia externa, innecesario para uso interno
- Rejected: Overkill para 2 usuarios internos

### JWT manual sin NextAuth
- Pros: Menos dependencias
- Cons: Reimplementar refresh tokens, sesiones, CSRF — propenso a errores de seguridad
- Rejected: NextAuth ya resuelve todo esto correctamente

## Consequences
- bcrypt 12 rounds en registro/login
- Cookies httpOnly + secure + sameSite=lax
- Rate limiting en /api/auth/signin (10 req/15min)
- Middleware de auth protege todas las rutas /(dashboard)
