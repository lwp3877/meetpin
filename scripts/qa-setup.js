#!/usr/bin/env node
/* 파일경로: scripts/qa-setup.js */
// 🎯 QA 자동화 시스템 설정 스크립트

const fs = require('fs')
const path = require('path')

console.log('🚀 QA 자동화 시스템 설정 시작...')

// package.json에 QA 관련 스크립트 추가
const packageJsonPath = path.join(__dirname, '..', 'package.json')
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))

// QA 관련 스크립트 추가
const qaScripts = {
  'qa:local': 'playwright test --config=playwright.config.ts',
  'qa:production':
    'TEST_URL=https://meetpin-weld.vercel.app playwright test e2e/production-quick-test.spec.ts',
  'qa:detailed':
    'TEST_URL=https://meetpin-weld.vercel.app playwright test e2e/detailed-production-test.spec.ts',
  'qa:performance': 'playwright test e2e/performance-security.spec.ts --project=chromium',
  'qa:mobile': 'playwright test --project=mobile-chrome --project=mobile-safari',
  'qa:report': 'playwright show-report',
  'qa:setup': 'node scripts/qa-setup.js && playwright install',
  'qa:validate': 'pnpm typecheck && pnpm lint && pnpm build && pnpm test',
  'qa:full': 'pnpm qa:validate && pnpm qa:local && pnpm qa:production',
}

Object.assign(packageJson.scripts, qaScripts)

// devDependencies에 QA 도구 추가 확인
const qaDevDeps = {
  '@axe-core/playwright': '^4.8.5',
  lighthouse: '^11.4.0',
  'wait-on': '^7.2.0',
}

if (!packageJson.devDependencies) {
  packageJson.devDependencies = {}
}

let newDepsAdded = false
Object.entries(qaDevDeps).forEach(([pkg, version]) => {
  if (!packageJson.devDependencies[pkg]) {
    packageJson.devDependencies[pkg] = version
    newDepsAdded = true
    console.log(`➕ 추가됨: ${pkg}@${version}`)
  }
})

// package.json 업데이트
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n')
console.log('✅ package.json 업데이트 완료')

// .gitignore에 QA 관련 항목 추가
const gitignorePath = path.join(__dirname, '..', '.gitignore')
const gitignoreAdditions = [
  '# QA Automation Results',
  'playwright-report/',
  'test-results/',
  'lighthouse-results/',
  '.nyc_output/',
  'coverage/',
  '*.log',
]

let gitignoreContent = ''
if (fs.existsSync(gitignorePath)) {
  gitignoreContent = fs.readFileSync(gitignorePath, 'utf8')
}

let gitignoreUpdated = false
gitignoreAdditions.forEach(line => {
  if (!gitignoreContent.includes(line)) {
    gitignoreContent += '\n' + line
    gitignoreUpdated = true
  }
})

if (gitignoreUpdated) {
  fs.writeFileSync(gitignorePath, gitignoreContent + '\n')
  console.log('✅ .gitignore 업데이트 완료')
}

// QA 설정 완료 메시지
console.log('\n🎉 QA 자동화 시스템 설정 완료!')
console.log('\n📋 사용 가능한 QA 명령어:')
console.log('  pnpm qa:setup      - QA 환경 초기 설정')
console.log('  pnpm qa:validate   - 코드 품질 검증')
console.log('  pnpm qa:local      - 로컬 E2E 테스트')
console.log('  pnpm qa:production - 프로덕션 스모크 테스트')
console.log('  pnpm qa:detailed   - 상세 프로덕션 테스트')
console.log('  pnpm qa:performance- 성능 및 보안 테스트')
console.log('  pnpm qa:mobile     - 모바일 크로스 브라우저 테스트')
console.log('  pnpm qa:full       - 전체 QA 파이프라인 실행')
console.log('  pnpm qa:report     - 테스트 결과 보고서 보기')

if (newDepsAdded) {
  console.log('\n⚠️  새로운 의존성이 추가되었습니다. 다음 명령어를 실행하세요:')
  console.log('   pnpm install')
}

console.log('\n🔗 추가 설정:')
console.log('  - GitHub Actions에서 자동화된 QA 파이프라인이 활성화됩니다')
console.log('  - Vercel 배포 시마다 자동으로 프로덕션 테스트가 실행됩니다')
console.log('  - PR 생성 시 QA 결과가 자동으로 코멘트로 추가됩니다')

process.exit(0)
