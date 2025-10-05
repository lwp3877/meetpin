#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🔧 정밀 수정: unknown 타입 에러 속성 접근 처리\n')

// Get all files with TypeScript errors related to unknown
const output = execSync('pnpm typecheck 2>&1 || true', { cwd: process.cwd() }).toString()
const errorLines = output.split('\n').filter(line => line.includes("'error' is of type 'unknown'") || line.includes("'err' is of type 'unknown'"))

const filesWithErrors = new Set()
errorLines.forEach(line => {
  const match = line.match(/^([^:]+):/)
  if (match) {
    filesWithErrors.add(match[1])
  }
})

console.log(`📊 총 ${filesWithErrors.size}개 파일에 unknown 타입 오류 발견\n`)

let totalFixed = 0

Array.from(filesWithErrors).forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath)
  if (!fs.existsSync(fullPath)) return

  let content = fs.readFileSync(fullPath, 'utf8')
  let modified = false

  // Pattern 1: error.message → (error as Error).message or error instanceof Error check
  // Pattern 2: error.name → (error as Error).name
  // Pattern 3: error.stack → (error as Error).stack

  // More conservative approach: just type-assert when accessing properties
  const patterns = [
    // error.message 패턴
    { from: /(?<!instanceof Error \? )error\.message/g, to: '(error as Error).message' },
    { from: /(?<!instanceof Error \? )err\.message/g, to: '(err as Error).message' },

    // error.name 패턴
    { from: /(?<!instanceof Error \? )error\.name/g, to: '(error as Error).name' },
    { from: /(?<!instanceof Error \? )err\.name/g, to: '(err as Error).name' },

    // error.stack 패턴
    { from: /(?<!instanceof Error \? )error\.stack/g, to: '(error as Error).stack' },
    { from: /(?<!instanceof Error \? )err\.stack/g, to: '(err as Error).stack' },

    // error.errors (Zod errors)
    { from: /(?<!instanceof Error \? )error\.errors/g, to: '(error as any).errors' },
  ]

  patterns.forEach(({ from, to }) => {
    if (content.match(from)) {
      content = content.replace(from, to)
      modified = true
    }
  })

  // Special case: 이미 instanceof Error 체크가 있는 경우는 건너뛰기
  // 이미 logger에서 처리하는 경우도 있음

  if (modified) {
    fs.writeFileSync(fullPath, content, 'utf8')
    console.log(`✓ ${filePath}`)
    totalFixed++
  }
})

console.log(`\n✅ ${totalFixed}개 파일 수정 완료\n`)
console.log('🔍 TypeScript 재검증 중...\n')

try {
  execSync('pnpm typecheck', { cwd: process.cwd(), stdio: 'inherit' })
  console.log('\n✅ TypeScript 검증 통과!')
} catch (error) {
  console.log('\n⚠️  추가 수동 수정 필요')
}
