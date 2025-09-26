export default function handler(_req:any, res:any){
  res.setHeader('cache-control','no-store');
  // TODO: 실제 준비도 검사 연결 가능(지금은 true)
  res.status(200).json({ ready:true, t: Date.now() });
}