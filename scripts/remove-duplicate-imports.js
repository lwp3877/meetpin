const fs = require('fs')
const path = require('path')

// 잘못 삽입된 Supabase import와 interface 정의 제거
function removeWrongImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8')
  let modified = false

  // 잘못된 패턴: import 문 안에 타입 정의가 들어간 경우
  const wrongPattern = /import\s*{\s*import\s+type\s+{\s*PostgrestError\s*}\s+from\s+'@supabase\/supabase-js'\s*\n\s*interface\s+SupabaseResponse<T>\s*{\s*\n\s*data:\s*T\s*\|\s*null\s*\n\s*error:\s*PostgrestError\s*\|\s*null\s*\n\s*}\s*/g

  if (content.match(wrongPattern)) {
    content = content.replace(wrongPattern, '')
    modified = true
  }

  // 중복된 SupabaseResponse 정의 제거
  const duplicatePattern = /import\s+type\s+{\s*PostgrestError\s*}\s+from\s+'@supabase\/supabase-js'\s*\n\s*interface\s+SupabaseResponse<T>\s*{\s*\n\s*data:\s*T\s*\|\s*null\s*\n\s*error:\s*PostgrestError\s*\|\s*null\s*\n\s*}\s*\n/g

  const matches = content.match(duplicatePattern)
  if (matches && matches.length > 1) {
    // 첫 번째만 남기고 나머지 제거
    let first = true
    content = content.replace(duplicatePattern, (match) => {
      if (first) {
        first = false
        return match
      }
      modified = true
      return ''
    })
  }

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
  const result = removeWrongImports(file)
  if (result.modified) {
    fs.writeFileSync(file, result.content, 'utf8')
    fixedCount++
    console.log(`✅ Fixed: ${file}`)
  }
})

console.log(`\n📊 Total: ${fixedCount} files fixed`)
