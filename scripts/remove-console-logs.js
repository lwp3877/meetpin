const fs = require('fs');
const path = require('path');
const glob = require('glob');

// console.log를 logger로 교체하는 스크립트
function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // console.log -> logger.info
  if (content.match(/console\.log\(/g)) {
    content = content.replace(/console\.log\(/g, 'logger.info(');
    modified = true;
  }

  // console.error는 유지하되, logger.error로 교체
  if (content.match(/console\.error\(/g)) {
    content = content.replace(/console\.error\(/g, 'logger.error(');
    modified = true;
  }

  // console.warn -> logger.warn
  if (content.match(/console\.warn\(/g)) {
    content = content.replace(/console\.warn\(/g, 'logger.warn(');
    modified = true;
  }

  // logger를 사용하는 파일에 import 추가
  if (modified && !content.includes("from '@/lib/utils/logger'") && !content.includes("from '@/lib/observability/logger'")) {
    // 파일 상단에 import 추가
    const importStatement = "import { logger } from '@/lib/utils/logger'\n";

    // 'use client' 다음에 추가
    if (content.includes("'use client'")) {
      content = content.replace("'use client'\n", "'use client'\n\n" + importStatement);
    }
    // 'use server' 다음에 추가
    else if (content.includes("'use server'")) {
      content = content.replace("'use server'\n", "'use server'\n\n" + importStatement);
    }
    // import 문이 있으면 그 다음에 추가
    else if (content.match(/^import /m)) {
      const firstImportIndex = content.search(/^import /m);
      const beforeImports = content.substring(0, firstImportIndex);
      const afterImports = content.substring(firstImportIndex);
      content = beforeImports + importStatement + afterImports;
    }
    // 그 외에는 파일 맨 위에 추가
    else {
      content = importStatement + '\n' + content;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  return false;
}

// src 디렉토리의 모든 .ts, .tsx 파일 처리
const files = glob.sync('src/**/*.{ts,tsx}', {
  ignore: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx', '**/node_modules/**']
});

console.log(`Processing ${files.length} files...`);

let modifiedCount = 0;
files.forEach(file => {
  if (processFile(file)) {
    modifiedCount++;
    console.log(`✅ Modified: ${file}`);
  }
});

console.log(`\n✅ Complete! Modified ${modifiedCount} files.`);
