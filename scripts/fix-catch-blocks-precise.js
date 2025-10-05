#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🔧 정밀 수정: Catch blocks (error: any → unknown)\n')
console.log('📚 이유: TypeScript Best Practice')
console.log('   - unknown은 any보다 타입 안전')
console.log('   - error instanceof Error 체크 강제')
console.log('   - 런타임 안정성 향상\n')

// Get all files with catch (error: any) or catch (err: any)
const filesWithCatchAny = execSync(
  'grep -rl "catch (error: any)\\|catch (err: any)" src --include="*.ts" --include="*.tsx"',
  { cwd: process.cwd() }
).toString().split('\n').filter(f => f.trim())

let totalFixed = 0
const changes = []

filesWithCatchAny.forEach(filePath => {
  if (!filePath) return

  const fullPath = path.join(process.cwd(), filePath)
  let content = fs.readFileSync(fullPath, 'utf8')
  let modified = false
  let fileChanges = 0

  // Replace catch (error: any) → catch (error: unknown)
  const errorAnyCount = (content.match(/catch \(error: any\)/g) || []).length
  if (errorAnyCount > 0) {
    content = content.replace(/catch \(error: any\)/g, 'catch (error: unknown)')
    fileChanges += errorAnyCount
    modified = true
  }

  // Replace catch (err: any) → catch (err: unknown)
  const errAnyCount = (content.match(/catch \(err: any\)/g) || []).length
  if (errAnyCount > 0) {
    content = content.replace(/catch \(err: any\)/g, 'catch (err: unknown)')
    fileChanges += errAnyCount
    modified = true
  }

  if (modified) {
    fs.writeFileSync(fullPath, content, 'utf8')
    console.log(`✓ ${filePath} - ${fileChanges}개 수정`)
    totalFixed += fileChanges
    changes.push({ file: filePath, count: fileChanges })
  }
})

console.log(`\n✅ 완료: ${filesWithCatchAny.length}개 파일에서 ${totalFixed}개 수정`)
console.log('\n📊 수정 내역:')
changes.forEach(({ file, count }) => {
  console.log(`   ${file}: ${count}개`)
})

console.log('\n⚠️ 주의: 일부 파일에서 TypeScript 오류가 발생할 수 있습니다.')
console.log('   이유: error.message 접근 시 타입 체크 필요')
console.log('   해결: if (error instanceof Error) 추가\n')
