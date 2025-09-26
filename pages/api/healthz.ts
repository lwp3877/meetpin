import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // 캐시 완전 차단 헤더
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0, s-maxage=0, stale-while-revalidate=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  try {
    // 1500ms 타임아웃으로 빠른 헬스체크
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);

    const healthCheck = {
      ok: true,
      router: 'Pages Router',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage()
    };

    clearTimeout(timeoutId);
    return res.status(200).json(healthCheck);
  } catch (error: any) {
    return res.status(503).json({
      ok: false,
      router: 'Pages Router',
      status: 'unhealthy',
      error: error.message || 'Health check failed',
      timestamp: new Date().toISOString()
    });
  }
}