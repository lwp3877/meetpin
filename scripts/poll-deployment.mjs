import https from "node:https";
const PROD_URL = "https://meetpin-weld.vercel.app";
const SAFE_CHECK_PATHS = ["/status", "/api/healthz", "/api/ready"];

const hit = (path) => new Promise(resolve => {
  const start = Date.now();
  https.get(PROD_URL + path, res => {
    res.resume();
    resolve({ path, http: res.statusCode, ms: Date.now() - start });
  }).on("error", () => resolve({ path, http: 0, ms: -1 }));
});

console.log("🚀 Deployment polling: 15s intervals, max 20 attempts");

for (let attempt = 1; attempt <= 20; attempt++) {
  console.log(`\n--- Attempt ${attempt}/20 ---`);

  const results = await Promise.all(SAFE_CHECK_PATHS.map(hit));
  console.table(results);

  const allOK = results.every(r => r.http === 200);
  if (allOK) {
    console.log(`✅ All endpoints 200 OK on attempt ${attempt}!`);
    process.exit(0);
  }

  if (attempt < 20) {
    console.log("⏳ Waiting 15s for next attempt...");
    await new Promise(r => setTimeout(r, 15000));
  }
}

console.log("❌ Deployment verification failed after 20 attempts");
process.exit(1);