import http from "node:http";
const BASE="http://localhost:3000";
const paths=["/status","/api/healthz","/api/ready"];
const hit=p=>new Promise(r=>{
  const t=Date.now(); http.get(BASE+p,res=>{res.resume(); r({p,code:res.statusCode,ms:Date.now()-t});}).on("error",()=>r({p,code:0,ms:-1}));
});
(async()=>{ const rs=await Promise.all(paths.map(hit)); console.table(rs); if(!rs.every(x=>x.code===200)) process.exit(1); })();