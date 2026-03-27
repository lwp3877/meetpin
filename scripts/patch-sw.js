/**
 * Patch the generated service worker to fix broken _async_to_generator patterns.
 *
 * @ducanh2912/next-pwa generates an async cacheWillUpdate callback using TypeScript
 * helper functions (_async_to_generator, _ts_generator) that are not defined in
 * the service worker scope. This script replaces it with a synchronous equivalent.
 */

const fs = require('fs')
const path = require('path')

const swPath = path.join(__dirname, '..', 'public', 'sw.js')

if (!fs.existsSync(swPath)) {
  console.log('[patch-sw] sw.js not found, skipping patch')
  process.exit(0)
}

let content = fs.readFileSync(swPath, 'utf8')

// Find and replace the broken _async_to_generator pattern.
// The broken pattern uses async generators just to return a value synchronously.
// We replace it with a plain synchronous function that does exactly the same thing.
const broken = '_async_to_generator(function(){return _ts_generator(this,function(e){return[2,s&&"opaqueredirect"===s.type?new Response(s.body,{status:200,statusText:"OK",headers:s.headers}):s]})})()'
const fixed = 's&&"opaqueredirect"===s.type?new Response(s.body,{status:200,statusText:"OK",headers:s.headers}):s'

if (content.includes(broken)) {
  content = content.replace(broken, fixed)
  fs.writeFileSync(swPath, content, 'utf8')
  console.log('[patch-sw] ✅ Fixed _async_to_generator in sw.js')
} else {
  console.log('[patch-sw] Pattern not found — sw.js may already be correct or format changed')
}
