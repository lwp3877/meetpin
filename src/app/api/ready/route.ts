export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

export async function GET() {
  const ready = true; // TODO: 실제 준비도 검사 연결 가능
  return new Response(JSON.stringify({ ready, t: Date.now() }), {
    status: ready ? 200 : 503,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' }
  });
}