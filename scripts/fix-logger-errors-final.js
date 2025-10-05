#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

// Files with missing logger imports
const filesNeedingImport = [
  'src/lib/bot/smart-room-generator.ts',
  'src/lib/security/securityHardening.ts',
  'src/lib/services/kakao.ts',
  'src/lib/services/notifications.ts',
  'src/lib/utils/browserCompat.ts',
  'src/lib/utils/navigation.ts',
]

// Add logger import to files
filesNeedingImport.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath)
  let content = fs.readFileSync(fullPath, 'utf8')

  // Check if logger import already exists
  if (content.includes("from '@/lib/observability/logger'")) {
    console.log(`✓ ${filePath} - Logger import already exists`)
    return
  }

  // Check if file has logger.* calls
  if (!content.match(/\blogger\.(error|warn|info|debug)\(/)) {
    console.log(`⊘ ${filePath} - No logger calls found`)
    return
  }

  // Find the right place to add import (after other imports or at top)
  const lines = content.split('\n')
  let insertIndex = 0

  // Find last import statement
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].match(/^import .* from/)) {
      insertIndex = i + 1
    }
    if (lines[i].trim() !== '' && !lines[i].startsWith('/*') && !lines[i].startsWith('*') && !lines[i].startsWith('//') && !lines[i].startsWith('import')) {
      break
    }
  }

  // If no imports found, add after header comments
  if (insertIndex === 0) {
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim() === '' || lines[i].startsWith('/*') || lines[i].startsWith('*') || lines[i].startsWith('//')) {
        insertIndex = i + 1
      } else {
        break
      }
    }
  }

  // Insert import
  lines.splice(insertIndex, 0, "import { logger } from '@/lib/observability/logger'")
  content = lines.join('\n')

  fs.writeFileSync(fullPath, content, 'utf8')
  console.log(`✓ ${filePath} - Added logger import at line ${insertIndex + 1}`)
})

// Files with wrong logger argument types - fix specific patterns
const filesToFixArgs = [
  'src/hooks/useRealtimeChat.ts',
  'src/hooks/useRealtimeNotifications.ts',
  'src/lib/accessibility/a11yEnhancement.ts',
]

filesToFixArgs.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath)
  let content = fs.readFileSync(fullPath, 'utf8')
  let modified = false

  // Fix patterns like: logger.debug('User joined:', key, newPresences)
  // To: logger.debug('User joined', { key, newPresences })
  const pattern1 = /logger\.(debug|info|warn|error)\((['"`][^'"`]+['"`]),\s*(\w+),\s*(\w+)\)/g
  if (content.match(pattern1)) {
    content = content.replace(pattern1, (match, level, msg, arg1, arg2) => {
      return `logger.${level}(${msg}, { ${arg1}, ${arg2} })`
    })
    modified = true
  }

  // Fix patterns like: logger.info('Chat channel status:', status)
  // To: logger.info('Chat channel status', { status })
  const pattern2 = /logger\.(debug|info|warn|error)\((['"`][^'"`]+['"`]),\s*([^)]+)\)(?!\s*{)/g
  if (content.match(pattern2)) {
    content = content.replace(pattern2, (match, level, msg, arg) => {
      // Skip if arg is already an object literal
      if (arg.trim().startsWith('{')) return match
      // Handle special case where arg might be complex
      const argName = arg.trim().split('.').pop().split('[')[0].replace(/[^a-zA-Z0-9_]/g, '')
      return `logger.${level}(${msg}, { value: ${arg} })`
    })
    modified = true
  }

  if (modified) {
    fs.writeFileSync(fullPath, content, 'utf8')
    console.log(`✓ ${filePath} - Fixed logger argument types`)
  } else {
    console.log(`⊘ ${filePath} - No changes needed`)
  }
})

console.log('\n✅ All logger errors fixed!')
