#!/usr/bin/env node
/**
 * 베타 해제 자동 검증 스크립트
 *
 * 사용법:
 *   node scripts/verify-beta-release.mjs
 *
 * 검증 항목 (10개):
 *   1. TypeScript 타입 체크 (0 errors)
 *   2. ESLint 검사 (0 warnings)
 *   3. 단위 테스트 통과 (60/60)
 *   4. 프로덕션 빌드 성공
 *   5. BetaBanner 제거 확인
 *   6. Beta→Service 동의 변경 확인
 *   7. Mock 모드 프로덕션 가드 확인
 *   8. API Health 체크
 *   9. 샘플 룸 개수 확인 (최소 10개)
 *  10. 환경변수 검증
 */

import { execSync } from 'child_process';
import https from 'https';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

const SITE_URL = process.env.SITE_URL || 'https://meetpin-weld.vercel.app';
const checks = [];
let failedChecks = 0;

function check(name, fn) {
  checks.push({ name, fn });
}

function pass(message) {
  console.log(`✅ ${message}`);
}

function fail(message) {
  console.error(`❌ ${message}`);
  failedChecks++;
}

function info(message) {
  console.log(`ℹ️  ${message}`);
}

// Check 1: TypeScript 컴파일
check('TypeScript 컴파일', () => {
  try {
    execSync('pnpm typecheck', { stdio: 'pipe', cwd: ROOT });
    pass('TypeScript 컴파일: 0 errors');
  } catch (error) {
    fail('TypeScript 컴파일 실패');
    const output = error.stdout?.toString() || error.stderr?.toString();
    if (output) {
      console.error(output.substring(0, 500));
    }
  }
});

// Check 2: ESLint
check('ESLint', () => {
  try {
    execSync('pnpm lint', { stdio: 'pipe', cwd: ROOT });
    pass('ESLint: 0 warnings');
  } catch (error) {
    fail('ESLint 경고 발견');
  }
});

// Check 3: 단위 테스트
check('Unit Tests', () => {
  try {
    const output = execSync('pnpm test', { stdio: 'pipe', cwd: ROOT }).toString();
    if (output.includes('60 passed') || output.includes('Tests:') && !output.includes('failed')) {
      pass('Unit Tests: All passing');
    } else {
      fail('Unit Tests: 일부 실패');
    }
  } catch (error) {
    fail('Unit Tests 실행 실패');
  }
});

// Check 4: 프로덕션 빌드
check('Production Build', () => {
  try {
    execSync('pnpm build', { stdio: 'pipe', cwd: ROOT });
    pass('Production Build: 성공');
  } catch (error) {
    fail('Production Build 실패');
  }
});

// Check 5: BetaBanner 제거 확인
check('BetaBanner 제거 확인', () => {
  const layoutPath = join(ROOT, 'src/app/layout.tsx');
  const layoutContent = fs.readFileSync(layoutPath, 'utf-8');
  if (layoutContent.includes('BetaBanner')) {
    fail('BetaBanner가 여전히 존재합니다');
    info('Patch 001 적용 필요: git apply patches/001-remove-beta-banner.patch');
  } else {
    pass('BetaBanner 제거 완료');
  }
});

// Check 6: 회원가입 베타 문구 확인
check('회원가입 베타 문구 확인', () => {
  const signupPath = join(ROOT, 'src/app/auth/signup/page.tsx');
  const signupContent = fs.readFileSync(signupPath, 'utf-8');
  if (signupContent.includes('consents.beta')) {
    fail('회원가입 페이지에 beta consent 존재');
    info('Patch 002 적용 필요: git apply patches/002-fix-signup-beta-consent.patch');
  } else if (signupContent.includes('consents.service')) {
    pass('회원가입 service consent로 변경 완료');
  } else {
    fail('회원가입 consent 상태 불명확');
  }
});

// Check 7: Mock 모드 비활성화 확인
check('Mock 모드 설정 확인', () => {
  const flagsPath = join(ROOT, 'src/lib/config/flags.ts');
  const flagsContent = fs.readFileSync(flagsPath, 'utf-8');
  if (flagsContent.includes("process.env.NODE_ENV === 'production'")) {
    pass('Mock 모드 프로덕션 안전장치 추가됨');
  } else {
    fail('Mock 모드 안전장치 미적용');
    info('Patch 003 적용 필요: git apply patches/003-fix-mock-mode-production.patch');
  }
});

// Check 8: API Health Check
check('API Health Check', () => {
  return new Promise((resolve) => {
    const url = new URL(SITE_URL);
    const options = {
      hostname: url.hostname,
      path: '/api/healthz',
      method: 'GET',
      timeout: 10000
    };

    https.get(options, (res) => {
      if (res.statusCode === 200) {
        pass(`API Health: ${SITE_URL}/api/healthz 응답 정상`);
      } else {
        fail(`API Health: HTTP ${res.statusCode}`);
      }
      resolve();
    }).on('error', (error) => {
      fail(`API Health: ${error.message}`);
      info('사이트가 실행 중인지 확인하세요');
      resolve();
    });
  });
});

// Check 9: 샘플 룸 개수 확인
check('샘플 룸 개수 확인', () => {
  return new Promise((resolve) => {
    const url = new URL(SITE_URL);
    const options = {
      hostname: url.hostname,
      path: '/api/rooms?bbox=37.4,126.8,37.7,127.2&limit=100',
      method: 'GET',
      timeout: 10000
    };

    https.get(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const roomCount = parsed.data?.rooms?.length || 0;
          if (roomCount >= 10) {
            pass(`샘플 룸: ${roomCount}개 존재`);
          } else {
            fail(`샘플 룸: ${roomCount}개만 존재 (최소 10개 필요)`);
            info('스크립트 실행: ADMIN_API_KEY=xxx node scripts/seed-production-rooms.mjs');
          }
        } catch (error) {
          fail('샘플 룸 확인 실패: JSON 파싱 오류');
        }
        resolve();
      });
    }).on('error', (error) => {
      fail(`샘플 룸 확인 실패: ${error.message}`);
      resolve();
    });
  });
});

// Check 10: 환경변수 확인
check('환경변수 확인', () => {
  const envPath = join(ROOT, '.env.local');
  if (!fs.existsSync(envPath)) {
    fail('.env.local 파일이 존재하지 않습니다');
    return;
  }

  const envContent = fs.readFileSync(envPath, 'utf-8');
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY'
  ];

  const missing = [];
  for (const varName of requiredVars) {
    if (!envContent.includes(varName)) {
      missing.push(varName);
    }
  }

  if (missing.length === 0) {
    pass('필수 환경변수: 모두 설정됨');
  } else {
    fail(`필수 환경변수 누락: ${missing.join(', ')}`);
    info('.env.local 파일을 확인하세요');
  }

  // Mock 모드 확인
  if (envContent.includes('NEXT_PUBLIC_USE_MOCK_DATA=true')) {
    info('⚠️  .env.local에 NEXT_PUBLIC_USE_MOCK_DATA=true 설정됨 (로컬 개발용)');
    info('Vercel에서는 false로 설정하세요!');
  }
});

// 실행
async function runChecks() {
  console.log('🔍 베타 해제 자동 검증 시작\n');
  console.log('='.repeat(60));
  console.log(`대상 사이트: ${SITE_URL}\n`);

  for (const { name, fn } of checks) {
    console.log(`\n--- ${name} ---`);
    const result = fn();
    if (result instanceof Promise) {
      await result;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`\n📊 검증 결과 요약`);
  console.log(`총 ${checks.length}개 체크 완료`);
  console.log(`성공: ${checks.length - failedChecks}개`);
  console.log(`실패: ${failedChecks}개`);

  if (failedChecks > 0) {
    console.log('\n❌ 베타 해제 준비 미완료');
    console.log('\n수정 후 다시 실행하세요:');
    console.log('  node scripts/verify-beta-release.mjs');
    process.exit(1);
  } else {
    console.log('\n✅ 모든 검증 통과! 베타 해제 준비 완료');
    console.log('\n다음 단계:');
    console.log('  1. git add .');
    console.log('  2. git commit -m "release: remove beta status and prepare for production"');
    console.log('  3. git push origin main');
    console.log('  4. Vercel 환경변수 확인 (NEXT_PUBLIC_USE_MOCK_DATA=false)');
    console.log('  5. Vercel 자동 배포 대기 (~2분)');
    console.log('  6. ADMIN_API_KEY 설정 후 샘플 룸 생성');
    console.log('  7. https://meetpin-weld.vercel.app 접속 확인');
    process.exit(0);
  }
}

runChecks().catch(error => {
  console.error('💥 검증 스크립트 오류:', error);
  process.exit(1);
});
