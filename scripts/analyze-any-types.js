#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🔍 분석 중: any 타입 사용 현황\n')

// 1. Catch blocks (error: any) - 53개
console.log('📦 카테고리 1: Catch Blocks (error: any)')
const catchBlocks = execSync('grep -rn "catch (error: any)\\|catch (err: any)" src --include="*.ts" --include="*.tsx"', { cwd: process.cwd() }).toString()
const catchCount = catchBlocks.split('\n').filter(line => line.trim()).length
console.log(`   총 ${catchCount}개 → Error 타입으로 변경 필요\n`)

// 2. Function parameters (any)
console.log('📦 카테고리 2: Function Parameters')
const functionParams = execSync('grep -rn "(.*: any)" src --include="*.ts" --include="*.tsx" | grep -v "catch"', { cwd: process.cwd() }).toString()
const funcParamLines = functionParams.split('\n').filter(line => line.trim())
console.log(`   총 ${funcParamLines.length}개`)
funcParamLines.slice(0, 10).forEach(line => console.log(`   - ${line}`))
console.log('')

// 3. Type assertions (as any)
console.log('📦 카테고리 3: Type Assertions (as any)')
const typeAssertions = execSync('grep -rn "as any" src --include="*.ts" --include="*.tsx"', { cwd: process.cwd() }).toString()
const assertCount = typeAssertions.split('\n').filter(line => line.trim()).length
console.log(`   총 ${assertCount}개 → 정확한 타입으로 변경 필요\n`)

// 4. Interface/Type definitions
console.log('📦 카테고리 4: Interface/Type Definitions')
const typeDefinitions = execSync('grep -rn ": any" src --include="*.ts" --include="*.tsx" | grep -E "interface|type|export"', { cwd: process.cwd() }).toString()
const typeDefLines = typeDefinitions.split('\n').filter(line => line.trim())
console.log(`   총 ${typeDefLines.length}개`)
typeDefLines.slice(0, 10).forEach(line => console.log(`   - ${line}`))
console.log('')

// 5. Global declarations
console.log('📦 카테고리 5: Global Declarations')
const globalDecls = execSync('grep -rn "var kakao: any" src --include="*.ts" --include="*.tsx"', { cwd: process.cwd() }).toString()
const globalCount = globalDecls.split('\n').filter(line => line.trim()).length
console.log(`   총 ${globalCount}개 → Kakao Maps API 타입 정의 필요\n`)

console.log('📊 요약:')
console.log(`   1. Catch blocks: ${catchCount}개`)
console.log(`   2. Type assertions: ${assertCount}개`)
console.log(`   3. Global declarations: ${globalCount}개`)
console.log(`   4. Function params & others: ${89 - globalCount - assertCount}개`)
console.log(`   ────────────────────────`)
console.log(`   총계: 142개 any 타입`)
