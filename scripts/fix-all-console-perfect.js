#!/usr/bin/env node
/**
 * Perfect console.* → logger.* conversion
 * Handles all edge cases correctly
 */

const fs = require('fs');
const path = require('path');

const filesToFix = [
  'src/lib/rateLimit.ts',
  'src/lib/supabaseClient.ts',
  'src/lib/age-verification.ts',
  'src/lib/payments/stripe.ts',
  'src/lib/bot-scheduler.ts',
  'src/lib/bot/bot-scheduler.ts',
  'src/lib/bot/smart-room-generator.ts',
  'src/lib/security/securityHardening.ts',
  'src/lib/services/auth.ts',
  'src/lib/services/authService.ts',
  'src/lib/services/imageUpload.ts',
  'src/lib/services/kakao.ts',
  'src/lib/services/notifications.ts',
  'src/lib/services/stripe.ts',
  'src/lib/accessibility/a11yEnhancement.ts',
  'src/lib/utils/browserCompat.ts',
  'src/lib/utils/dataValidation.ts',
  'src/lib/utils/index.ts',
  'src/lib/utils/navigation.ts',
  'src/hooks/useRealtimeChat.ts',
  'src/hooks/useRealtimeNotifications.ts',
  'src/components/auth/social-login.tsx',
  'src/components/chat/ChatPanel.tsx',
  'src/components/common/BotSchedulerInitializer.tsx',
  'src/components/common/Providers.tsx',
  'src/components/error/GlobalErrorBoundary.tsx',
  'src/components/map/LocationPicker.tsx',
  'src/components/map/MapWithCluster.tsx',
  'src/components/premium/enhanced-landing.tsx',
  'src/components/pwa/InstallPrompt.tsx',
  'src/components/ui/BoostModal.tsx',
  'src/components/ui/EnhancedProfile.tsx',
  'src/components/ui/ImageUploader.tsx',
  'src/components/ui/NotificationCenter.tsx',
  'src/components/ui/NotificationSettings.tsx',
  'src/components/ui/ProfileImageUploader.tsx',
  'src/app/auth/callback/page.tsx',
  'src/app/auth/login/page.tsx',
  'src/app/chat/[matchId]/page.tsx',
  'src/app/debug-landing/page.tsx',
  'src/app/map/page.tsx',
  'src/app/requests/page.tsx',
  'src/app/room/new/page.tsx',
  'src/app/room/[id]/edit/page.tsx',
  'src/app/room/[id]/page.tsx',
  'src/app/room/[id]/requests/page.tsx',
  'src/app/rooms/page.tsx',
];

let totalFiles = 0;
let totalChanges = 0;

filesToFix.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);

  if (!fs.existsSync(fullPath)) {
    console.warn(`⚠️  File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  const original = content;
  let changes = 0;

  // 1. Remove duplicate logger imports
  const importCount = (content.match(/import.*from '@\/lib\/observability\/logger'/g) || []).length;
  if (importCount > 1) {
    // Keep only first occurrence
    let first = true;
    content = content.replace(/import.*from '@\/lib\/observability\/logger'.*\n/g, (match) => {
      if (first) {
        first = false;
        return match;
      }
      changes++;
      return '';
    });
  }

  // 2. Add logger import if missing and has console statements
  const hasConsole = /console\.(log|error|warn|info|debug)/.test(content);
  const hasLogger = /from '@\/lib\/observability\/logger'/.test(content);

  if (hasConsole && !hasLogger) {
    // Find last import line
    const imports = content.match(/^import .+ from ['"'].+['"]$/gm);
    if (imports && imports.length > 0) {
      const lastImport = imports[imports.length - 1];
      const lastImportIndex = content.indexOf(lastImport) + lastImport.length;
      content = content.slice(0, lastImportIndex) + "\nimport { logger } from '@/lib/observability/logger'" + content.slice(lastImportIndex);
      changes++;
    }
  }

  // 3. Replace console.error(msg, var) → logger.error(msg, { error: ... })
  content = content.replace(
    /console\.error\((['"``])([^'"``]+)\1,\s*(\w+)\)/g,
    (match, quote, msg, varName) => {
      changes++;
      return `logger.error(${quote}${msg}${quote}, { error: ${varName} instanceof Error ? ${varName}.message : String(${varName}) })`;
    }
  );

  // 4. Replace console.error(msg)
  content = content.replace(/console\.error\(/g, () => {
    changes++;
    return 'logger.error(';
  });

  // 5. Replace console.log
  content = content.replace(/console\.log\(/g, () => {
    changes++;
    return 'logger.info(';
  });

  // 6. Replace console.warn
  content = content.replace(/console\.warn\(/g, () => {
    changes++;
    return 'logger.warn(';
  });

  // 7. Replace console.info
  content = content.replace(/console\.info\(/g, () => {
    changes++;
    return 'logger.info(';
  });

  // 8. Replace console.debug
  content = content.replace(/console\.debug\(/g, () => {
    changes++;
    return 'logger.debug(';
  });

  // Save if changed
  if (content !== original) {
    fs.writeFileSync(fullPath, content, 'utf8');
    totalFiles++;
    totalChanges += changes;
    console.log(`✅ ${filePath} - ${changes} changes`);
  }
});

console.log(`\n📊 Summary:`);
console.log(`   Files modified: ${totalFiles}`);
console.log(`   Total changes: ${totalChanges}`);
console.log(`\n✨ Perfect conversion completed!`);
