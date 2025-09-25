# 📊 MeetPin SLO & Error Budget

## 🎯 Service Level Objectives

### 가용성 (Availability)
- **목표**: 99.9% 월별 가동률
- **측정**: `/api/health` 엔드포인트 응답 기준
- **다운타임 허용**: 월 43.8분 (720시간 × 0.1%)

### 응답 시간 (Response Time)
- **홈페이지**: 95%가 2초 이내
- **API 엔드포인트**: 95%가 500ms 이내
- **지도 렌더링**: 95%가 3초 이내
- **측정**: P95 응답 시간 기준

### 에러율 (Error Rate)
- **목표**: 0.1% 미만 (99.9% 성공률)
- **측정**: 4xx/5xx HTTP 응답 기준
- **제외**: 의도된 에러 (401, 403, 404)

### Core Web Vitals
- **LCP** (Largest Contentful Paint): < 2.5초
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

---

## 🚨 Error Budget & Alerting

### Error Budget 계산
```
월별 Error Budget = (1 - SLO) × 월별 총 요청 수
예: 99.9% SLO → 0.1% error budget
```

### Error Budget 소진 정책

#### 📊 Budget 사용률별 조치

**🟢 0-25% 소진 (정상)**
- 정기 배포 진행
- 새 기능 개발 우선

**🟡 25-50% 소진 (주의)**
- 배포 빈도 50% 감소
- 안정성 개선 작업 우선

**🟠 50-75% 소진 (경고)**
- 새 배포 48시간 중단
- 긴급 핫픽스만 허용
- 근본 원인 분석 시작

**🔴 75-100% 소진 (위험)**
- 모든 배포 중단
- SRE 팀 개입 필요
- Post-mortem 의무화

### 자동 알림 설정

#### Vercel Analytics
```bash
# 응답 시간 임계값
95th percentile > 2s → Slack #alerts

# 에러율 임계값
Error rate > 0.1% → PagerDuty + Slack
```

#### Sentry (활성화된 경우)
```bash
# 에러 급증 감지
Error spike > 10 errors/min → Slack #critical

# 성능 저하 감지
Transaction duration > 5s → Slack #performance
```

#### 스모크 테스트 실패
```bash
# GitHub Actions 스모크 테스트
3회 연속 실패 → PagerDuty + 롤백 고려
```

---

## 📈 SLI (Service Level Indicators) 측정

### 1. 가용성 측정
```bash
# 업타임 체크 (1분 간격)
curl -f https://meetpin-weld.vercel.app/api/livez

# SLI 계산
Availability = Successful Requests / Total Requests × 100
```

### 2. 응답 시간 측정
```bash
# P95 응답 시간 수집
curl -w "%{time_total}" https://meetpin-weld.vercel.app/

# Core Web Vitals (브라우저)
# Real User Monitoring via Vercel Analytics
```

### 3. 에러율 측정
```bash
# HTTP 상태 코드 분포
# 2xx: 성공
# 4xx: 클라이언트 에러 (사용자 오류, SLO에서 제외 가능)
# 5xx: 서버 에러 (SLO 위반)

Error Rate = (4xx + 5xx responses) / Total Requests × 100
```

---

## 🎯 SLO 달성 전략

### 아키텍처 안정성
- **Vercel Edge Network**: 글로벌 CDN으로 지연 시간 최소화
- **Supabase 클러스터**: 자동 백업 및 복제
- **Redis 캐싱**: 응답 시간 단축

### 배포 안정성
```bash
# 품질 게이트 (자동화됨)
pnpm repo:doctor     # 코드 품질
pnpm smoke          # 핵심 기능 검증
pnpm bundle:guard   # 성능 예산
pnpm audit:security # 보안 검증
```

### 모니터링 & 관찰성
- **실시간 알림**: Slack + PagerDuty
- **대시보드**: Vercel Analytics + Sentry
- **로그 분석**: 구조화된 JSON 로깅

---

## 📅 정기 SLO 리뷰

### 주간 리뷰 (매주 월요일)
- [ ] Error Budget 소진율 확인
- [ ] P95 응답 시간 트렌드 분석
- [ ] 에러율 임계값 검토
- [ ] 알림 정확도 평가

### 월별 리뷰 (매월 1일)
- [ ] SLO 달성률 리포트 작성
- [ ] Error Budget 정책 효과 평가
- [ ] SLI 임계값 조정 검토
- [ ] 연간 목표 대비 진행 상황

### 분기별 리뷰 (분기 마지막 주)
- [ ] SLO 목표 적정성 검토
- [ ] 비즈니스 요구사항 변화 반영
- [ ] 기술 스택 변경에 따른 SLI 조정
- [ ] 고객 만족도와 SLO 상관관계 분석

---

**📌 SLO 담당자**: SRE Team
**📅 마지막 업데이트**: 2025-01-28
**🔄 다음 리뷰**: 매주 월요일 09:00