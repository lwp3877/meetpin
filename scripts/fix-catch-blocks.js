#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🔧 수정 중: Catch blocks (error: any → Error)\n')

// Get all files with catch (error: any) or catch (err: any)
const filesWithCatchAny = execSync(
  'grep -rl "catch (error: any)\\|catch (err: any)" src --include="*.ts" --include="*.tsx"',
  { cwd: process.cwd() }
).toString().split('\n').filter(f => f.trim())

let totalFixed = 0

filesWithCatchAny.forEach(filePath => {
  if (!filePath) return

  const fullPath = path.join(process.cwd(), filePath)
  let content = fs.readFileSync(fullPath, 'utf8')
  let modified = false

  // Replace catch (error: any)
  if (content.includes('catch (error: any)')) {
    content = content.replace(/catch \(error: any\)/g, 'catch (error: Error)')
    modified = true
    console.log(`✓ ${filePath} - Fixed catch (error: any)`)
    totalFixed++
  }

  // Replace catch (err: any)
  if (content.includes('catch (err: any)')) {
    content = content.replace(/catch \(err: any\)/g, 'catch (err: Error)')
    modified = true
    console.log(`✓ ${filePath} - Fixed catch (err: any)`)
    totalFixed++
  }

  if (modified) {
    fs.writeFileSync(fullPath, content, 'utf8')
  }
})

console.log(`\n✅ 완료: ${totalFixed}개 파일 수정됨`)
console.log('🔍 TypeScript 검증 중...\n')

try {
  execSync('pnpm typecheck', { cwd: process.cwd(), stdio: 'inherit' })
  console.log('\n✅ TypeScript 검증 통과!')
} catch (error) {
  console.log('\n⚠️ TypeScript 오류 발견 - 수동 수정 필요')
}
