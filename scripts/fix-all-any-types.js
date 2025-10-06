const fs = require('fs')
const path = require('path')

// Supabase 응답 타입 정의 추가
const supabaseTypes = `import type { PostgrestError } from '@supabase/supabase-js'

interface SupabaseResponse<T> {
  data: T | null
  error: PostgrestError | null
}
`

function fixAnyTypes(filePath) {
  let content = fs.readFileSync(filePath, 'utf8')
  let modified = false
  let changes = 0

  // 1. Supabase 응답의 any 제거
  const supabaseAnyPattern = /\)\s*as\s*{\s*data:\s*any\s*\|\s*null\s*;\s*error:\s*any\s*}/g
  if (content.match(supabaseAnyPattern)) {
    content = content.replace(supabaseAnyPattern, ') as SupabaseResponse<unknown>')
    changes++
    modified = true
  }

  // 2. { error: any } 패턴
  const errorAnyPattern = /\)\s*as\s*{\s*error:\s*any\s*}/g
  if (content.match(errorAnyPattern)) {
    content = content.replace(errorAnyPattern, ') as { error: PostgrestError | null }')
    changes++
    modified = true
  }

  // 3. 함수 파라미터의 any
  const paramAnyPattern = /\(([\w]+):\s*any\)/g
  if (content.match(paramAnyPattern)) {
    content = content.replace(paramAnyPattern, '($1: unknown)')
    changes++
    modified = true
  }

  // 4. 배열 map의 any
  const mapAnyPattern = /\.map\(\((\w+):\s*any\)\s*=>/g
  if (content.match(mapAnyPattern)) {
    content = content.replace(mapAnyPattern, '.map(($1: Record<string, unknown>) =>')
    changes++
    modified = true
  }

  // 5. reduce의 any accumulator
  const reduceAnyPattern = /\.reduce\(\((\w+):\s*Record<string,\s*number>,\s*(\w+):\s*any\)/g
  if (content.match(reduceAnyPattern)) {
    content = content.replace(reduceAnyPattern, '.reduce(($1: Record<string, number>, $2: Record<string, unknown>)')
    changes++
    modified = true
  }

  // 6. 반환 타입의 any
  const returnAnyPattern = /:\s*any\s*=>\s*{/g
  if (content.match(returnAnyPattern)) {
    content = content.replace(returnAnyPattern, ': unknown => {')
    changes++
    modified = true
  }

  // 7. let/const 변수의 any
  const varAnyPattern = /(let|const)\s+(\w+):\s*any(?!\[)/g
  if (content.match(varAnyPattern)) {
    content = content.replace(varAnyPattern, '$1 $2: unknown')
    changes++
    modified = true
  }

  // 8. any[] 배열 타입
  const arrayAnyPattern = /:\s*any\[\]/g
  if (content.match(arrayAnyPattern)) {
    content = content.replace(arrayAnyPattern, ': Record<string, unknown>[]')
    changes++
    modified = true
  }

  // 9. 인터페이스 속성의 any
  const propAnyPattern = /(\s+)(\w+):\s*any$/gm
  if (content.match(propAnyPattern)) {
    content = content.replace(propAnyPattern, '$1$2: unknown')
    changes++
    modified = true
  }

  // 10. as any 캐스팅 (정당한 사용처만 남기기)
  const asAnyCastPattern = /as\s+any(?!\))/g
  if (content.match(asAnyCastPattern)) {
    content = content.replace(asAnyCastPattern, 'as unknown')
    changes++
    modified = true
  }

  // PostgrestError import 추가 (필요한 경우)
  if (modified && !content.includes('PostgrestError') && !content.includes('SupabaseResponse')) {
    const importMatch = content.match(/^import.*$/m)
    if (importMatch) {
      const insertPos = content.indexOf(importMatch[0]) + importMatch[0].length
      content = content.slice(0, insertPos) + "\nimport type { PostgrestError } from '@supabase/supabase-js'\n\ninterface SupabaseResponse<T> {\n  data: T | null\n  error: PostgrestError | null\n}" + content.slice(insertPos)
    }
  }

  return { content, modified, changes }
}

function processDirectory(dir) {
  let totalFiles = 0
  let totalChanges = 0

  function walk(currentPath) {
    const files = fs.readdirSync(currentPath)

    files.forEach(file => {
      const filePath = path.join(currentPath, file)
      const stat = fs.statSync(filePath)

      if (stat.isDirectory()) {
        if (!file.includes('node_modules') && !file.includes('.next')) {
          walk(filePath)
        }
      } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        if (!file.endsWith('.d.ts') && !file.endsWith('.bak')) {
          const result = fixAnyTypes(filePath)
          if (result.modified) {
            fs.writeFileSync(filePath, result.content, 'utf8')
            totalFiles++
            totalChanges += result.changes
            console.log(`✅ ${filePath.replace(process.cwd(), '.')} - ${result.changes} changes`)
          }
        }
      }
    })
  }

  walk(dir)
  console.log(`\n📊 Total: ${totalFiles} files modified with ${totalChanges} changes`)
}

const srcDir = path.join(__dirname, '..', 'src')
console.log('🔧 Fixing all any types in src/...\n')
processDirectory(srcDir)
