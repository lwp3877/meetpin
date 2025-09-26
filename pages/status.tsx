import { GetServerSideProps } from 'next';
import { useEffect, useState } from 'react';

interface StatusProps {
  initialData: {
    timestamp: string;
    version: string;
    buildTime: string;
    gitSha: string;
    router: string;
  }
}

export default function StatusPage({ initialData }: StatusProps) {
  const [currentTime, setCurrentTime] = useState(new Date().toISOString());

  useEffect(() => {
    // 30초마다 자동 새로고침
    const interval = setInterval(() => {
      const newUrl = window.location.pathname + '?t=' + Date.now();
      window.location.href = newUrl;
    }, 30000);

    // 1초마다 현재 시간 업데이트
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date().toISOString());
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(timeInterval);
    };
  }, []);

  return (
    <main style={{ fontFamily: 'monospace', padding: '20px' }}>
      <h1>🟢 Status OK (Pages Router)</h1>
      <div style={{ marginTop: '20px' }}>
        <p><strong>Router:</strong> {initialData.router}</p>
        <p><strong>Version:</strong> {initialData.version}</p>
        <p><strong>Git SHA:</strong> {initialData.gitSha}</p>
        <p><strong>Build Time:</strong> {initialData.buildTime}</p>
        <p><strong>Page Load:</strong> {initialData.timestamp}</p>
        <p><strong>Current Time:</strong> {currentTime}</p>
        <p><strong>Cache Buster:</strong> {Date.now()}</p>
      </div>
      <div style={{ marginTop: '20px', color: '#888' }}>
        <small>Auto-refresh in 30 seconds...</small>
      </div>
    </main>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  // 캐시 완전 차단
  const res = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0, s-maxage=0, stale-while-revalidate=0',
    'Pragma': 'no-cache',
    'Expires': '0'
  };

  return {
    props: {
      initialData: {
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.4.10',
        buildTime: process.env.BUILD_TIME || new Date().toISOString(),
        gitSha: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || 'local',
        router: 'Pages Router'
      }
    }
  };
};