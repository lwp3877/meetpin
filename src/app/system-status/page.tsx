export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function Page() {
  return (
    <main>
      <h1>Status OK</h1>
      <p>build: {process.env.NEXT_PUBLIC_APP_VERSION ?? 'unknown'}</p>
      <meta httpEquiv="refresh" content="30" />
    </main>
  );
}