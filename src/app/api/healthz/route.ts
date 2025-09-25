export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

export async function GET() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 1500);
  try {
    // TODO: 실제 의존성 ping 연결 가능. 없으면 통과.
    clearTimeout(timeout);
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'content-type': 'application/json' }
    });
  } catch (_e) {
    clearTimeout(timeout);
    return new Response(JSON.stringify({ ok: false }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }
}