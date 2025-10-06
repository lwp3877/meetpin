const fs = require('fs')
const path = require('path')

// 사용되지 않는 Supabase 타입 정의 제거
function removeUnusedSupabaseTypes(filePath) {
  let content = fs.readFileSync(filePath, 'utf8')
  let modified = false

  // 사용되지 않는 SupabaseResponse 인터페이스 정의 제거
  const pattern1 = /import type { PostgrestError } from '@supabase\/supabase-js'\s*\n\s*interface SupabaseResponse<T> {\s*\n\s*data: T \| null\s*\n\s*error: PostgrestError \| null\s*\n}\s*\n/g

  if (content.match(pattern1)) {
    content = content.replace(pattern1, '')
    modified = true
  }

  // 빈 줄 중복 제거
  content = content.replace(/\n\n\n+/g, '\n\n')

  return { content, modified }
}

// 재귀적으로 디렉토리 탐색
function walkDir(dir, callback) {
  const files = fs.readdirSync(dir)

  files.forEach(file => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('.next')) {
        walkDir(filePath, callback)
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      if (!file.endsWith('.d.ts')) {
        callback(filePath)
      }
    }
  })
}

let fixedCount = 0

walkDir(path.join(__dirname, '..', 'src'), (file) => {
  const result = removeUnusedSupabaseTypes(file)
  if (result.modified) {
    fs.writeFileSync(file, result.content, 'utf8')
    fixedCount++
    console.log(`✅ Fixed: ${file}`)
  }
})

console.log(`\n📊 Total: ${fixedCount} files fixed`)
