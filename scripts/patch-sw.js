/**
 * Patch the generated service worker after next-pwa generates it.
 *
 * 1. Fix _async_to_generator: next-pwa compiles async cacheWillUpdate using
 *    TypeScript helpers (_async_to_generator, _ts_generator) that are NOT
 *    defined in the SW scope. The minifier uses arbitrary single-char variable
 *    names each build, so we use a regex instead of an exact string match.
 *
 * 2. Remove Kakao Maps caching: dapi.kakao.com validates the Referer header.
 *    When the SW intercepts and re-fetches, the Referer is altered → Kakao
 *    returns 401. Bypass the SW entirely for Kakao Maps SDK requests.
 */

const fs = require('fs')
const path = require('path')

const swPath = path.join(__dirname, '..', 'public', 'sw.js')

if (!fs.existsSync(swPath)) {
  console.log('[patch-sw] sw.js not found, skipping patch')
  process.exit(0)
}

let content = fs.readFileSync(swPath, 'utf8')
let changed = false

// Patch 1: Fix _async_to_generator
// Regex matches any single-char variable used by the minifier (s, a, t, n, …)
// Pattern: _async_to_generator(function(){return _ts_generator(this,function(<VAR>){return[2,<VAR>&&"opaqueredirect"...
// \w+ (non-capturing) = generator state param (e, t, n, …)
// (\w+) (capturing group 1) = response variable from outer closure (s, a, r, …)
// These can be different chars — we only need the response var name for the fix
const asyncGenRegex = /_async_to_generator\(function\(\)\{return _ts_generator\(this,function\(\w+\)\{return\[2,(\w+)&&"opaqueredirect"===\1\.type\?new Response\(\1\.body,\{status:200,statusText:"OK",headers:\1\.headers\}\):\1\]\}\)\}\)\(\)/g

const match = asyncGenRegex.exec(content)
if (match) {
  const varName = match[1]
  const fixed = `${varName}&&"opaqueredirect"===${varName}.type?new Response(${varName}.body,{status:200,statusText:"OK",headers:${varName}.headers}):${varName}`
  // Reset lastIndex before replacing (g flag)
  asyncGenRegex.lastIndex = 0
  content = content.replace(asyncGenRegex, fixed)
  console.log(`[patch-sw] ✅ Fixed _async_to_generator (variable: ${varName})`)
  changed = true
} else {
  console.log('[patch-sw] _async_to_generator pattern not found (already fixed or different build)')
}

// Patch 2: Remove Kakao Maps caching route (if still present from next.config)
const kakaoRoute = /e\.registerRoute\(\/\^https:\\\/\\\/dapi\\\.kakao\\\.com\\\/\.\*\/i,[^)]+\),"GET"\),/
if (kakaoRoute.test(content)) {
  content = content.replace(kakaoRoute, '')
  console.log('[patch-sw] ✅ Removed Kakao Maps SW caching route')
  changed = true
} else {
  console.log('[patch-sw] Kakao route not found (already removed)')
}

if (changed) {
  fs.writeFileSync(swPath, content, 'utf8')
  console.log('[patch-sw] sw.js patched successfully')
} else {
  console.log('[patch-sw] No changes needed')
}
