/**
 * Patch the generated service worker after next-pwa generates it.
 *
 * 1. Fix _async_to_generator: next-pwa generates async cacheWillUpdate using
 *    TypeScript helpers that are not defined in the SW scope.
 * 2. Remove Kakao Maps caching: the SW intercepts dapi.kakao.com requests and
 *    may alter the Referer header, causing Kakao to return 401. Kakao Maps SDK
 *    must be fetched directly by the browser without SW interception.
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
const broken = '_async_to_generator(function(){return _ts_generator(this,function(e){return[2,s&&"opaqueredirect"===s.type?new Response(s.body,{status:200,statusText:"OK",headers:s.headers}):s]})})()'
const fixed = 's&&"opaqueredirect"===s.type?new Response(s.body,{status:200,statusText:"OK",headers:s.headers}):s'

if (content.includes(broken)) {
  content = content.replace(broken, fixed)
  console.log('[patch-sw] ✅ Fixed _async_to_generator')
  changed = true
} else {
  console.log('[patch-sw] _async_to_generator pattern not found (may already be fixed)')
}

// Patch 2: Remove Kakao Maps caching route
// The SW intercepting dapi.kakao.com requests causes Referer header issues → 401
const kakaoRoute = /e\.registerRoute\(\/\^https:\\\/\\\/dapi\\\.kakao\\\.com\\\/\.\*\/i,[^)]+\),"GET"\),/
if (kakaoRoute.test(content)) {
  content = content.replace(kakaoRoute, '')
  console.log('[patch-sw] ✅ Removed Kakao Maps SW caching route')
  changed = true
} else {
  console.log('[patch-sw] Kakao route not found (may already be removed)')
}

if (changed) {
  fs.writeFileSync(swPath, content, 'utf8')
  console.log('[patch-sw] sw.js patched successfully')
}
