#!/usr/bin/env node
/**
 * 프로덕션 환경 샘플 룸 자동 생성 스크립트
 *
 * 사용법:
 *   ADMIN_API_KEY=xxx node scripts/seed-production-rooms.mjs
 *
 * 환경변수:
 *   - SITE_URL: 배포된 사이트 URL (기본: https://meetpin-weld.vercel.app)
 *   - ADMIN_API_KEY: 관리자 API 키 (필수)
 *   - ROOM_COUNT: 생성할 룸 개수 (기본: 10)
 */

import https from 'https';

const SITE_URL = process.env.SITE_URL || 'https://meetpin-weld.vercel.app';
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;
const ROOM_COUNT = parseInt(process.env.ROOM_COUNT || '10', 10);

if (!ADMIN_API_KEY) {
  console.error('❌ ADMIN_API_KEY 환경변수가 필요합니다');
  console.error('');
  console.error('사용법:');
  console.error('  ADMIN_API_KEY=your-key node scripts/seed-production-rooms.mjs');
  console.error('');
  console.error('Vercel 환경변수 설정:');
  console.error('  1. Vercel 대시보드 > Settings > Environment Variables');
  console.error('  2. ADMIN_API_KEY 추가 (Production)');
  console.error('  3. 임의의 긴 문자열 생성 (예: openssl rand -base64 32)');
  process.exit(1);
}

/**
 * Bot API를 호출하여 샘플 룸 생성
 */
function createBotRooms(count = 10) {
  return new Promise((resolve, reject) => {
    const url = new URL(SITE_URL);
    const options = {
      hostname: url.hostname,
      port: url.protocol === 'https:' ? 443 : 80,
      path: `/api/bot/generate?count=${count}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ADMIN_API_KEY}`
      }
    };

    const protocol = url.protocol === 'https:' ? https : require('http');
    const req = protocol.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode === 200 || res.statusCode === 201) {
            resolve(parsed);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${parsed.message || data}`));
          }
        } catch (error) {
          reject(new Error(`JSON parse error: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Network error: ${error.message}`));
    });

    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Request timeout (30s)'));
    });

    req.end();
  });
}

/**
 * 기존 룸 개수 확인
 */
function checkExistingRooms() {
  return new Promise((resolve, reject) => {
    const url = new URL(SITE_URL);
    const options = {
      hostname: url.hostname,
      port: url.protocol === 'https:' ? 443 : 80,
      path: '/api/rooms?bbox=37.4,126.8,37.7,127.2&limit=100',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const protocol = url.protocol === 'https:' ? https : require('http');
    const req = protocol.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode === 200) {
            resolve(parsed.data?.rooms?.length || 0);
          } else {
            resolve(0); // 에러 시 0으로 간주
          }
        } catch (error) {
          resolve(0);
        }
      });
    });

    req.on('error', () => resolve(0));
    req.setTimeout(10000, () => {
      req.destroy();
      resolve(0);
    });

    req.end();
  });
}

async function main() {
  console.log('🤖 프로덕션 샘플 룸 생성 시작...\n');
  console.log(`📍 대상 사이트: ${SITE_URL}`);
  console.log(`🎯 생성 목표: ${ROOM_COUNT}개\n`);

  try {
    // 1. 기존 룸 개수 확인
    console.log('1️⃣  기존 룸 개수 확인 중...');
    const existingCount = await checkExistingRooms();
    console.log(`   현재 ${existingCount}개 룸 존재\n`);

    if (existingCount >= ROOM_COUNT) {
      console.log(`✅ 이미 충분한 샘플 룸이 존재합니다 (${existingCount}개)`);
      console.log('   추가 생성이 필요하지 않습니다.');
      return;
    }

    // 2. 부족한 만큼만 생성
    const needed = ROOM_COUNT - existingCount;
    console.log(`2️⃣  ${needed}개 룸 생성 중...`);

    const result = await createBotRooms(needed);

    if (result.ok) {
      const generatedCount = result.data.generated || result.data.rooms?.length || 0;
      console.log(`\n✅ 성공: ${generatedCount}개 룸 생성 완료!`);
      console.log(`📍 총 ${existingCount + generatedCount}개 룸 운영 중`);

      // API가 rooms 배열을 반환하는 경우
      if (result.data.rooms && result.data.rooms.length > 0) {
        console.log(`\n📋 생성된 룸 정보:`);
        result.data.rooms.forEach((room, index) => {
          console.log(`   ${index + 1}. ${room.title} (${room.category}) - ${room.location}`);
        });
      }
    } else {
      throw new Error(result.message || 'Unknown error');
    }

  } catch (error) {
    console.error(`\n❌ 실패: ${error.message}`);
    console.error('');
    console.error('문제 해결 방법:');
    console.error('  1. ADMIN_API_KEY 환경변수가 정확한지 확인');
    console.error('  2. /api/bot/generate 엔드포인트가 활성화되어 있는지 확인');
    console.error('  3. Supabase 연결 상태 확인');
    console.error('  4. 네트워크 연결 확인');
    process.exit(1);
  }
}

// 스크립트 실행
main().catch((error) => {
  console.error('💥 예상치 못한 오류:', error);
  process.exit(1);
});
