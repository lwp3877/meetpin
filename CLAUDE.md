# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MeetPin (밋핀) is a location-based social meeting platform where users create rooms on a map to meet nearby people for drinks, sports, and activities. Korean-language, mobile-first design. Deployed on Vercel at meetpin-weld.vercel.app.

**Stack**: Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS v4 + shadcn/ui, backed by Supabase (PostgreSQL, Auth, Realtime, Storage), with Kakao Maps SDK, Stripe payments, and optional Redis/Upstash caching.

## Development Commands

```bash
pnpm dev              # Dev server on localhost:3001
pnpm build            # Production build (fails on TS errors or lint warnings)
pnpm typecheck        # TypeScript check (0 errors expected)
pnpm lint             # ESLint (0 warnings expected)
pnpm test             # Jest unit tests
pnpm test -- __tests__/lib/zodSchemas.test.ts  # Run single test file
pnpm e2e              # Playwright E2E tests
pnpm repo:doctor      # Full check: typecheck + lint + build
pnpm restart:clean    # Delete .next and restart dev server
```

## Architecture

### Import Paths

tsconfig `baseUrl: "src"` with `"@/*": ["*"]` path mapping. All imports use `@/` prefix resolving to `src/`:
```typescript
import { rateLimit } from '@/lib/api'       // → src/lib/api.ts
import { flags } from '@/lib/config/flags'   // → src/lib/config/flags.ts
```

### API Route Pattern

All API routes are in `src/app/api/` (45 endpoints). They use composable middleware from `src/lib/api.ts`:

```typescript
// Standard pattern in route.ts files:
import { withErrorHandling, withAuth, withRateLimit, createSuccessResponse, ApiError } from '@/lib/api'

export const GET = withErrorHandling(async (request, context) => {
  // withErrorHandling wraps the handler with structured error logging and consistent error responses
  return createSuccessResponse(data)
})

// With auth + rate limiting:
export const POST = withErrorHandling(
  withRateLimit('createRoom')(
    withAuth(async (request, context, user) => {
      // user is the authenticated Supabase User
      return createSuccessResponse(result, '생성되었습니다', 201)
    })
  )
)
```

**Response format** — all endpoints return `ApiResponse<T>`:
```typescript
{ ok: boolean, data?: T, code?: string, message?: string }
```

**Key utilities in `src/lib/api.ts`**:
- `withErrorHandling()` — catches errors, maps Supabase/network errors to proper HTTP codes, logs via structured logger
- `withAuth()` / `withAdminAuth()` — injects authenticated user
- `withRateLimit(type)` / `withUserRateLimit(type)` — IP and user-based rate limiting
- `parseAndValidateBody(request, zodSchema)` — parse + Zod validate request body
- `apiUtils.success/error/notFound/forbidden/unauthorized/conflict` — shorthand response helpers
- `ApiError` class — throw with status code and error code for structured responses

### Authentication

`src/lib/services/auth.ts` — dual-mode authentication:
- **Production**: Supabase JWT via `createServerSupabaseClient()` with cookie handling
- **Development (Mock)**: When `NEXT_PUBLIC_USE_MOCK_DATA=true`, returns mock users from cookies or defaults to admin. Test login: `admin@meetpin.com` / `123456`

Key functions: `getAuthenticatedUser()`, `requireAdmin()`, `requireRoomOwner(roomId)`, `requireMatchParticipant(matchId)`

The `isDevelopmentMode` flag is exported from `src/lib/config/flags.ts` and controls mock behavior across the app.

### Supabase Clients (`src/lib/supabaseClient.ts`)

- `createBrowserSupabaseClient()` — client-side with cookie sync
- `createServerSupabaseClient()` — server-side with Next.js cookie handling
- `supabaseAdmin` — service role client, bypasses RLS

### Database Schema

SQL scripts in `scripts/` (run manually in Supabase SQL Editor, in this order):
1. `migrate.sql` — Core tables (profiles, rooms, requests, matches, messages, etc.)
2. `migrate-extra.sql` — Additional tables (notifications, feedback, emergency_reports, etc.)
3. `storage-setup.sql` — Storage buckets (avatars, room-images, images)
4. `rls.sql` — Core table RLS policies
5. `rls-extra.sql` — Additional table RLS policies
6. `storage-rls.sql` — Storage bucket RLS policies
7. `seed.sql` — Sample data (development only, skip for production)

Core tables: `profiles`, `rooms` (with `host_uid`, location, `boost_until`), `requests` (join requests with status workflow), `matches` (accepted requests), `messages` (realtime chat), `host_messages`, `notifications`, `reports`, `blocked_users`, `age_verification`, `feedback`, `emergency_reports`, `privacy_rights_requests`, `admin_notifications`, `user_verification_status`, `user_verifications`, `meetup_feedback`, `user_safety_settings`.

RLS policies enforce: user blocking (bidirectional), permission-based access, admin-only for reports/moderation.

### Room Lifecycle (Core Business Logic)

Host creates room → Users send join requests → Host accepts/rejects → Accepted requests create matches → Matches enable 1:1 messaging.

### Geographic Filtering

Uses BBox (bounding box) instead of PostGIS. API endpoints accept `?bbox=south,west,north,east`. Utilities in `src/lib/bbox.ts` (coordinate validation, Haversine distance).

### Middleware (`src/middleware.ts`)

Runs on `/api/:path*` only. Handles:
- CORS whitelist (meetpin-weld.vercel.app, meetpin.com, localhost in dev)
- CSRF protection for state-changing methods (POST/PUT/DELETE/PATCH) via referer/origin check
- Webhook and health endpoints are CSRF-exempt

### Feature Flags (Two Systems)

1. **`src/lib/config/flags.ts`** — Core environment flags and app config. Exports `flags` object (`kakaoOAuthEnabled`, `stripeCheckoutEnabled`, `adminPanelEnabled`, etc.) and `config` object (default location, pagination, rate limits, boost prices). Also exports `isDevelopmentMode`.

2. **`src/lib/config/features.ts`** — A/B testing and gradual rollout flags. Uses `NEXT_PUBLIC_FEATURE_*` env vars. Access via `isFeatureEnabled('ENABLE_DARK_MODE')` or `getFeatures()`. Includes hash-based A/B variant assignment via `getVariant()`.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages and API routes
│   ├── api/                # 45 API endpoints
│   ├── map/                # Main app page (map view)
│   ├── room/[id]/          # Room detail, edit, requests
│   ├── chat/[matchId]/     # 1:1 chat
│   ├── auth/               # Login, signup, callback
│   ├── admin/              # Admin panel
│   ├── profile/            # User profile
│   └── legal/              # Terms, privacy, location
├── components/             # Domain-organized React components
│   ├── ui/                 # shadcn/ui base components
│   ├── map/                # DynamicMap, MapWithCluster, LocationPicker, MapFilters
│   ├── chat/               # ChatPanel
│   ├── room/               # RoomForm
│   ├── auth/               # Social login
│   ├── common/             # Providers, BotSchedulerInitializer
│   └── ...                 # error, landing, pwa, safety
├── lib/
│   ├── api.ts              # API utilities, middleware, response helpers
│   ├── supabaseClient.ts   # Supabase client instances
│   ├── zodSchemas.ts       # Zod validation schemas
│   ├── bbox.ts             # Geographic bounding box utilities
│   ├── rateLimit.ts        # Rate limiting logic
│   ├── config/             # flags, brand, features, mockData, koreanAvatars
│   ├── services/           # auth.ts, authService.ts
│   ├── cache/              # Redis caching layer
│   ├── bot/                # AI room generation/scheduling
│   ├── observability/      # Structured logging with PII scrubbing
│   ├── payments/           # Stripe integration
│   ├── security/           # CSP utilities
│   ├── accessibility/      # WCAG utilities
│   └── design/             # Design system tokens
└── types/
    └── global.d.ts         # Window/ProcessEnv augmentations (types are co-located with their modules)
```

## Key Conventions

- **All UI text in Korean** — error messages, labels, toast notifications, everything user-facing
- **Zod validation** — use schemas from `src/lib/zodSchemas.ts` for all API input validation
- **Brand system** — `src/lib/config/brand.ts`: Primary (#10B981), Boost (#F59E0B), categories: 술/운동/기타
- **Font**: Pretendard for Korean text
- **Type definitions** — all in `src/types/global.d.ts`, organized by domain
- **App Router only** — CI enforces no `pages/` directory exists (Pages Router guard in quality workflow)

## Testing

- **Unit tests**: `__tests__/` directory, Jest with jsdom. Module mapper: `@/` → `src/`
- **E2E tests**: `e2e/` directory, Playwright (chromium, firefox, mobile-chrome, mobile-safari)
- **RLS security tests**: `tests/rls/` — requires live Supabase connection, excluded from Jest by default
- **Coverage threshold**: 80% branches/functions/lines/statements

## CI/CD

GitHub Actions workflows in `.github/workflows/`:
- `quality.yml` — on push to main/develop: typecheck → lint → App Router guard → security audit → build → bundle budget (300KB limit) → architecture check → smoke test
- `e2e-prod.yml` — daily E2E against production
- `uptime.yml` — uptime monitoring
- `deploy.yml` — deployment pipeline with error budget guard

## Environment Variables

Required: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY`, `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `SITE_URL`.

Mock mode: Set `NEXT_PUBLIC_USE_MOCK_DATA=true` in `.env.local` to run without Supabase (development only; always disabled in production builds).

Optional: `REDIS_URL`/`UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` (caching), `SENTRY_DSN` (error tracking), `NEXT_PUBLIC_ENABLE_*` flags.

## Build Configuration

`next.config.ts` chains: base Next.js config → PWA (`@ducanh2912/next-pwa`) → conditional Sentry (`@sentry/nextjs`). Key settings:
- Bundle budget: 300KB per chunk (enforced via webpack plugin in production builds)
- Image optimization: WebP/AVIF, remote patterns for Supabase Storage and social login avatars
- Package import optimization for lucide-react, date-fns, Radix UI, react-hook-form, zod
- Production security headers: HSTS, CSP, X-Frame-Options DENY, Permissions-Policy
- API rewrite: `/api/stripe/*` → `/api/payments/stripe/*`
