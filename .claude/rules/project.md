# Chuolink Admin Project Rules

## Tech Stack
- Next.js 16 with App Router and Turbopack
- React 19, TypeScript strict mode
- Tailwind CSS v4 with OKLCH color space
- shadcn/ui "new-york" style, "slate" base color, lucide icons
- bun as package manager
- NextAuth v4 + Keycloak for authentication

## API Layer
- OpenAPI types generated from backend: `bun run generate`
- Types output: `src/lib/api/schema.d.ts`
- Use `openapi-fetch` with `openapi-react-query` for typed API calls
- Axios instances for legacy endpoints: `src/lib/axios/`
- Backend URL: `NEXT_PUBLIC_BACKEND_URL` env var
- **To regenerate types**: backend must be running at `http://127.0.0.1:8000`, then run `bun run generate`

## Backend
- Location: `/Users/mac/Projects/collab/chuolink/backend_new`
- Start backend: `cd /Users/mac/Projects/collab/chuolink/backend_new && python manage.py runserver`
- OpenAPI schema: `http://127.0.0.1:8000/api/v1/schema/`
- After adding new backend models/endpoints, run `bun run generate` to update frontend types

## Auth & Roles
- NextAuth v4 with Keycloak provider
- Session includes `backendTokens.accessToken` and `roles[]`
- Permission groups: admin, consultant, manager, content
- Admin routes: `/admin/*` — requires admin role
- Consultant routes: `/consultant/*` — requires consultant role
- Auth redirect: unauthenticated → `/signin`

## File Structure
- Pages: `src/app/(main)/admin/` and `src/app/(main)/consultant/`
- Feature components: `src/features/{feature}/components/`
- Shared UI: `src/components/ui/` (shadcn/ui)
- Layout: `src/components/layout/`
- Data tables: `src/components/data-table/`
- Hooks: `src/hooks/`
- Types: `src/types/`
- Stores: `src/stores/` (Zustand)
- Constants: `src/constants/`

## Page Patterns
- List pages: stat cards on top + data table below, wrapped in `PageContainer`
- Detail pages: tabbed layout with sections
- Use `'use client'` + `useQuery` for data fetching
- Use `useClientApi()` hook from `src/lib/axios/clientSide.ts` for API calls
- API calls go to `/admin/{resource}/` or `/consultant/{resource}/`

## Conventions
- Use `lucide-react` for icons (not tabler-icons for new code)
- Use `cn()` from `src/lib/utils.ts` for className merging
- Use React Hook Form + Zod for forms
- Use TanStack React Query for server state
- Use Zustand for client state
- Use `sonner` for toast notifications
- Use `date-fns` for date formatting
- All new components must be TypeScript with proper types
- Prefer server components where possible, use 'use client' only when needed

## Sidebar Navigation
- Uses NavGroup pattern with grouped sections
- Types defined in `src/components/layout/types.ts`
- Admin groups: General, CRM, Students, Finance, Configuration, Settings
- Consultant groups: General, CRM, Students, Finance, Settings
