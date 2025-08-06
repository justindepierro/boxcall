#!/bin/bash

echo "🔧 Targeted Fix for Console Cleanup Damage"
echo "==========================================="

# Fix specific parsing error patterns
fix_specific_patterns() {
    local file="$1"
    echo "  🔧 Fixing: $file"
    
    # Pattern 1: Standalone string literals (leftover from console.log removal)
    # Remove lines that are just quoted strings
    sed -i.bak '/^[[:space:]]*"[^"]*"[[:space:]]*$/d' "$file"
    sed -i.bak "/^[[:space:]]*'[^']*'[[:space:]]*$/d" "$file"
    
    # Pattern 2: Multi-line console statement remnants
    # Remove lines that are string literals followed by comma and closing paren
    sed -i.bak '/^[[:space:]]*"[^"]*"[[:space:]]*,*[[:space:]]*$/d' "$file"
    sed -i.bak '/^[[:space:]]*);[[:space:]]*$/d' "$file"
    
    # Pattern 3: Remove orphaned closing parens and semicolons
    sed -i.bak '/^[[:space:]]*\);[[:space:]]*$/d' "$file"
    
    # Clean up backup
    rm "${file}.bak" 2>/dev/null
}

# List of files with parsing errors from the lint output
files_with_parsing_errors=(
    "src/App.tsx"
    "src/components/practice/PracticePlannerModal.tsx"
    "src/components/practice/hooks/usePracticeState.ts"
    "src/examples/MobilePlatformIntegration.ts"
    "src/hooks/useDataResolution.ts"
    "src/lib/database-explorer.ts"
    "src/lib/database-helpers.ts"
    "src/lib/schema-discovery.ts"
    "src/pages/TeamBulletin.tsx"
    "src/services/DashboardServiceV4.ts"
    "src/services/achievementService.ts"
    "src/services/dashboardService.ts"
    "src/services/dataSyncService.ts"
    "src/services/enhancedCalendarService.ts"
    "src/services/mobile/MobilePerformanceService.ts"
    "src/services/phase3/IntelligentCalendarService.ts"
    "src/services/practiceService.ts"
    "src/services/rbac/RBACService.ts"
    "src/services/react-native/ReactNativePlatformService.ts"
    "src/tests/Phase43Integration.test.ts"
    "src/tests/smartIconSystem.test.ts"
    "src/utils/navigation.ts"
    "src/utils/performance/webVitals.ts"
)

echo "🔍 Fixing ${#files_with_parsing_errors[@]} files with parsing errors..."

for file in "${files_with_parsing_errors[@]}"; do
    if [ -f "$file" ]; then
        fix_specific_patterns "$file"
    else
        echo "  ⚠️  File not found: $file"
    fi
done

echo "✅ Parsing error fixes applied"
echo "🔍 Running type check to verify fixes..."

npm run type-check
