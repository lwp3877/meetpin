export const dynamic='force-dynamic'; export const revalidate=0; export const runtime='nodejs';
export async function GET(){
  const ready=true;
  return new Response(JSON.stringify({ready,t:Date.now()}),{
    status: ready?200:503, headers:{'content-type':'application/json','cache-control':'no-store'}
  });
}