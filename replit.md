# MediMATCH

MediMATCH is a connected-care website where patients book appointments with care teams, and clinic staff, partners and the CEO each use their own workspace.

## Run & Operate

- `pnpm --filter @workspace/medimatch run dev` — run the web app (workflow `artifacts/medimatch: web`, served at `/`)
- `pnpm --filter @workspace/api-server run dev` — run the API server (workflow `artifacts/api-server: API Server`, served at `/api`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL`, Clerk keys (`CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`, `VITE_CLERK_PUBLISHABLE_KEY`), `MEDIMATCH_ADMIN_EMAIL` (shared env var: the email that becomes the first admin)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Web: React + Vite, wouter, TanStack Query, Clerk (`@clerk/react`)
- API: Express 5 with `@clerk/express`
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)

## Where things live

- `artifacts/medimatch/design-reference/` — the user's original uploaded app (App.tsx, index.css, pages). Treat it as the design source of truth.
- `artifacts/medimatch/src/App.tsx` — routes and Clerk setup; pages in `src/pages/`
- `artifacts/medimatch/src/styles/medimatch.css` — the original styles; `additions.css` — new styles, imported after it
- Public homepage: `src/pages/HomePage.tsx` + `src/components/home/`, styled only by `src/styles/home.css` (every rule scoped under `.mmh`, so other pages are unaffected); photos are WebP in `public/medimatch/home/`
- `artifacts/medimatch/src/lib/treatments.ts` — the treatment list shared by the homepage links and the booking page select
- `artifacts/medimatch/src/lib/account.ts` — signed-in account state and role → workspace mapping
- `lib/api-spec/openapi.yaml` — API contract; `lib/db/src/schema/medimatch.ts` — DB schema
- `artifacts/api-server/src/routes/medimatch.ts` — all MediMATCH API routes and permission checks

## Architecture decisions

- Roles (patient, clinic, partner, admin) are assigned only on the server. New sign-ins become patients; the account whose verified email matches `MEDIMATCH_ADMIN_EMAIL` becomes admin; admins assign every other role and cannot change their own.
- The Clerk session token here carries only the user id, so the API reads name and email from the Clerk Backend API when it first creates an account, then refreshes them at most hourly from `/api/auth/me`.
- Booking slots are generated in the browser (30 minutes, weekdays 09:00–17:00 UTC). The database enforces one active booking per provider and time through a partial unique index, and the API returns 409 when a slot is taken.
- Clerk is cookie-based (no bearer tokens) and styled through `appearance` in `App.tsx`, never through `.cl-*` CSS selectors.
- There is no live provider search. The homepage care search opens `/appointments?treatment=&destination=&language=`; the booking page preselects the treatment and puts destination and language in the coordinator notes.

## Product

- Public homepage, appointment booking page, and a sign-in page with workspace chooser
- Patient portal (`/account`): own requests and upcoming appointments, with cancel
- Clinic workspace (`/employee`), partner workspace (`/partner`, no patient data), CEO workspace (`/ceo`) with team access management, and a staff care desk (`/care-dashboard`) for status changes
- Not connected yet: consultation notes, email/SMS reminders, payments. "Recommend for me" opens an email to the care desk.

## User preferences

- Build on the user's existing MediMATCH design and copy; do not replace it with new designs or placeholder data.
- Never put the admin email in client code, docs, or memory.

## Gotchas

- `drizzle-kit push` does not compare the `WHERE` clause of partial indexes. If `medimatch_provider_slot_uq` is ever recreated, check it in `pg_indexes`.
- The three starter providers are care teams seeded in the dev database, not real named doctors.
- Clinics and providers exist only as data (there is no admin screen to add them). Publish copies the database structure, not rows, so the live site has no providers unless the first publish uses "Set up your production database with your current development data".

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
