/* src/app/api/healthz/route.ts */

export async function GET(): Promise<Response> {
  return Response.json({
    ok: true,
    ts: Date.now()
  })
}