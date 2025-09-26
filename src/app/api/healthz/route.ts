export const dynamic='force-dynamic'; export const revalidate=0; export const runtime='nodejs';
export async function GET(){
  return new Response(JSON.stringify({ok:true,t:Date.now()}),{
    status:200, headers:{'content-type':'application/json','cache-control':'no-store'}
  });
}