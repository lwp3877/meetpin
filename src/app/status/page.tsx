export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function StatusPage() {
  const now = Date.now();

  return (
    <main>
      <h1>Status OK</h1>
      <p>build: {process.env.NEXT_PUBLIC_APP_VERSION ?? 'unknown'}</p>
      <p>timestamp: {new Date().toISOString()}</p>
      <p>cache buster: {now}</p>
      <meta httpEquiv="refresh" content="30" />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            setTimeout(() => {
              const newUrl = window.location.pathname + '?t=' + Date.now();
              window.location.href = newUrl;
            }, 30000);
          `
        }}
      />
    </main>
  );
}