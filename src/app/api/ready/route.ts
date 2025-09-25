export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

export async function GET() {
  const ready = true; // TODO: 실제 준비 조건 연결 가능
  return new Response(JSON.stringify({ ready }), {
    status: ready ? 200 : 503,
    headers: { 'content-type': 'application/json' }
  });
}