const fs = require('fs')

const filePath = 'src/lib/accessibility/a11yEnhancement.ts'
let content = fs.readFileSync(filePath, 'utf8')

// Fix patterns like: logger.warn('message:', value)
// To: logger.warn('message', { value })
content = content.replace(
  /logger\.(warn|info|error|debug)\((['"`][^'"`]+):['"`],\s*([^)]+)\)/g,
  (match, level, msg, value) => {
    const cleanValue = value.trim()
    return `logger.${level}(${msg}', { value: ${cleanValue} })`
  }
)

fs.writeFileSync(filePath, content, 'utf8')
console.log('✅ Fixed logger arguments in a11yEnhancement.ts')
