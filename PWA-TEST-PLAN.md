# 🧪 PWA 완벽 테스트 계획

**날짜**: 2025-10-02
**테스터**: Claude (프로젝트 책임자)
**환경**: 로컬 프로덕션 빌드

---

## 📋 테스트 체크리스트

### Phase 1: 빌드 & 배포 검증
- [ ] 프로덕션 빌드 성공
- [ ] Service Worker 생성 확인
- [ ] Manifest 파일 생성 확인
- [ ] PWA 아이콘 생성 확인
- [ ] GitHub 푸시 완료
- [ ] Vercel 자동 배포 트리거

### Phase 2: PWA 기본 기능 테스트
- [ ] Manifest.json 접근 가능
- [ ] Service Worker 등록 확인
- [ ] 오프라인 페이지 동작
- [ ] PWA 아이콘 표시
- [ ] 설치 프롬프트 표시

### Phase 3: 설치 테스트
- [ ] Chrome "설치" 버튼 표시
- [ ] 앱 설치 성공
- [ ] 홈 화면 아이콘 생성
- [ ] 독립 실행형 모드 동작
- [ ] 앱 언인스톨

### Phase 4: 오프라인 기능 테스트
- [ ] 오프라인 상태로 전환
- [ ] 캐시된 페이지 로드
- [ ] 오프라인 폴백 표시
- [ ] 온라인 복구 후 정상 동작
- [ ] Service Worker 캐시 확인

### Phase 5: 핵심 앱 기능 테스트
- [ ] 로그인/로그아웃
- [ ] 지도 표시
- [ ] 모임 목록 로드
- [ ] 모임 상세 보기
- [ ] 모임 생성
- [ ] 채팅 기능
- [ ] 알림 기능

### Phase 6: 성능 테스트
- [ ] Lighthouse PWA 점수
- [ ] Lighthouse Accessibility 100
- [ ] 캐시 크기 확인
- [ ] 로딩 속도 측정
- [ ] 메모리 사용량 확인

### Phase 7: E2E 자동화 테스트
- [ ] Jest 유닛 테스트 (60/60)
- [ ] Playwright E2E 테스트
- [ ] 크로스 브라우저 테스트
- [ ] 모바일 디바이스 테스트

---

## 🎯 테스트 결과 (실시간 업데이트)

### 빌드 상태
```
빌드 시간: 진행 중
번들 크기: 측정 예정
Service Worker: 생성 예정
Manifest: 생성 예정
```

### PWA 점수
```
Lighthouse PWA: 측정 예정
Accessibility: 100/100 ✅ (확인됨)
Performance: 측정 예정
Best Practices: 측정 예정
```

### 기능 테스트
```
설치 가능: 테스트 예정
오프라인: 테스트 예정
캐싱: 테스트 예정
알림: 테스트 예정
```

---

## 📝 상세 테스트 시나리오

### Scenario 1: 첫 방문 사용자
```
1. 사용자가 https://meetpin-weld.vercel.app 접속
2. Service Worker 백그라운드 설치
3. 3번째 방문 시 설치 프롬프트 표시
4. "설치하기" 클릭
5. 홈 화면에 아이콘 추가
6. 아이콘 클릭 시 앱모드 실행
```

### Scenario 2: 오프라인 사용
```
1. 앱 정상 사용 (온라인)
2. 네트워크 끄기 (비행기 모드)
3. 캐시된 페이지 정상 표시
4. 새 페이지 접속 시 offline.html 표시
5. 네트워크 복구
6. 자동으로 온라인 모드 전환
```

### Scenario 3: 업데이트 배포
```
1. 개발자가 코드 수정
2. git push
3. Vercel 자동 배포
4. 사용자 첫 방문: 옛날 버전 (캐시)
5. 사용자 두 번째 방문: 새 버전 적용
```

---

## 🛠️ 테스트 명령어

### 로컬 프로덕션 빌드
```bash
pnpm build
pnpm start
# http://localhost:3000
```

### Lighthouse 테스트
```bash
npx lighthouse http://localhost:3000/map \
  --quiet \
  --chrome-flags="--headless" \
  --output=json \
  --output-path=pwa-test-results.json
```

### Service Worker 확인
```javascript
// 브라우저 콘솔
navigator.serviceWorker.getRegistrations()
  .then(regs => console.log('등록된 SW:', regs.length))
```

### 캐시 확인
```javascript
// 브라우저 콘솔
caches.keys()
  .then(names => console.log('캐시 목록:', names))
```

---

## 📊 예상 결과

### 성공 기준
- ✅ Lighthouse PWA: 설치 가능 확인
- ✅ Lighthouse Accessibility: 100/100
- ✅ Service Worker: 정상 등록
- ✅ 오프라인: 정상 동작
- ✅ 설치: Chrome/Edge에서 설치 가능
- ✅ 캐시: 이미지/API 캐싱 동작

### 성능 목표
- 첫 로드: < 3초
- 재방문: < 0.5초 (캐시)
- 캐시 크기: < 50MB
- 메모리: < 200MB

---

## 🐛 알려진 이슈 & 대응

### Issue 1: Vercel 배포 지연
**현상**: 푸시 후 5~10분 배포 소요
**대응**: 로컬 프로덕션 빌드로 선행 테스트
**해결**: Vercel Dashboard에서 배포 상태 확인

### Issue 2: Service Worker 캐시
**현상**: 변경사항이 즉시 반영 안됨
**대응**: Hard Refresh (Ctrl+Shift+R)
**해결**: skipWaiting: true 설정 완료

### Issue 3: iOS Safari 제한
**현상**: iOS에서 beforeinstallprompt 미지원
**대응**: 수동 설치 안내 메시지 표시
**해결**: InstallPrompt 컴포넌트에 iOS 분기 처리 완료

---

## ✅ 테스트 완료 기준

모든 체크리스트 항목이 ✅ 상태가 되면 테스트 완료로 간주:

1. **빌드**: 에러 없이 성공
2. **배포**: Vercel 자동 배포 완료
3. **PWA**: Lighthouse에서 설치 가능 확인
4. **기능**: 모든 핵심 기능 정상 동작
5. **성능**: Lighthouse 점수 목표 달성
6. **E2E**: 자동화 테스트 통과

---

**테스트 진행 중...**
