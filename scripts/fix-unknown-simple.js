#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🔧 Unknown 타입 에러 일괄 수정\n')

// Get all TS/TSX files with unknown type errors
const tsFiles = execSync('find src -name "*.ts" -o -name "*.tsx"', { cwd: process.cwd() }).toString().split('\n').filter(f => f.trim())
const files = tsFiles

let totalFixed = 0
let filesModified = 0

files.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath)
  let content = fs.readFileSync(fullPath, 'utf8')
  let modified = false

  // 1. Simple property access on error/err (when not already checking instanceof)
  //    error.message → (error instanceof Error ? error.message : String(error))
  //    error.stack → (error instanceof Error ? error.stack : undefined)
  //    error.name → (error instanceof Error ? error.name : 'Error')

  // But we need to be careful not to duplicate checks that already exist
  // Simpler approach: just use type assertion for now

  // Match: error.message (not after instanceof check)
  const errorMessagePattern = /\berror\.message\b(?!\s*:)/g
  if (content.match(errorMessagePattern)) {
    // Check if line already has instanceof check
    const lines = content.split('\n')
    let newLines = []
    lines.forEach(line => {
      if (line.includes('error.message') && !line.includes('instanceof Error')) {
        line = line.replace(/\berror\.message\b/g, '(error as Error).message')
      }
      newLines.push(line)
    })
    content = newLines.join('\n')
    modified = true
  }

  // Match: err.message
  const errMessagePattern = /\berr\.message\b(?!\s*:)/g
  if (content.match(errMessagePattern)) {
    const lines = content.split('\n')
    let newLines = []
    lines.forEach(line => {
      if (line.includes('err.message') && !line.includes('instanceof Error')) {
        line = line.replace(/\berr\.message\b/g, '(err as Error).message')
      }
      newLines.push(line)
    })
    content = newLines.join('\n')
    modified = true
  }

  // Match: error.stack
  const errorStackPattern = /\berror\.stack\b/g
  if (content.match(errorStackPattern)) {
    const lines = content.split('\n')
    let newLines = []
    lines.forEach(line => {
      if (line.includes('error.stack') && !line.includes('instanceof Error') && !line.includes('as Error')) {
        line = line.replace(/\berror\.stack\b/g, '(error as Error).stack')
      }
      newLines.push(line)
    })
    content = newLines.join('\n')
    modified = true
  }

  // Match: error.name
  const errorNamePattern = /\berror\.name\b/g
  if (content.match(errorNamePattern)) {
    const lines = content.split('\n')
    let newLines = []
    lines.forEach(line => {
      if (line.includes('error.name') && !line.includes('instanceof Error') && !line.includes('as Error') && !line.includes('as any')) {
        line = line.replace(/\berror\.name\b/g, '(error as Error).name')
      }
      newLines.push(line)
    })
    content = newLines.join('\n')
    modified = true
  }

  // Match: error.status (custom property, needs any)
  const errorStatusPattern = /\berror\.status\b/g
  if (content.match(errorStatusPattern)) {
    content = content.replace(errorStatusPattern, '(error as any).status')
    modified = true
  }

  // Match: error.errors (Zod errors)
  const errorErrorsPattern = /\berror\.errors\b/g
  if (content.match(errorErrorsPattern)) {
    const lines = content.split('\n')
    let newLines = []
    lines.forEach(line => {
      if (line.includes('error.errors') && !line.includes('as any')) {
        line = line.replace(/\berror\.errors\b/g, '(error as any).errors')
      }
      newLines.push(line)
    })
    content = newLines.join('\n')
    modified = true
  }

  if (modified) {
    fs.writeFileSync(fullPath, content, 'utf8')
    filesModified++
    console.log(`✓ ${filePath}`)
  }
})

console.log(`\n✅ ${filesModified}개 파일 수정 완료`)
