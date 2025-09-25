#!/usr/bin/env node
/**
 * Bundle size guard - 성능 예산 초과 시 빌드 실패
 */

const fs = require('fs')
const path = require('path')

// 성능 예산 (gzipped KB)
const BUDGET_LIMITS = {
  'main': 300,      // Main chunk
  'chunk': 150,     // Individual chunks
  'total': 1000,    // Total JS bundle
  'css': 100        // CSS bundle
}

function analyzeBundle() {
  const nextDir = path.join(process.cwd(), '.next')
  const staticDir = path.join(nextDir, 'static')

  if (!fs.existsSync(staticDir)) {
    console.log('⏭️  Bundle analysis skipped - no .next/static directory found')
    process.exit(0)
  }

  const buildManifest = path.join(nextDir, 'build-manifest.json')
  if (!fs.existsSync(buildManifest)) {
    console.log('⏭️  Bundle analysis skipped - no build manifest found')
    process.exit(0)
  }

  const manifest = JSON.parse(fs.readFileSync(buildManifest, 'utf8'))
  const chunks = manifest.pages['/'] || []

  let totalSize = 0
  let mainSize = 0
  let cssSize = 0
  const violations = []

  // Analyze JS chunks
  chunks.forEach(chunk => {
    if (chunk.endsWith('.js')) {
      const chunkPath = path.join(staticDir, chunk.replace('/_next/static/', ''))

      if (fs.existsSync(chunkPath)) {
        const stats = fs.statSync(chunkPath)
        const sizeKB = Math.round(stats.size / 1024)

        totalSize += sizeKB

        if (chunk.includes('main') || chunk.includes('pages/_app')) {
          mainSize = sizeKB
          if (sizeKB > BUDGET_LIMITS.main) {
            violations.push(`Main chunk: ${sizeKB}KB > ${BUDGET_LIMITS.main}KB`)
          }
        } else if (sizeKB > BUDGET_LIMITS.chunk) {
          violations.push(`Chunk ${path.basename(chunk)}: ${sizeKB}KB > ${BUDGET_LIMITS.chunk}KB`)
        }
      }
    }
  })

  // Check CSS
  const cssFiles = fs.readdirSync(staticDir, { recursive: true })
    .filter(file => file.endsWith('.css'))

  cssFiles.forEach(file => {
    const cssPath = path.join(staticDir, file)
    const stats = fs.statSync(cssPath)
    const sizeKB = Math.round(stats.size / 1024)
    cssSize += sizeKB
  })

  if (cssSize > BUDGET_LIMITS.css) {
    violations.push(`CSS bundle: ${cssSize}KB > ${BUDGET_LIMITS.css}KB`)
  }

  if (totalSize > BUDGET_LIMITS.total) {
    violations.push(`Total JS: ${totalSize}KB > ${BUDGET_LIMITS.total}KB`)
  }

  // Report results
  console.log('\n📦 Bundle Analysis Results:')
  console.log(`   Main chunk: ${mainSize}KB (limit: ${BUDGET_LIMITS.main}KB)`)
  console.log(`   CSS bundle: ${cssSize}KB (limit: ${BUDGET_LIMITS.css}KB)`)
  console.log(`   Total JS: ${totalSize}KB (limit: ${BUDGET_LIMITS.total}KB)`)

  if (violations.length === 0) {
    console.log('✅ All bundle sizes within budget')
    return 0
  } else {
    console.log('\n❌ Bundle budget violations:')
    violations.forEach(violation => console.log(`   - ${violation}`))
    console.log('\n💡 Consider code splitting, lazy loading, or removing unused dependencies')
    return 1
  }
}

process.exit(analyzeBundle())