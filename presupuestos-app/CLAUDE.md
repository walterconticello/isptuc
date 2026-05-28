# Presupuestos App — Agent Rules

This project uses the full [agent-skills](../agent-skills) methodology.
Skills live at `C:\SOFT\agent-skills\skills\`. Load and apply them at every phase.

---

## Identity

You are the agent defined by the agent-skills pack. You must:
- Apply the correct skill for every phase of work (see Lifecycle below)
- Never write code without a spec
- Never skip verification steps
- Surface assumptions before implementing
- Stop and ask when confused — never silently guess

---

## Tech Stack

- **Framework:** Next.js 14 (App Router) + TypeScript 5
- **Database:** PostgreSQL 16 via Prisma ORM
- **UI:** Tailwind CSS + shadcn/ui
- **PDF:** react-to-print + jsPDF
- **Auth:** NextAuth.js (credentials provider)
- **Containerization:** Docker + Docker Compose
- **Testing:** Vitest (unit/integration) + Playwright (E2E)
- **Validation:** Zod (all API boundaries)

---

## Commands

```bash
docker compose up -d          # Start all services (app + db)
docker compose down           # Stop all services
npm run dev                   # Dev server (inside container or local)
npm run build                 # Production build
npm test                      # Run unit + integration tests (Vitest)
npm run test:e2e              # Run E2E tests (Playwright)
npm run lint                  # ESLint
npm run lint:fix              # ESLint --fix
npx tsc --noEmit              # Type check
npx prisma migrate dev        # Run DB migrations (dev)
npx prisma migrate deploy     # Run DB migrations (prod)
npx prisma studio             # DB GUI
npm run db:seed               # Seed initial data
```

---

## Project Structure

```
presupuestos-app/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── (auth)/login/           # Login page
│   │   ├── (dashboard)/            # Protected routes
│   │   │   ├── page.tsx            # Dashboard: tabla de presupuestos
│   │   │   ├── presupuestos/       # New/edit budget (WYSIWYG view)
│   │   │   ├── clientes/           # ABM Clientes
│   │   │   └── items/              # ABM Items/Servicios
│   │   └── api/                    # API Routes (Next.js)
│   │       ├── auth/               # NextAuth endpoints
│   │       ├── presupuestos/       # CRUD presupuestos
│   │       ├── clientes/           # CRUD clientes
│   │       └── items/              # CRUD items
│   ├── components/
│   │   ├── ui/                     # shadcn/ui base components
│   │   ├── presupuesto/            # Budget WYSIWYG + PDF components
│   │   ├── cliente/                # Client autocomplete + form
│   │   └── item/                   # Item autocomplete + form
│   ├── lib/
│   │   ├── db.ts                   # Prisma client singleton
│   │   ├── auth.ts                 # NextAuth config
│   │   ├── validations.ts          # Zod schemas
│   │   └── pdf.ts                  # PDF generation utils
│   └── types/
│       └── index.ts                # Shared TypeScript types
├── prisma/
│   ├── schema.prisma               # DB schema
│   └── migrations/                 # Auto-generated migrations
├── tests/
│   ├── unit/                       # Pure logic tests
│   └── integration/                # API + DB tests
├── e2e/                            # Playwright E2E tests
├── docs/
│   ├── decisions/                  # ADRs (ADR-001, ADR-002, ...)
│   └── ideas/                      # Idea one-pagers
├── public/
│   └── logo/                       # Company logo assets
├── docker-compose.yml
├── Dockerfile
├── .env.example
├── CLAUDE.md                       # This file
└── SPEC.md                         # Living specification
```

---

## Code Conventions

Named exports only (no default exports):
```tsx
// Good
export function PresupuestoCard({ presupuesto }: Props) { ... }

// Bad
export default function PresupuestoCard({ presupuesto }: Props) { ... }
```

Colocate tests with source:
```
ClienteAutocomplete.tsx  →  ClienteAutocomplete.test.tsx
```

Use `cn()` for conditional classNames. Validate at API boundaries with Zod.
Components max 200 lines — split if larger.
Functional components + hooks only (no class components).

---

## Skill Lifecycle (apply in order)

```
1.  interview-me                → Extract real requirements (done ✓)
2.  spec-driven-development     → Write SPEC.md before any code
3.  planning-and-task-breakdown → Task list with acceptance criteria
4.  context-engineering         → Load right files per task
5.  source-driven-development   → Verify framework patterns vs official docs
6.  incremental-implementation  → One vertical slice at a time
7.  doubt-driven-development    → Cross-examine non-trivial decisions
8.  test-driven-development     → RED → GREEN → REFACTOR
9.  frontend-ui-engineering     → WCAG 2.1 AA, no AI aesthetic
10. api-and-interface-design    → Contract-first, Zod at boundaries
11. security-and-hardening      → OWASP Top 10, bcrypt, helmet, rate-limit
12. performance-optimization    → Measure first, N+1 check, pagination
13. code-review-and-quality     → 5-axis review before merge
14. code-simplification         → Chesterton's Fence, Rule of 500
15. debugging-and-error-recovery → Stop-the-line, reproduce first
16. browser-testing-with-devtools → Screenshot verify, clean console
17. git-workflow-and-versioning  → Atomic commits, feat/fix/chore
18. ci-cd-and-automation         → Quality gates on every change
19. documentation-and-adrs       → ADR for every architectural decision
20. shipping-and-launch          → Pre-launch checklist + rollback plan
```

Skill reference files: `C:\SOFT\agent-skills\skills\<skill-name>\SKILL.md`
Reference checklists: `C:\SOFT\agent-skills\references\`
Agent personas: `C:\SOFT\agent-skills\agents\`

---

## Boundaries

**Always:**
- Write SPEC.md section before implementing any feature
- Validate all user input with Zod at API routes
- Parameterize all DB queries (Prisma handles this)
- Run `npm test` before committing
- Atomic commits with type prefix (feat/fix/refactor/test/chore)
- Security headers via `next.config.ts` (helmet equivalent)
- Write ADR for every architectural decision

**Ask first:**
- Adding new npm dependencies
- Changing Prisma schema (migrations are irreversible)
- Modifying auth flow
- Changing Docker config

**Never:**
- Commit `.env` or secrets
- Expose stack traces to users
- Use `innerHTML` with user input
- Skip verification steps
- Start implementing without a spec section
- Store passwords in plaintext

---

## Success Criteria (from spec)

- [ ] Login/logout funciona
- [ ] Dashboard muestra tabla de presupuestos con estado (borrador/enviado/aceptado)
- [ ] Nuevo presupuesto abre vista WYSIWYG del documento
- [ ] Campo cliente: autocomplete con creación inline si no existe
- [ ] Campo items: autocomplete con creación inline si no existe
- [ ] Totales calculados automáticamente
- [ ] Validez configurable: 10, 15, 30 días
- [ ] Logo y CUIT de la empresa en el encabezado
- [ ] Export a PDF + impresión
- [ ] ABM completo de Clientes
- [ ] ABM completo de Items/Servicios
- [ ] Presupuestos guardados y editables
- [ ] Docker Compose levanta todo con un comando
- [ ] Portable a servidor propio (variables de entorno)
