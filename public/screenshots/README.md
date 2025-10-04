# PWA 스크린샷 생성 가이드

## 필요한 스크린샷

PWA 설치 프롬프트에서 사용될 스크린샷입니다.

### 1. map-view.png
- **크기**: 1170x2532 (iPhone 14 Pro)
- **내용**: 지도에서 모임 찾기 화면
- **경로**: `/map`

### 2. room-detail.png
- **크기**: 1170x2532 (iPhone 14 Pro)
- **내용**: 모임 상세 정보 화면
- **경로**: `/room/[id]`

## 생성 방법

### 방법 1: Playwright 자동 캡처 (권장)

```bash
# 개발 서버 실행
pnpm dev

# 스크린샷 생성 스크립트 실행
pnpm playwright test screenshot --headed
```

### 방법 2: 수동 캡처

1. 브라우저에서 개발자 도구 열기 (F12)
2. Device Toolbar 활성화 (Ctrl+Shift+M)
3. 기기: iPhone 14 Pro (1170x2532)
4. 페이지 캡처:
   - `/map` → map-view.png
   - `/room/[id]` → room-detail.png
5. `public/screenshots/` 폴더에 저장

### 방법 3: Playwright 스크립트 (자동화)

```typescript
// screenshot.spec.ts
import { test } from '@playwright/test';

test('Generate PWA screenshots', async ({ page }) => {
  await page.setViewportSize({ width: 1170, height: 2532 });

  // Map view
  await page.goto('/map');
  await page.waitForLoadState('networkidle');
  await page.screenshot({
    path: 'public/screenshots/map-view.png',
    fullPage: false
  });

  // Room detail (샘플 모임 ID 사용)
  await page.goto('/room/1');
  await page.waitForLoadState('networkidle');
  await page.screenshot({
    path: 'public/screenshots/room-detail.png',
    fullPage: false
  });
});
```

## 이미지 최적화

생성 후 이미지 최적화:

```bash
# TinyPNG 또는 ImageOptim 사용
# 목표: 각 파일 < 500KB
```

## manifest.json 확인

스크린샷 생성 후 manifest.json 경로 확인:

```json
{
  "screenshots": [
    {
      "src": "/screenshots/map-view.png",
      "sizes": "1170x2532",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "지도에서 모임 찾기"
    },
    {
      "src": "/screenshots/room-detail.png",
      "sizes": "1170x2532",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "모임 상세 정보"
    }
  ]
}
```

## 참고

- Google Play Store PWA 제출 시 필수
- App Store는 별도 스크린샷 필요
- 프로덕션 배포 전 생성 권장
