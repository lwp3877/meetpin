export default function handler(_req:any, res:any){
  res.setHeader('cache-control','no-store');
  res.status(200).json({ ok:true, t: Date.now() });
}