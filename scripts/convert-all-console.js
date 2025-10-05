#!/usr/bin/env node
/**
 * Convert ALL console.* to logger.* in src/ directory
 * Includes components, hooks, lib, etc.
 */

const fs = require('fs');
const path = require('path');

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else if ((filePath.endsWith('.ts') || filePath.endsWith('.tsx')) &&
               !filePath.includes('.bak') &&
               !filePath.includes('.test.') &&
               !filePath.includes('.spec.')) {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}

const srcDir = path.join(__dirname, '..', 'src');
const files = getAllFiles(srcDir);

console.log(`Found ${files.length} source files`);

let totalChanges = 0;
let filesModified = 0;

files.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  let fileChanges = 0;

  // Skip if already has logger
  const hasLogger = content.includes("from '@/lib/observability/logger'") ||
                    content.includes("from '@/observability/logger'");

  const hasConsole = /console\.(log|error|warn|info|debug)/.test(content);

  if (!hasConsole) {
    return; // Skip files without console statements
  }

  // 1. Add logger import if needed
  if (!hasLogger) {
    // Find last import
    const importMatches = content.match(/import\s+[^;]+from\s+['"][^'"]+['"]\s*\n/g);
    if (importMatches && importMatches.length > 0) {
      const lastImport = importMatches[importMatches.length - 1];
      const insertIndex = content.indexOf(lastImport) + lastImport.length;

      content = content.slice(0, insertIndex) +
                "import { logger } from '@/lib/observability/logger'\n" +
                content.slice(insertIndex);
      fileChanges++;
    } else {
      // No imports found, add at top
      const firstLine = content.indexOf('\n');
      if (firstLine > -1) {
        content = content.slice(0, firstLine + 1) +
                  "import { logger } from '@/lib/observability/logger'\n" +
                  content.slice(firstLine + 1);
        fileChanges++;
      }
    }
  }

  // 2. Replace console.error with 2 args (message, error)
  content = content.replace(
    /console\.error\((['"``])([^'"``]*)\1,\s*([^)]+)\)/g,
    (match, quote, message, errorVar) => {
      fileChanges++;
      const cleanErrorVar = errorVar.trim();
      return `logger.error(${quote}${message}${quote}, { error: ${cleanErrorVar} instanceof Error ? ${cleanErrorVar}.message : String(${cleanErrorVar}) })`;
    }
  );

  // 3. Replace console.error with 1 arg
  content = content.replace(/console\.error\(/g, () => {
    fileChanges++;
    return 'logger.error(';
  });

  // 4. Replace console.log
  content = content.replace(/console\.log\(/g, () => {
    fileChanges++;
    return 'logger.info(';
  });

  // 5. Replace console.warn
  content = content.replace(/console\.warn\(/g, () => {
    fileChanges++;
    return 'logger.warn(';
  });

  // 6. Replace console.info
  content = content.replace(/console\.info\(/g, () => {
    fileChanges++;
    return 'logger.info(';
  });

  // 7. Replace console.debug
  content = content.replace(/console\.debug\(/g, () => {
    fileChanges++;
    return 'logger.debug(';
  });

  // Save if changed
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    filesModified++;
    totalChanges += fileChanges;
    const relPath = path.relative(process.cwd(), filePath);
    console.log(`✅ ${relPath} - ${fileChanges} changes`);
  }
});

console.log(`\n📊 Summary:`);
console.log(`   Total files scanned: ${files.length}`);
console.log(`   Files modified: ${filesModified}`);
console.log(`   Total changes: ${totalChanges}`);
console.log(`\n✨ Done!`);
