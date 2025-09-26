import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // 캐시 완전 차단 헤더
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0, s-maxage=0, stale-while-revalidate=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  const status = {
    ok: true,
    router: 'Pages Router',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.4.10',
    gitSha: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || 'local',
    buildTime: process.env.BUILD_TIME || new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
    uptime: process.uptime()
  };

  return res.status(200).json(status);
}