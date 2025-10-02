# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

밋핀(MeetPin) is a location-based social meeting platform where users create rooms on a map to meet nearby people for drinks, sports, and various activities. The platform uses Korean language and focuses on mobile-first design.

## Core Architecture

### Technology Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui, React 19
- **Backend**: Supabase (PostgreSQL, Auth, Realtime, Storage)
- **Caching**: Redis (ioredis) with Upstash for distributed caching
- **External APIs**: Kakao Maps SDK, Stripe payments
- **Database**: PostgreSQL with Row Level Security (RLS)
- **State Management**: Zustand, React Context
- **Form Handling**: React Hook Form with Zod validation
- **Observability**: Structured logging with PII scrubbing and request tracing

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

6. **Advanced Caching Architecture** (`src/lib/cache/redis.ts`):
   - Redis/Upstash distributed caching with fallback to direct DB access
   - Structured cache keys: `CacheKeys.rooms()`, `CacheKeys.roomDetail(id)`
   - TTL-based invalidation with performance-optimized cache strategies
   - Development mode gracefully handles missing Redis connections

7. **Observability & Logging** (`src/lib/observability/logger.ts`):
   - Structured logging with request tracing and PII scrubbing
   - Performance timing with `PerformanceTimer` class
   - Environment-aware logging (JSON for production, colored console for development)
   - Request correlation with generated request IDs

8. **API Status & Health Monitoring**:
   - Multiple health endpoints: `/api/health`, `/api/ready`, `/api/healthz`, `/api/livez`
   - Cache statistics endpoint: `/api/cache/stats`
   - Security CSP reporting: `/api/security/csp-report`
   - Web vitals telemetry: `/api/telemetry/web-vitals`

9. **GDPR/DSAR Compliance**:
   - Data Subject Access Rights automation: `/api/dsar/export`, `/api/dsar/delete-request`
   - Privacy rights request handling: `/api/privacy-rights/request`
   - Automated data cleanup with cron jobs: `/api/cron/*`
   - Age verification system: `/api/age-verification`

10. **Folder Structure & Organization**:
   - **components/**: Domain-driven organization (auth, chat, map, room, etc.)
     - `auth/` - Authentication components (social-login)
     - `chat/` - Chat functionality (ChatPanel)
     - `common/` - Shared components (Providers, theme-toggle)
     - `error/` - Error handling (GlobalErrorBoundary)
     - `landing/` - Landing pages (NewLanding, ProLanding, enhanced-landing)
     - `layout/` - Layout components (LegalFooter)
     - `map/` - Map features (DynamicMap, MapWithCluster, LocationPicker)
     - `mobile/` - Mobile-optimized layouts
     - `room/` - Room management (RoomForm)
     - `ui/` - shadcn/ui components + feature-specific UI
   - **lib/**: Functional organization by concern
     - `accessibility/` - WCAG compliance utilities
     - `bot/` - Bot room generation and scheduling
     - `cache/` - Redis caching layer
     - `config/` - Feature flags and configuration
     - `design/` - Design system tokens
     - `observability/` - Logging and monitoring
     - `payments/` - Stripe integration
     - `security/` - Security utilities and CSP
     - `services/` - External service integrations (Supabase, auth)
     - `utils/` - General utilities
   - **types/**: Centralized type definitions
     - `global.d.ts` - All project types organized by domain
     - Domain sections: User, Room, API, Map, Payment, etc.
   - **Naming Conventions**:
     - Components: Both PascalCase and kebab-case accepted
     - Utils/Hooks: camelCase.ts
     - Types: Defined in global.d.ts
     - Folders: lowercase with hyphens

## Current Project Status (최신 상태)

### ✅ Completed Advanced Features

- **실시간 WebSocket 채팅 시스템**: Supabase Realtime을 활용한 실시간 메시징
- **프로필/방 이미지 업로드 기능**: Supabase Storage 기반 이미지 처리 및 최적화
- **Push 알림 시스템**: Browser Notification API 완전 구현
- **Stripe 결제 시스템**: 부스트 기능을 위한 완전한 결제 처리
- **Redis 캐싱 시스템**: 성능 최적화를 위한 분산 캐시 (개발환경에서는 선택적)
- **구조화 로깅**: PII 스크러빙과 요청 추적을 포함한 관찰가능성 시스템
- **GDPR/DSAR 준수**: 데이터 내보내기 및 삭제 요청 처리 자동화
- **AI 콘텐츠 생성**: 자동 모임 봇 생성 및 스케줄링 시스템
- **고급 보안**: CSP 헤더, 보안 강화, 취약점 자동 감사
- **무한 루프 해결**: useAuth.tsx의 useCallback 의존성 문제 완전 해결
- **하이드레이션 오류**: React Server/Client 컴포넌트 불일치 문제 해결
- **단위 테스트**: 60/60 테스트 통과 (RLS 보안 테스트 포함)
- **개발 서버**: localhost:3001에서 안정적 실행 (기본 포트)

### 🔧 Development Mode Features

- **Mock Authentication**: `admin@meetpin.com` / `123456`로 테스트 로그인
- **Sample Data**: 서울 지역 기준 샘플 모임 데이터
- **API Mocking**: 실제 Supabase 없이도 모든 API 동작
- **Error Handling**: 개발 친화적 오류 메시지

## Development Commands

```bash
# Development Environment
pnpm dev          # Start development server (localhost:3001 by default)
pnpm build        # Production build
pnpm start        # Start production server
pnpm preview      # Build and preview production version

# Code Quality & Type Safety
pnpm typecheck    # TypeScript type checking (0 errors expected)
pnpm lint         # ESLint checking (0 warnings expected)
pnpm lint:fix     # Auto-fix linting issues
pnpm format       # Format code with Prettier
pnpm format:check # Check code formatting

# Testing Suite
pnpm test         # Run Jest unit tests (60/60 passing)
pnpm test:watch   # Run tests in watch mode
pnpm e2e          # Run Playwright E2E tests
pnpm e2e:ui       # Run E2E tests with UI
pnpm playwright:install # Install Playwright browsers

# Quality Assurance Extended
pnpm qa:local     # Local Playwright tests
pnpm qa:production # Production smoke tests
pnpm qa:detailed  # Detailed production tests
pnpm qa:performance # Performance tests
pnpm qa:mobile    # Mobile device testing
pnpm qa:validate  # Full validation pipeline
pnpm qa:full      # Complete QA suite

# Performance & Analysis
pnpm analyze:bundle # Bundle analysis with ANALYZE=1
pnpm perf:baseline  # Create performance baseline
pnpm perf:compare   # Compare against baseline
pnpm perf:guard     # Performance regression guard

# Database Operations (Manual)
pnpm db:migrate   # Reminder to run scripts/migrate.sql in Supabase
pnpm db:rls       # Reminder to run scripts/rls.sql in Supabase
pnpm db:seed      # Reminder to run scripts/seed.sql in Supabase

# Quality Assurance
pnpm repo:doctor  # Comprehensive check: typecheck + lint + build
pnpm approve-builds # Approve package build requirements

# Package Management
pnpm store prune  # Clean package cache
npx kill-port 3001 # Kill process on port 3001 if needed

# Security & Compliance
pnpm audit:security # Security vulnerability audit
pnpm arch:check     # Architecture boundary validation
pnpm smoke          # Quick smoke test for essential features
pnpm a11y           # Run accessibility tests (WCAG 2.1 AA)
pnpm a11y:report    # Generate accessibility report with HTML output
```

## Database Schema & Migration

Execute database scripts in Supabase SQL Editor in this order:

1. `scripts/migrate.sql` - Creates tables, indexes, triggers
2. `scripts/rls.sql` - Applies Row Level Security policies
3. `scripts/seed.sql` - Adds sample data (development only)

### Core Tables

- `profiles` - User profiles linked to auth.users
- `rooms` - Meeting rooms with location and metadata (includes `boost_until` for payment system)
- `requests` - Join requests with status workflow
- `matches` - Accepted requests enabling 1:1 chat
- `messages` - Chat messages between matched users (realtime enabled)
- `host_messages` - Direct messages to room hosts with notification system
- `notifications` - User notifications system with read status
- `reports` - User reporting system
- `blocked_users` - User blocking relationships
- `age_verification` - Age verification tracking for compliance
- `feedback` - User feedback collection system

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

- Stripe Checkout for boost purchases (1일/₩1,000, 3일/₩2,500, 7일/₩5,000)
- Webhook handling updates `boost_until` timestamp
- Development mode mock payment processing
- Boost sorting: rooms with active boost appear first
- Complete UI with BoostModal component for purchase flow

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

# Stripe (부스트 결제)
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Stripe Price IDs (옵션 - 고정 상품 사용 시)
STRIPE_PRICE_1D_ID=
STRIPE_PRICE_3D_ID=
STRIPE_PRICE_7D_ID=

# App
SITE_URL=

# Feature Flags (선택적)
NEXT_PUBLIC_ENABLE_STRIPE_CHECKOUT=true
NEXT_PUBLIC_ENABLE_REALTIME_NOTIFICATIONS=true
NEXT_PUBLIC_ENABLE_FILE_UPLOAD=true

# Redis/Upstash (선택적 - 캐싱 성능 향상)
REDIS_URL=your_redis_url
UPSTASH_REDIS_REST_URL=your_upstash_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token

# Observability (선택적)
SENTRY_DSN=your_sentry_dsn
TELEMETRY_SAMPLING_RATE=0.1

# Development Mode Control
NEXT_PUBLIC_USE_MOCK_DATA=true  # true for mock mode, false for production

# Testing Environment (RLS Security Tests)
# Required only for advanced security testing
# NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_for_testing
# SUPABASE_SERVICE_ROLE_KEY=your_service_role_for_testing
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

- **Jest** for unit tests of utilities and business logic (60/60 tests expected to pass)
- **Advanced RLS Security Testing**: Comprehensive security test suite in `tests/rls/rls-security.spec.ts`
  - Row Level Security policy validation
  - User isolation and permission testing
  - Cross-user data access prevention
  - Admin privilege escalation protection
  - Performance testing with large datasets
- **Playwright** for E2E tests with UI support and comprehensive accessibility testing (WCAG 2.1 AA compliance)
- **Multi-environment Testing**: Local, production, mobile, and performance test suites
- **Critical User Flows**: signup → room creation → matching → chat
- **Lighthouse Integration**: Performance, accessibility, and SEO auditing
- **Mobile Testing**: Chrome and Safari mobile browser testing

## Important Development Notes

### Code Style & Patterns

- Use `ApiResponse<T>` interface for all API responses: `{ ok: boolean, data?: T, code?: string, message?: string }`
- Always validate input with Zod schemas from `src/lib/zodSchemas.ts`
- Use `rateLimit(key, limit, windowMs)` for protecting endpoints
- Use `ApiError` class for structured error handling with status codes
- Import paths use `@/` prefix resolving to `src/`
- **CRITICAL**: All authentication functions check `isDevelopmentMode` for Mock support

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

### Real-time Features Architecture

- **Supabase Realtime**: WebSocket connections for live updates
- **Chat System**: `useRealtimeChat` hook for 1:1 messaging with typing indicators
- **Notifications**: `useRealtimeNotifications` for host message alerts
- **Online Presence**: Real-time user status tracking in chat
- **Browser Push**: Native notification API for background alerts

### Image Upload System

- **Supabase Storage**: Secure file storage with RLS policies
- **Image Optimization**: WebP conversion and compression
- **Universal Component**: `ImageUploader` for profiles and rooms
- **Drag & Drop**: Native file handling with preview
- **Korean Avatars**: Curated avatar collection for local users

### Testing Strategy

- **Jest Unit Tests**: 60/60 tests passing, covering utilities, business logic, and security
- **Test Locations**: `__tests__/` for unit tests, `tests/rls/` for security tests, `e2e/` for end-to-end
- **RLS Security Tests**: Comprehensive Row Level Security validation requiring Supabase environment variables
- **Single Test Run**: `pnpm test -- __tests__/lib/zodSchemas.test.ts`
- **Environment-Specific Tests**: Separate test suites for development (Mock) and production environments
- **Critical User Flows**: signup → room creation → matching → chat
- **E2E Testing**: Playwright for cross-browser end-to-end testing with mobile device emulation
- **Performance Testing**: Bundle analysis, baseline comparison, and regression guards
- **Development Testing**: Mock data enables full feature testing without external services
- **Security Testing**: RLS policy validation, privilege escalation prevention, user isolation testing

### Advanced Component Architecture

- **Modal System**: Centralized modal management (BoostModal, RealtimeChatModal)
- **Hook Pattern**: Custom hooks for complex state (`useRealtimeChat`, `useRealtimeNotifications`)
- **Form Integration**: React Hook Form + Zod validation throughout
- **Notification Stack**: React Hot Toast + Browser Push + Real-time updates
- **Payment Flow**: Complete Stripe integration with development/production modes

### Project Quality Standards

- **TypeScript**: Strict mode with enhanced type safety
- **Code Quality**: Comprehensive ESLint + Prettier configuration (⚠️ Next.js lint deprecated in v16)
- **Testing Suite**: Jest unit tests + Playwright E2E testing + WCAG 2.1 AA accessibility compliance
- **Build Verification**: `pnpm repo:doctor` for complete quality checks
- **Performance**: Bundle optimization and lazy loading
- **Internationalization**: Korean-first UI with proper text handling
- **Mobile-first**: Responsive design with touch-optimized interactions
- **Security**: Multi-layer protection (RLS, validation, rate limiting, blocking)
- **Accessibility**: WCAG 2.1 AA compliance with automated testing and color contrast verification

## Production Deployment

### Current Deployment Status

- **Platform**: Vercel (meetpin-weld.vercel.app)
- **Git Integration**: Automatic deployment from GitHub main branch
- **Build Status**: Latest version 1.5.0 with major refactoring and performance improvements
- **Latest Deployment**: Commit 9cd2cca - Full refactoring with cleaned architecture
- **Environment**: Production environment variables configured in Vercel dashboard

### Deployment Architecture

- **Frontend**: Next.js deployed to Vercel with automatic optimization
- **Database**: Supabase PostgreSQL with RLS policies active
- **CDN**: Vercel Edge Network for static assets
- **Domain**: Custom domain available through Vercel configuration

### Build Cache Management

Critical for production deployments due to aggressive CDN caching:

- **Build Buster System**: `src/lib/buildBuster.ts` contains version identifiers for cache invalidation
- **Version Bumping**: Update `package.json` version to trigger new builds
- **Force Update Pattern**: Create dummy files (like `FORCE_UPDATE.txt`) to ensure all files are refreshed
- **Cache Headers**: Vercel automatically handles cache invalidation for new deployments

### Production Environment Variables

All environment variables must be configured in Vercel dashboard:

- Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- Kakao Maps: `NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY`
- Stripe: `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`
- App: `SITE_URL` (set to production domain)

### Development vs Production Modes

- **Development Mode**: Uses Mock authentication and sample data
- **Production Mode**: Full Supabase integration with real authentication
- **Feature Flags**: `src/lib/flags.ts` controls environment-specific features
- **Build Detection**: `isDevelopmentMode` flag determines runtime behavior

### Troubleshooting Production Issues

Common production deployment issues and solutions:

1. **Cache Issues**: Old JavaScript bundles served despite code changes
   - Solution: Update `buildBuster.ts` and bump `package.json` version
2. **Authentication Errors**: Supabase connection issues in production
   - Solution: Verify environment variables and consider Mock mode fallback
3. **Build Failures**: TypeScript or linting errors preventing deployment
   - Solution: Run `pnpm repo:doctor` locally before pushing
4. **Git Synchronization**: Local changes not reflecting in deployment
   - Solution: Ensure all changes are committed and pushed to GitHub main branch
5. **RLS Test Failures**: Security tests failing due to missing Supabase environment variables
   - Solution: Either provide Supabase credentials for testing or skip RLS tests in development
   - Note: RLS tests in `tests/rls/` require live Supabase connection and will fail in CI/CD without proper setup
6. **Next.js Lint Deprecation**: `next lint` command deprecated and will be removed in Next.js 16
   - Solution: Consider migrating to ESLint CLI: `npx @next/codemod@canary next-lint-to-eslint-cli .`

### Test Environment Configuration

- **Unit Tests**: All tests in `__tests__/` run without external dependencies
- **RLS Security Tests**: Tests in `tests/rls/` require Supabase environment variables
- **Jest Configuration**: `jest.config.js` excludes `tests/rls/` by default to prevent CI failures
- **Test Isolation**: RLS tests create and cleanup their own test data to avoid conflicts
- **Running RLS Tests**: To run security tests separately: `pnpm test tests/rls/rls-security.spec.ts` (requires Supabase environment variables)
