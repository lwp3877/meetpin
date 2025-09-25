# 🚀 밋핀 SRE 운영 런북

## 📋 개요

이 문서는 밋핀(MeetPin) 서비스의 SRE(Site Reliability Engineering) 운영을 위한 포괄적인 가이드입니다.

### 서비스 아키텍처 요약

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase PostgreSQL, Auth, Realtime, Storage
- **CDN/Hosting**: Vercel Edge Network
- **Cache**: Redis (ioredis) - 3개 핵심 엔드포인트
- **External APIs**: Kakao Maps, Stripe Payments
- **Monitoring**: 자체 구현 건상 체크 시스템 + Sentry (opt-in)
- **Security**: CSP, HSTS, X-Frame-Options, audit pipeline

---

## 🏥 건상 체크 및 모니터링

### 1. 핵심 건상 체크 엔드포인트

#### 🟢 Live Probe - `/api/livez`

**용도**: Kubernetes/Docker 컨테이너 라이브니스 프로브

```bash
curl -f https://meetpin-weld.vercel.app/api/livez
# Expected: 200 OK with JSON {"status": "ok", "timestamp": "..."}
```

#### 🟢 Ready Probe - `/api/readyz`

**용도**: 트래픽 수신 준비 상태 확인

```bash
curl -f https://meetpin-weld.vercel.app/api/readyz
# Expected: 200 OK with external dependencies check
```

#### 🔍 Health Check - `/api/health`

**용도**: 포괄적 시스템 건상 진단

```bash
curl -s https://meetpin-weld.vercel.app/api/health | jq .
```

**응답 예시**:

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 86400,
  "services": {
    "database": { "status": "healthy", "responseTime": 45 },
    "redis": { "status": "healthy", "keyCount": 1234 },
    "kakaoMaps": { "status": "healthy", "responseTime": 120 },
    "stripe": { "status": "healthy", "responseTime": 80 }
  },
  "performance": {
    "avgResponseTime": 89,
    "requestCount": 15420,
    "errorRate": 0.002
  }
}
```

### 2. 모니터링 대시보드 - `/api/monitoring`

**관리자 전용** 종합 모니터링 정보:

```bash
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  https://meetpin-weld.vercel.app/api/monitoring
```

**포함 메트릭**:

- 시스템 성능 지표
- 에러율 및 응답 시간
- 데이터베이스 연결 상태
- Redis 캐시 효율성
- 외부 API 응답 시간

---

## 🚨 장애 대응 런북

### Incident Response Process

#### 1단계: 장애 감지 및 분류

```bash
# 1. 기본 건상 체크
curl -f https://meetpin-weld.vercel.app/api/health

# 2. 각 서비스별 개별 체크
curl -f https://meetpin-weld.vercel.app/api/healthz  # 기본 앱 상태
curl -f https://meetpin-weld.vercel.app/api/readyz   # 의존성 포함
```

#### 2단계: 서비스별 장애 진단

##### 🗄️ 데이터베이스 장애

**증상**:

- `/api/health`에서 database status가 `unhealthy`
- API 응답이 500 에러 반환

**진단 명령**:

```bash
# Supabase 대시보드 확인
open https://supabase.com/dashboard/project/$PROJECT_ID

# 연결 테스트
curl -s https://meetpin-weld.vercel.app/api/health | jq '.services.database'
```

**복구 절차**:

1. Supabase 상태 페이지 확인: https://status.supabase.com
2. 연결 풀 재시작 (자동 재시도 메커니즘 내장)
3. 필요시 Supabase 지원팀 연락

##### ⚡ Redis 캐시 장애

**증상**:

- API 응답 속도 저하 (캐시 미스)
- `/api/cache/stats`에서 연결 실패

**진단 명령**:

```bash
# Redis 상태 확인 (관리자 전용)
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  https://meetpin-weld.vercel.app/api/cache/stats
```

**복구 절차**:

1. Redis 연결 상태 확인
2. 캐시 무효화 고려 (서비스는 DB fallback으로 정상 동작)
3. Redis 재시작 (클라우드 제공업체 대시보드)

##### 🗺️ Kakao Maps API 장애

**증상**:

- 지도 로딩 실패
- 위치 검색 기능 중단

**진단 명령**:

```bash
# Kakao API 직접 테스트
curl "https://dapi.kakao.com/v2/local/search/keyword.json?query=cafe" \
  -H "Authorization: KakaoAK $KAKAO_API_KEY"
```

**복구 절차**:

1. Kakao Developers 상태 확인
2. API 키 및 도메인 설정 확인
3. 백업 지도 서비스로 전환 (구현 필요)

##### 💳 Stripe 결제 장애

**증상**:

- 부스트 결제 실패
- 웹훅 처리 중단

**진단 명령**:

```bash
# Stripe API 상태 확인
curl https://api.stripe.com/v1/charges \
  -u $STRIPE_SECRET_KEY:
```

**복구 절차**:

1. Stripe 대시보드에서 이벤트 로그 확인
2. 웹훅 엔드포인트 재등록
3. 실패한 결제 수동 처리

#### 3단계: 성능 이슈 진단

##### 📊 응답 시간 증가

```bash
# Web Vitals 확인
curl -s https://meetpin-weld.vercel.app/api/telemetry/web-vitals

# 성능 메트릭 분석
# Core Web Vitals 임계값:
# - LCP (Largest Contentful Paint): < 2.5s
# - FID (First Input Delay): < 100ms
# - CLS (Cumulative Layout Shift): < 0.1
```

##### 🔄 메모리/리소스 이슈

```bash
# Vercel Analytics 확인
vercel analytics --project meetpin

# 번들 사이즈 분석
pnpm analyze:bundle
```

---

## 🚑 장애 30분 내 복구 절차 (Emergency Rollback)

### ⚡ 즉시 롤백 프로세스

#### 1단계: 장애 확인 및 의사결정 (2분)

```bash
# 빠른 서비스 상태 체크
curl -I https://meetpin-weld.vercel.app/api/health
curl -I https://meetpin-weld.vercel.app/

# 장애 심각도 판단:
# - 5xx 에러 또는 응답 없음: 즉시 롤백
# - 기능 일부 장애: 5분 내 핫픽스 시도, 실패 시 롤백
# - 성능 저하: 모니터링 후 판단
```

#### 2단계: Vercel 즉시 롤백 (5분)

```bash
# 방법 1: Vercel Dashboard 롤백 (가장 빠름)
# 1. vercel.com → meetpin project → Deployments
# 2. 마지막 정상 배포 선택 → "Promote to Production"
# 3. 확인 후 배포 (1-3분)

# 방법 2: CLI 롤백 (백업 방법)
vercel --prod --confirm
# 또는 특정 배포로
vercel promote <deployment-url> --scope=meetpin
```

#### 3단계: 데이터베이스 롤백 가드 (5분)

```bash
# ⚠️ DB 마이그레이션이 포함된 경우에만 필요
# Supabase 콘솔에서 스키마 변경 확인

# 마이그레이션 롤백이 필요한 경우:
# 1. Supabase Dashboard → SQL Editor
# 2. 해당 마이그레이션의 rollback SQL 실행
# 3. RLS 정책 재적용 확인

# 롤백 SQL 예시 (사전에 각 마이그레이션별로 준비)
# DROP TABLE IF EXISTS new_table;
# ALTER TABLE existing_table DROP COLUMN new_column;
```

#### 4단계: 캐시 무효화 (2분)

```bash
# CDN 캐시 무효화 (Vercel 자동, 확인용)
# Redis 캐시 클리어 (필요한 경우)
curl -X POST https://meetpin-weld.vercel.app/api/cache/clear \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 브라우저 캐시 강제 무효화를 위한 빌드 태그 확인
# buildBuster.ts 업데이트 후 재배포된 상태인지 확인
```

#### 5단계: 서비스 검증 및 모니터링 (5분)

```bash
# 핵심 기능 스모크 테스트
pnpm smoke
# 또는 수동 체크:
# 1. 홈페이지 로딩
# 2. 로그인 기능
# 3. 방 생성/조회
# 4. 지도 렌더링

# 헬스체크 재확인
curl https://meetpin-weld.vercel.app/api/health
curl https://meetpin-weld.vercel.app/api/livez

# 성능 메트릭 체크 (Core Web Vitals)
# Vercel Analytics에서 즉시 확인
```

#### 6단계: 후속 조치 (10분)

```bash
# 장애 보고서 작성
echo "$(date): Rollback completed" >> incidents/$(date +%Y%m%d_%H%M).md

# 모니터링 강화 (Sentry alerts, 로그 확인)
# 근본 원인 분석 계획 수립
# 포스트모템 스케줄 (24-48시간 내)
```

### 🛡️ 롤백 방지 가드

#### 안전한 배포 파이프라인

```bash
# CI/CD에서 자동 검증 (이미 적용됨):
# 1. TypeScript 컴파일 (0 에러)
# 2. ESLint (0 경고)
# 3. Security audit (moderate+ 차단)
# 4. Bundle size guard (300KB limit)
# 5. Architecture boundaries
# 6. 스모크 테스트 4단계
# 7. Sentry 소스맵 업로드
```

#### 배포 전 체크리스트

```bash
# 로컬에서 전체 검증
pnpm repo:doctor        # 품질 종합 체크
pnpm smoke             # 핵심 기능 동작 확인
pnpm bundle:guard      # 번들 사이즈 확인
pnpm audit:security    # 보안 취약점 확인

# 배포 후 필수 확인 (5분)
curl -f https://meetpin-weld.vercel.app/api/health
curl -f https://meetpin-weld.vercel.app/
# 실제 브라우저에서 핵심 기능 1회 테스트
```

---

## 🎛️ 운영 도구 및 명령어

### 개발 환경 관리

```bash
# 전체 품질 검사 (SRE 필수)
pnpm repo:doctor  # typecheck + lint + arch + build

# 보안 검사
pnpm audit:security  # moderate+ 취약점 감지

# 성능 검사
pnpm bundle:guard    # 번들 사이즈 가드
pnpm perf:baseline   # 성능 기준선 설정

# 성능 비교 분석
pnpm perf:compare

# 번들 분석
pnpm analyze:bundle
```

### 배포 전 체크리스트

```bash
# 1. 코드 품질 검증
pnpm qa:validate    # typecheck + lint + build + test

# 2. E2E 테스트 실행
pnpm qa:local       # 로컬 환경
pnpm qa:production  # 프로덕션 환경

# 3. 전체 QA 파이프라인
pnpm qa:full        # 모든 검증 + 테스트
```

### 캐시 관리

```bash
# Redis 캐시 통계 확인 (관리자)
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  https://meetpin-weld.vercel.app/api/cache/stats

# 특정 캐시 패턴 무효화 (코드 레벨)
# Redis 클라이언트를 통해 수동 실행 가능:
# - rooms:* (방 목록 캐시)
# - messages:* (메시지 캐시)
# - notifications:* (알림 캐시)
```

---

## 📈 성능 최적화 가이드

### 1. 번들 크기 모니터링

**목표**:

- 초기 JS ≤ 230KB
- 총 JS ≤ 500KB
- CSS ≤ 50KB

**검증 방법**:

```bash
pnpm build
# 출력에서 "First Load JS" 값 확인
# Homepage: 113KB ✅
# Map page: 205KB ✅
```

### 2. Redis 캐시 최적화

**현재 구현된 캐시**:

- `/api/rooms` (1분 TTL)
- `/api/matches/[id]/messages` (30초 TTL)
- `/api/notifications` (1분 TTL)

**캐시 효율성 모니터링**:

```bash
# 캐시 히트율 확인
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  https://meetpin-weld.vercel.app/api/cache/stats
```

### 3. 동적 로딩 최적화

**이미 구현된 최적화**:

- Kakao Maps SDK 동적 로딩
- Enhanced Landing 페이지 동적 로딩
- Lucide-react 트리 쉐이킹 (next.config.ts)

---

## 🔐 보안 운영 가이드

### CSP 모니터링

```bash
# CSP 리포트 확인
curl -s https://meetpin-weld.vercel.app/api/security/csp-report
```

### Rate Limiting 상태

- API 호출: 100/분 per IP
- 방 생성: 5/분 per 사용자
- 인증 시도: 5/15분 per IP
- 메시지 전송: 50/분 per 사용자

### 환경변수 보안 검증

```bash
# 개발 환경에서 환경변수 검증
node scripts/validate-env.js
```

---

## 📊 알림 및 에스컬레이션

### 1단계 알림 (자동)

- 응답 시간 > 3초
- 에러율 > 1%
- 데이터베이스 연결 실패

### 2단계 알림 (Critical)

- 서비스 완전 중단
- 데이터 손실 위험
- 보안 이슈 감지

### 에스컬레이션 체인

1. **On-call SRE** (1차 대응, 15분 내)
2. **팀 리드** (30분 후 자동 에스컬레이션)
3. **CTO** (1시간 후 Critical 이슈)

---

## 🔧 유지보수 및 업데이트

### 정기 유지보수 (주간)

```bash
# 1. 의존성 보안 업데이트
pnpm audit

# 2. 데이터베이스 정리
# /api/cron/cleanup-expired-boosts
# /api/cron/cleanup-old-notifications

# 3. 캐시 최적화 리뷰
# Redis 메모리 사용량 및 키 개수 모니터링

# 4. 성능 리포트 생성
pnpm perf:baseline && pnpm perf:compare
```

### 월간 리뷰 (Monthly)

- 로그 분석 및 패턴 식별
- 용량 계획 (Capacity Planning)
- 보안 감사 및 취약점 스캔
- 백업 및 복구 절차 테스트

---

## 📞 연락처 및 리소스

### 외부 서비스 지원

- **Vercel**: https://vercel.com/support
- **Supabase**: https://supabase.com/support
- **Stripe**: https://support.stripe.com
- **Kakao**: https://devtalk.kakao.com

### 내부 연락처

- **SRE 팀**: sre@meetpin.com
- **개발팀**: dev@meetpin.com
- **보안팀**: security@meetpin.com

### 대시보드 링크

- **Vercel Analytics**: https://vercel.com/analytics
- **Supabase Dashboard**: https://supabase.com/dashboard
- **Stripe Dashboard**: https://dashboard.stripe.com

---

## 📚 추가 문서

- [성능 최적화 가이드](./PERFORMANCE_OPTIMIZATION.md)
- [보안 가이드](./SECURITY_GUIDE.md)
- [배포 가이드](./PRODUCTION_DEPLOYMENT_CHECKLIST.md)
- [API 문서](./API_DOCUMENTATION.md)

---

_이 문서는 밋핀 서비스의 안정성과 성능을 보장하기 위해 지속적으로 업데이트됩니다._
