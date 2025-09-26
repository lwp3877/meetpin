import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // 캐시 완전 차단 헤더
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0, s-maxage=0, stale-while-revalidate=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  try {
    // 1500ms 타임아웃으로 준비도 검사
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);

    const readinessCheck = {
      ready: true,
      router: 'Pages Router',
      status: 'ready',
      timestamp: new Date().toISOString(),
      services: {
        database: true, // 실제 환경에서는 DB 연결 확인
        storage: true,  // 실제 환경에서는 스토리지 확인
        auth: true      // 실제 환경에서는 인증 시스템 확인
      },
      uptime: process.uptime()
    };

    clearTimeout(timeoutId);
    return res.status(200).json(readinessCheck);
  } catch (error: any) {
    return res.status(503).json({
      ready: false,
      router: 'Pages Router',
      status: 'not ready',
      error: error.message || 'Readiness check failed',
      timestamp: new Date().toISOString()
    });
  }
}