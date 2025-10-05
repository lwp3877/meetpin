#!/usr/bin/env node
/**
 * Automated script to convert console.* to logger.* in all API routes
 * Usage: node scripts/convert-console-to-logger.js
 */

const fs = require('fs');
const path = require('path');

// 재귀적으로 디렉토리 탐색
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else if (filePath.endsWith('.ts') && !filePath.includes('.bak') && !filePath.includes('.test.') && !filePath.includes('.spec.')) {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}

// API 디렉토리 내 모든 .ts 파일 찾기
const apiDir = path.join(__dirname, '..', 'src', 'app', 'api');
const files = getAllFiles(apiDir);

console.log(`Found ${files.length} API route files`);

let totalChanges = 0;
let filesModified = 0;

files.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  let fileChanges = 0;

  // 1. logger import 추가 (아직 없으면)
  if (!content.includes("from '@/lib/observability/logger'") &&
      /console\.(log|error|warn|info|debug)/.test(content)) {

    // 마지막 import 구문 찾기
    const lastImportMatch = content.match(/import\s+[^;]+from\s+['"][^'"]+['"]\s*\n/g);
    if (lastImportMatch && lastImportMatch.length > 0) {
      const lastImport = lastImportMatch[lastImportMatch.length - 1];
      const insertIndex = content.indexOf(lastImport) + lastImport.length;

      content = content.slice(0, insertIndex) +
                "import { logger } from '@/lib/observability/logger'\n" +
                content.slice(insertIndex);
      fileChanges++;
    }
  }

  // 2. console.error (메시지 + 변수)
  content = content.replace(
    /console\.error\(['"](.*?)['"],\s*([^)]+)\)/g,
    (match, message, errorVar) => {
      fileChanges++;
      const cleanErrorVar = errorVar.trim();
      return `logger.error('${message}', { error: ${cleanErrorVar} instanceof Error ? ${cleanErrorVar}.message : String(${cleanErrorVar}) })`;
    }
  );

  // 3. console.error (단일 메시지)
  content = content.replace(
    /console\.error\((['"](.*?)['"])\)/g,
    (match, quoted) => {
      fileChanges++;
      return `logger.error(${quoted})`;
    }
  );

  // 4. console.log (템플릿 리터럴)
  content = content.replace(
    /console\.log\((`[^`]*`)\)/g,
    (match, message) => {
      fileChanges++;
      return `logger.info(${message})`;
    }
  );

  // 5. console.log (일반 문자열)
  content = content.replace(
    /console\.log\((['"](.*?)['"])\)/g,
    (match, quoted) => {
      fileChanges++;
      return `logger.info(${quoted})`;
    }
  );

  // 6. console.warn
  content = content.replace(/console\.warn\(/g, () => {
    fileChanges++;
    return 'logger.warn(';
  });

  // 7. console.info
  content = content.replace(/console\.info\(/g, () => {
    fileChanges++;
    return 'logger.info(';
  });

  // 8. console.debug
  content = content.replace(/console\.debug\(/g, () => {
    fileChanges++;
    return 'logger.debug(';
  });

  // 변경사항이 있으면 파일 저장
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    filesModified++;
    totalChanges += fileChanges;
    console.log(`✅ ${path.relative(process.cwd(), filePath)} - ${fileChanges} changes`);
  }
});

console.log(`\n📊 Summary:`);
console.log(`   Files modified: ${filesModified}`);
console.log(`   Total changes: ${totalChanges}`);
console.log(`\n✨ Done! All console statements converted to logger.`);
