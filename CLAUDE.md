# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

밋핀(MeetPin) is a location-based social meeting platform where users create rooms on a map to meet nearby people for drinks, sports, and various activities. The platform uses Korean language and focuses on mobile-first design.

## Core Architecture

### Technology Stack
- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui, React 19
- **Backend**: Supabase (PostgreSQL, Auth, Realtime, Storage)
- **External APIs**: Kakao Maps SDK, Stripe payments
- **Database**: PostgreSQL with Row Level Security (RLS)
- **State Management**: React Query (@tanstack/react-query)
- **Form Handling**: React Hook Form with Zod validation

### Key Architectural Patterns

1. **API Route Structure**: All API routes follow a consistent pattern using `src/lib/api.ts` utilities:
   - `ApiResponse<T>` interface for consistent response format: `{ ok: boolean, data?: T, code?: string, message?: string }`
   - `ApiError` class for structured error handling with status codes
   - `rateLimit()` function for simple in-memory rate limiting
   - Authentication functions: `getAuthenticatedUser()`, `requireAdmin()`

2. **Database Security**: Comprehensive RLS policies handle:
   - User blocking relationships (bidirectional visibility filtering)
   - Permission-based access (room owners, request participants)
   - Admin-only access for reports and moderation

3. **Feature Flags**: Configurable features via `src/lib/flags.ts`:
   - Kakao OAuth (default: OFF)
   - Stripe checkout vs Payment Links
   - Admin panel, reporting, analytics
   - Environment-based feature toggling

4. **Supabase Client Architecture**:
   - Browser client: `createBrowserSupabaseClient()`
   - Server client: `createServerSupabaseClient()` with cookie handling
   - Admin client: `supabaseAdmin` for RLS bypass operations

5. **TypeScript Configuration**:
   - `baseUrl: "src"` with `"@/*": ["*"]` path mapping
   - All imports use `@/lib/*` pattern resolving to `src/lib/*`
   - Strict TypeScript configuration with enhanced type safety
   - Global type definitions in `src/types/global.d.ts`

## Development Commands

```bash
# Development
pnpm dev          # Start development server
pnpm build        # Production build
pnpm typecheck    # TypeScript type checking
pnpm lint         # ESLint checking
pnpm lint:fix     # Auto-fix linting issues

# Testing
pnpm test         # Run Jest unit tests (49 tests)
pnpm test:watch   # Run tests in watch mode
pnpm e2e          # Run Playwright E2E tests
pnpm e2e:ui       # Run E2E tests with UI
pnpm playwright:install # Install Playwright browsers

# Database
pnpm db:migrate   # Reminder to run scripts/migrate.sql
pnpm db:rls       # Reminder to run scripts/rls.sql  
pnpm db:seed      # Reminder to run scripts/seed.sql

# Quality & Validation
pnpm repo:doctor  # Run typecheck + lint + build (comprehensive check)
pnpm format       # Format code with Prettier
pnpm format:check # Check code formatting
pnpm preview      # Build and preview production version
```

## Database Schema & Migration

Execute database scripts in Supabase SQL Editor in this order:
1. `scripts/migrate.sql` - Creates tables, indexes, triggers
2. `scripts/rls.sql` - Applies Row Level Security policies
3. `scripts/seed.sql` - Adds sample data (development only)

### Core Tables
- `profiles` - User profiles linked to auth.users
- `rooms` - Meeting rooms with location and metadata
- `requests` - Join requests with status workflow
- `matches` - Accepted requests enabling 1:1 chat
- `messages` - Chat messages between matched users
- `reports` - User reporting system
- `blocked_users` - User blocking relationships

## API Design Patterns

### Consistent Response Format
```typescript
interface ApiResponse<T> {
  ok: boolean
  data?: T
  code?: string
  message?: string
}
```

### Authentication Flow
- `getAuthenticatedUser()` - Validates JWT and returns user
- `requireAuth()` - Throws 401 if not authenticated
- `requireAdmin()` - Validates admin role

### Geographic Filtering
Uses BBox (bounding box) filtering instead of PostGIS for simplicity:
- `src/lib/bbox.ts` contains geographic utilities
- API endpoints accept `?bbox=south,west,north,east` parameters
- Client-side map bounds determine search area
- Haversine formula for distance calculations

### Rate Limiting
Memory-based rate limiting in `src/lib/rateLimit.ts`:
- API calls: 100/minute per IP
- Room creation: 5/minute per user
- Auth attempts: 5/15 minutes per IP
- Message sending: 50/minute per user
- Report creation: 3/minute per user

## Key Business Logic

### Room Lifecycle
1. Created by host user
2. Other users send join requests
3. Host accepts/rejects requests
4. Accepted requests create matches
5. Matches enable 1:1 messaging

### Payment Integration
- Stripe Checkout for boost purchases
- Webhook handling updates `boost_until` timestamp
- Payment Link fallback for manual processing
- Boost sorting: rooms with active boost appear first

### Security Considerations
- RLS policies prevent data leakage between blocked users
- Input validation using Zod schemas in `src/lib/zodSchemas.ts`
- Forbidden words filtering for user-generated content
- Rate limiting prevents abuse
- Admin-only access to reports and user management

## Environment Variables Required

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Kakao Maps
NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# App
SITE_URL=
```

## Korean Language Considerations

- All UI text, error messages, and user-facing content in Korean
- Database stores Korean text (nicknames, room titles, messages)
- Pretendard font for optimal Korean display
- Korean input validation patterns in zodSchemas.ts

## Brand System

Centralized in `src/lib/brand.ts`:
- Color palette: Primary (#10B981), Boost (#F59E0B), Accent (#F97316)
- Category badges: 술🍻, 운동💪, 기타✨
- Brand messages: "밋핀", "핀 찍고, 지금 모여요"

## Testing Strategy

- **Jest** for unit tests of utilities and business logic
- **Playwright** for E2E tests with UI support
- Critical user flows: signup → room creation → matching → chat
- API integration tests for authentication and authorization
- RLS policy testing in database environment

## Important Development Notes

### Code Style & Patterns
- Use `ApiResponse<T>` interface for all API responses: `{ ok: boolean, data?: T, code?: string, message?: string }`
- Always validate input with Zod schemas from `src/lib/zodSchemas.ts`
- Use `rateLimit(key, limit, windowMs)` for protecting endpoints
- Use `ApiError` class for structured error handling with status codes
- Import paths use `@/` prefix resolving to `src/`

### Page Structure
- All application pages are in `src/app/` using Next.js 15 App Router
- Key pages: `/map` (main app), `/room/new`, `/room/[id]`, `/chat/[matchId]`, `/profile`, `/admin`
- Legal pages: `/legal/terms`, `/legal/privacy`, `/legal/location`
- Landing page CTAs redirect to `/map`

### Geographic Data Handling  
- Use BBox parameters instead of PostGIS: `?bbox=south,west,north,east` (comma-separated)
- Utility functions in `src/lib/bbox.ts` for coordinate validation and distance calculations
- Korea and Seoul preset bounding boxes available
- Haversine formula for distance calculations

### Authentication Patterns
- Server-side: Use `getAuthenticatedUser()` or `requireAdmin()` from `@/lib/api`
- Client-side: Use Supabase client with proper cookie handling
- RLS policies handle data access control automatically
- User blocking relationships affect data visibility bidirectionally

### Testing
- Jest unit tests cover utilities and business logic (49 tests passing)
- Tests located in `__tests__/` directory
- Run single test: `pnpm test -- __tests__/lib/zodSchemas.test.ts`
- Critical flows: signup → room creation → matching → chat

### Project Quality Standards
- TypeScript strict mode enabled with enhanced type safety
- All builds must pass: `pnpm repo:doctor` (typecheck + lint + build)
- 49/49 tests must pass
- Korean UI text and error messages throughout
- Mobile-first responsive design