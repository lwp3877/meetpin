#!/usr/bin/env node

/**
 * MeetPin Architecture Boundary Checker
 * 아키텍처 경계 검사 스크립트
 */

const fs = require('fs')
const path = require('path')

const rules = [
  {
    name: 'API 라우트에서 UI 컴포넌트 import 금지',
    pattern: /src\/app\/api\/.*\.ts$/,
    forbidden: ['@radix-ui/', 'lucide-react', '/components/ui/', '/components/'],
    reason: 'API 라우트는 서버 사이드에서만 실행되므로 UI 컴포넌트를 import하면 안됩니다.'
  },
  {
    name: 'lib 폴더에서 컴포넌트 import 금지',
    pattern: /src\/lib\/.*\.ts$/,
    forbidden: ['/components/', '@radix-ui/', 'lucide-react'],
    reason: 'lib 폴더는 순수 유틸리티 함수만 포함해야 하므로 React 컴포넌트를 import하면 안됩니다.'
  },
  {
    name: ' 클라이언트 컴포넌트에서 서버 전용 패키지 import 금지',
    pattern: /src\/components\/.*\.tsx?$/,
    forbidden: ['server-only', 'ioredis', '@upstash/redis'],
    reason: '클라이언트 컴포넌트에서는 서버 전용 패키지를 사용할 수 없습니다.'
  }
]

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  const violations = []

  for (const rule of rules) {
    if (rule.pattern.test(filePath)) {
      for (const forbidden of rule.forbidden) {
        const importRegex = new RegExp(`import.*['"]([^'"]*${forbidden.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^'"]*)['"]`, 'gm')
        let match
        while ((match = importRegex.exec(content)) !== null) {
          violations.push({
            file: filePath,
            rule: rule.name,
            import: match[1],
            reason: rule.reason,
            line: content.substring(0, match.index).split('\n').length
          })
        }
      }
    }
  }

  return violations
}

function walkDirectory(dir, violations = []) {
  const files = fs.readdirSync(dir)

  for (const file of files) {
    const fullPath = path.join(dir, file)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules' && file !== '_archive') {
      walkDirectory(fullPath, violations)
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      const fileViolations = checkFile(fullPath)
      violations.push(...fileViolations)
    }
  }

  return violations
}

function main() {
  console.log('🏗️  MeetPin 아키텍처 경계 검사 시작...\n')

  const violations = walkDirectory('src')

  if (violations.length === 0) {
    console.log('✅ 모든 아키텍처 규칙을 준수하고 있습니다!')
    console.log('\n📋 검사된 규칙:')
    rules.forEach((rule, index) => {
      console.log(`${index + 1}. ${rule.name}`)
    })
    return
  }

  console.log(`❌ ${violations.length}개의 아키텍처 규칙 위반을 발견했습니다:\n`)

  violations.forEach((violation, index) => {
    console.log(`${index + 1}. ${violation.file}:${violation.line}`)
    console.log(`   규칙: ${violation.rule}`)
    console.log(`   문제: import "${violation.import}"`)
    console.log(`   이유: ${violation.reason}\n`)
  })

  process.exit(1)
}

if (require.main === module) {
  main()
}

module.exports = { checkFile, rules }