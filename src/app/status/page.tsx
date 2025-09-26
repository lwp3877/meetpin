export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function Page() {
  return (
    <main>
      <h1>Status OK</h1>
      <p>{new Date().toISOString()}</p>
      <meta httpEquiv="refresh" content="30" />
    </main>
  );
}