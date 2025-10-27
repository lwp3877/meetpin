#!/bin/bash
# 🎯 Lucide React 아이콘 import를 중앙 집중식으로 마이그레이션하는 스크립트

echo "🚀 Starting Lucide React icon migration..."

# 제외할 파일들
EXCLUDE_FILES=(
  "src/components/icons/MapIcons.tsx"
  "src/components/icons/index.ts"
  "src/types/lucide-react.d.ts"
)

# 마이그레이션 카운터
MIGRATED=0
SKIPPED=0

# src 폴더 내 모든 .tsx, .ts 파일 순회
find src -name "*.tsx" -o -name "*.ts" | while read -r file; do
  # 제외 파일 체크
  SKIP=false
  for exclude in "${EXCLUDE_FILES[@]}"; do
    if [[ "$file" == *"$exclude"* ]]; then
      SKIP=true
      break
    fi
  done

  if $SKIP; then
    echo "⏭️  Skipping: $file (excluded)"
    ((SKIPPED++))
    continue
  fi

  # Lucide icon import가 있는지 확인
  if grep -q "from 'lucide-react/dist/esm/icons/" "$file"; then
    echo "🔄 Migrating: $file"

    # 백업 생성
    cp "$file" "$file.bak"

    # 모든 개별 import를 찾아서 수집
    icons=$(grep "from 'lucide-react/dist/esm/icons/" "$file" | \
            sed -E "s/.*import\s+(\{[^}]+\}|[A-Za-z0-9]+)\s+from.*/\1/" | \
            tr '\n' ',' | sed 's/,$//')

    # 개별 import 라인 제거
    sed -i "/from 'lucide-react\/dist\/esm\/icons\//d" "$file"

    # 새로운 중앙 집중식 import 추가 (파일 상단 근처)
    # React import 다음에 삽입
    sed -i "/^import.*from 'react'/a import { $icons } from '@/components/icons'" "$file"

    echo "✅ Migrated: $file"
    ((MIGRATED++))
  fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Migration Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Files migrated: $MIGRATED"
echo "⏭️  Files skipped: $SKIPPED"
echo ""
echo "🧪 Next steps:"
echo "  1. Run: pnpm typecheck"
echo "  2. Run: pnpm build"
echo "  3. Test the application"
echo "  4. If errors occur, restore from .bak files"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
