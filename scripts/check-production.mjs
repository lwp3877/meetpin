import https from "node:https";
const BASE="https://meetpin-weld.vercel.app";
const paths=["/status","/api/healthz","/api/ready"];
const hit=p=>new Promise(r=>{
  const t=Date.now(); https.get(BASE+p,res=>{res.resume(); r({p,code:res.statusCode,ms:Date.now()-t});}).on("error",()=>r({p,code:0,ms:-1}));
});

console.log("🚀 PRODUCTION ENDPOINT CHECK - 10 attempts with 10s intervals");
for(let i=1;i<=10;i++){
  console.log(`\n--- Attempt ${i}/10 ---`);
  const rs=await Promise.all(paths.map(hit));
  console.table(rs);
  if(rs.every(x=>x.code===200)){
    console.log(`✅ SUCCESS on attempt ${i}!`);
    process.exit(0);
  }
  if(i<10) await new Promise(r=>setTimeout(r,10000));
}
console.log("❌ FAILED after 10 attempts");
process.exit(1);