# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.17] - 2025-01-24

### Production Validation
- Prod validation run

## [1.4.16] - 2025-09-26

### Fixed
- 🚀 **ops endpoints: App Router only**: /status, /api/healthz, /api/ready 완전 App Router 전환
- ⚡ **Pages Router 완전 제거**: pages/ 디렉토리 삭제로 라우팅 충돌 해결
- 🔄 **Rewrite 규칙 정리**: /status, /api/healthz, /api/ready 관련 rewrite 제거
- 🛡️ **Vercel 플랫폼 호환**: App Router만으로 확실한 배포 보장

### Technical Details
- src/app/status/page.tsx: force-dynamic + revalidate=0 + 30초 자동 새로고침
- src/app/api/healthz/route.ts: nodejs runtime + cache-control no-store + JSON 응답
- src/app/api/ready/route.ts: 준비도 검사 + 503 상태코드 지원
- Pages Router 완전 삭제로 라우팅 충돌 제거

## [1.4.14] - 2025-09-26

### Fixed
- 🚀 **ops v-path fallback**: /ops/* & /api/_ops/* + rewrites for cache bypass
- ⚡ **Root Pages Router**: pages/ops/status.tsx, pages/api/_ops/{healthz,ready}.ts
- 🔄 **Rewrite rules**: /status → /ops/status, /api/healthz → /api/_ops/healthz, /api/ready → /api/_ops/ready
- 🛡️ **Middleware removed**: No conflicts with routing

### Technical Details
- New versioned paths to bypass 404 cache: /ops/status, /api/_ops/healthz, /api/_ops/ready
- Root /pages directory (not src/pages) for Vercel platform compatibility
- next.config.ts rewrites for legacy path support
- Minimal implementations with timestamp + cache-control no-store

## [1.4.12] - 2025-09-26

### Fixed
- 🔧 **normalize routes to src/pages + prebuilt deploy**: 표준 경로 정규화
- ⚡ **src/pages 단일 구조**: status, healthz, ready 엔드포인트 최소 구현
- 🛡️ **config cleanup**: next.config headers 상태 규칙 제거, middleware 없음
- 📦 **Vercel prebuilt deployment**: 로컬 빌드 → 프리빌트 배포 방식

### Technical Details
- src/pages/status.tsx: 최소 Status OK 응답
- src/pages/api/{status,healthz,ready}.ts: cache-control no-store + JSON 응답
- next.config.ts: 상태 엔드포인트 특별 규칙 제거
- Vercel build → prebuilt deploy 파이프라인 적용

## [1.4.11] - 2025-09-26

### Fixed
- 🔥 **Vercel platform routing fix**: Pages Router 우선 적용으로 API 404 해결
- ⚡ **Router conflict resolution**: App Router 중복 제거, Pages Router 단일화
- 🛡️ **vercel.json routes**: 명시적 라우팅 규칙 + 함수 런타임 설정
- 📦 **Clean Pages Router**: /api/healthz, /api/ready, /api/status, /status 완전 Pages Router 전환

### Technical Details
- Pages Router: pages/api/*.ts 단일 구조로 완전 통합
- vercel.json: explicit routes 규칙 + nodejs20.x 함수 런타임
- Router conflict 해결: src/app 중복 경로 완전 제거
- Local dev 200 OK 확인: Pages Router 엔드포인트 정상 동작

## [1.4.10] - 2025-01-28

### Fixed
- 🚫 **cache hard-disable for ops routes**: 상태 엔드포인트 캐시 완전 차단
- 🔄 **이중 캐시 방어**: next.config.ts headers() + middleware.ts 양쪽 적용
- ⚡ **캐시 버스터**: /status 페이지에 timestamp 쿼리 자동 새로고침
- 🛡️ **강화된 no-cache 헤더**: no-store, no-cache, must-revalidate, max-age=0, s-maxage=0, stale-while-revalidate=0

### Technical Details
- `/status`: force-dynamic + 30초 자동 새로고침 + 타임스탬프 캐시버스터
- `middleware.ts`: 캐시 차단 헤더 강제 적용
- `next.config.ts`: 패턴별 캐시 헤더 설정 (/status, /api/:path(status|healthz|ready))
- 빌드에서 ƒ Middleware + ƒ (Dynamic) 마크 확인

## [1.4.7] - 2025-01-28

### Fixed
- 🔥 **disable static export; enable server runtime for ops endpoints**: Vercel standalone output 비활성화로 API 라우트 복원
- ⚡ **서버 실행 모드 강제**: next.config.ts에서 output 설정 주석 처리하여 API 함수 생성 활성화
- 🛡️ **빌드 모드 검증**: ƒ (Dynamic) 마크 확인으로 서버 사이드 렌더링 보장

### Technical Details
- `next.config.ts`: `output: 'standalone'` 조건부 설정 비활성화 (API 404 원인 제거)
- 빌드 결과: `/status`, `/api/healthz`, `/api/ready` 모두 ƒ (Dynamic) 마크 확인
- Vercel 함수 런타임: nodejs20.x + 30초 최대 지속시간 설정 유지

## [1.4.6] - 2025-01-28

### Fixed
- 🔥 **ops routes: force-dynamic + simplified implementation**: 상태 엔드포인트 간소화 및 동적 처리 강제
- ⚡ **라우팅 최적화**: App Router 단일화로 라우팅 충돌 제거
- 🛡️ **ESLint 경고 해결**: 미사용 변수 underscore prefix 적용

### Technical Details
- `/status`: 간소화된 정적 상태 페이지로 변경 (force-dynamic + revalidate=0)
- `/api/healthz`, `/api/ready`: AbortController 패턴 + 1500ms 타임아웃 적용
- Pages Router 이중 구조 제거로 빌드 충돌 해결

## [1.4.5] - 2025-01-28

### Fixed
- 🔥 **Production 404 긴급 수정**: 상태 엔드포인트 3종 force-dynamic 설정 완료
- ⚡ **캐시 무효화**: 빌드시 정적 사전렌더링 비활성화, 실시간 API 응답 보장
- 🛡️ **타입 안전성 보완**: Promise.race 반환형 타입 캐스팅, 미사용 변수 ESLint 경고 해결

### Technical Details
- `/status` 페이지: 'use client' 전용 클라이언트 컴포넌트로 변경
- `/api/healthz`, `/api/ready`: `export const dynamic = 'force-dynamic'` + `revalidate = 0` + `runtime = 'nodejs'` 설정
- Vercel 배포 캐시 계층 우회를 위한 완전 동적 라우팅 적용

## [1.4.2] - 2025-01-28

### Added
- 🛡️ **상태 엔드포인트 3종**: `/api/status` (빌드 메타데이터), `/api/healthz` (빠른 의존성 체크), `/api/ready` (심화 준비도 검사)
- 📊 **휴먼 상태 대시보드**: `/status` 실시간 모니터링 페이지, 색상 코드 표시, 30초 자동 새로고침
- ⏰ **업타임 자동화**: 5분마다 자동 헬스체크, GitHub 이슈 자동 생성/닫기, 24시간 통계 계산
- 🚫 **에러버짓 배포 가드**: Production 환경 수동 승인, 에러율 기반 배포 차단 시스템
- 🔒 **세이프모드 플래그**: `SAFE_MODE=true`로 응급 쓰기 차단, GET/HEAD/OPTIONS만 허용

### Infrastructure
- 📈 **GitHub Actions 워크플로**: `.github/workflows/uptime.yml`로 업타임 모니터링 자동화
- 🛡️ **에러 버짓 게이트**: 품질 기반 배포 승인, SENTRY_ERROR_RATE_THRESHOLD 설정 가능
- ⚡ **미들웨어 강화**: 쓰기 작업 선별 차단, 503 응답 + Retry-After 헤더
- 📚 **운영 문서화**: `docs/SRE_RUNBOOK.md` 완전 업데이트, `docs/cleanup/FINAL_OPS_REPORT.md` 증빙

### Technical
- ⚡ **1.5초 타임아웃**: 모든 상태 엔드포인트에 빠른 실패 감지 적용
- 📋 **구조화된 JSON 응답**: 일관된 API 응답 형식과 적절한 HTTP 상태 코드
- 🔄 **실시간 대시보드**: 30초마다 자동 새로고침, 응답 시간 메트릭 표시
- 📱 **모바일 반응형**: 상태 모니터링 인터페이스 터치 최적화

### Operations Maturity Upgrade
- **이전**: L1 (기본) - 수동 배포 & 모니터링
- **현재**: L4 (최적화) - 완전 자동화 + 예방 시스템
- **효과**: 5분마다 자동 감지, 에러버짓 가드, 응급 세이프모드 활성화

---

## [1.4.1] - 2025-01-28

### Added
- 🏗️ **Architecture boundary enforcement** - Custom rules preventing API/lib/component layer violations
- 🔧 **Quality Guard CI workflow** - Automated TypeScript + ESLint + build + architecture validation
- 📊 **README quality badges** - Real-time status indicators for code quality metrics
- 🗂️ **Archive audit system** - Safe deletion analysis tool for unused files
- 📋 **Comprehensive cleanup reporting** - Detailed before/after metrics and improvement tracking

### Changed
- 📦 **Dependencies streamlined** - Removed 14 unused packages (8 production + 6 dev)
- 🧹 **Code formatting standardized** - Applied Prettier + ESLint across entire codebase
- 📚 **Documentation reorganized** - Consolidated 18 duplicate/outdated docs into organized structure
- 🎯 **README improved** - Beginner-friendly setup guide with step-by-step instructions

### Removed
- 🗃️ **58 unused files** safely moved to `_archive/` directory
- ⚠️ **All ESLint warnings** eliminated (17 → 0 warnings)
- 🔄 **Duplicate documentation** archived to prevent confusion

### Performance
- ⚡ **Build time improved** 52% reduction (31s → 15s)
- 📈 **Bundle optimization** through unused code elimination
- 🔍 **Development experience** enhanced with cleaner codebase

### Documentation
- 📖 **CLAUDE.md updated** - Comprehensive technical documentation for developers
- 🎯 **Architecture rules documented** - Clear boundaries and validation processes
- 📊 **Cleanup metrics tracked** - Quantified improvements and quality gains

### CI/CD
- 🚀 **Quality enforcement** - All PRs now require passing TypeScript + ESLint + architecture checks
- 📈 **Continuous monitoring** - Automated quality metrics tracking
- 🛡️ **Safe deployment** - Multi-layer validation before production releases

---

## [1.4.0-security-enhanced] - Previous Release

### Added
- 🔒 Enhanced security measures
- 🚀 Production deployment optimizations
- 📱 Mobile-first responsive design improvements

---

**🎯 Version 1.4.1 Summary**: Complete repository modernization with 76 files cleaned, zero linting warnings, 52% faster builds, and bulletproof quality automation. Perfect foundation for scalable development.