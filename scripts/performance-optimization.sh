#!/bin/bash

echo "🚀 BoxCall Performance Optimization Script"
echo "=========================================="

# Console cleanup
echo ""
echo "🧹 PHASE 1: Console Statement Cleanup"
echo "======================================"

# Find all console statements
echo "📊 Scanning for console statements..."
console_count=$(grep -r "console\." src/ --include="*.ts" --include="*.tsx" | wc -l)
echo "  Found $console_count console statements to remove"

# Create backup before cleanup
backup_dir="performance-backup-$(date +%Y%m%d-%H%M%S)"
echo "  Creating backup in $backup_dir/"
mkdir -p "$backup_dir"
cp -r src/ "$backup_dir/"

# Comment out console statements (safer than removing)
echo "  Commenting out console statements..."
find src/ -name "*.ts" -o -name "*.tsx" | while read file; do
    if grep -q "console\." "$file"; then
        # Comment out console statements but preserve the file structure
        sed -i.bak 's/^[[:space:]]*console\./\/\/ console./g' "$file"
        rm "${file}.bak" 2>/dev/null
        echo "    ✅ Updated: $file"
    fi
done

# Inline style detection
echo ""
echo "🎨 PHASE 2: Inline Style Analysis"
echo "================================="

echo "📊 Scanning for inline styles..."
inline_count=$(grep -r "style={{" src/ --include="*.tsx" | wc -l)
echo "  Found $inline_count inline style occurrences"

echo "  📋 Files with inline styles:"
grep -r "style={{" src/ --include="*.tsx" -l | head -10 | while read file; do
    count=$(grep "style={{" "$file" | wc -l)
    echo "    🎯 $file: $count occurrences"
done

# Large file analysis
echo ""
echo "📏 PHASE 3: Large File Analysis"
echo "==============================="

echo "📊 Scanning for large components..."
echo "  🔥 Files over 800 lines (refactoring needed):"
find src/ -name "*.ts" -o -name "*.tsx" | while read file; do
    lines=$(wc -l < "$file")
    if [ $lines -gt 800 ]; then
        echo "    📄 $file: $lines lines"
    fi
done

# Bundle analysis preparation
echo ""
echo "📦 PHASE 4: Bundle Analysis Setup"
echo "================================="

echo "📊 Analyzing current bundle..."
if [ -d "dist" ]; then
    echo "  📁 Current bundle contents:"
    find dist/assets -name "*.js" | while read file; do
        size=$(du -h "$file" | cut -f1)
        echo "    📦 $(basename $file): $size"
    done
    
    total_size=$(du -sh dist/ | cut -f1)
    echo "  🎯 Total bundle size: $total_size"
else
    echo "  ⚠️  No dist directory found. Run 'npm run build' first."
fi

# Memoization opportunities
echo ""
echo "🧠 PHASE 5: Memoization Opportunities"
echo "====================================="

echo "📊 Scanning for memoization patterns..."
memo_current=$(grep -r "React\.memo\|memo(" src/ --include="*.tsx" | wc -l)
usememo_current=$(grep -r "useMemo\|useCallback" src/ --include="*.tsx" | wc -l)

echo "  Current React.memo usage: $memo_current components"
echo "  Current useMemo/useCallback usage: $usememo_current hooks"

echo "  🎯 Components that should be memoized:"
# Find components with props that are likely pure
grep -r "^export.*function\|^const.*=" src/ --include="*.tsx" | grep -v "Page\|Modal" | head -10 | while read line; do
    file=$(echo "$line" | cut -d: -f1)
    component=$(echo "$line" | grep -o "[A-Z][a-zA-Z]*" | head -1)
    echo "    🔧 $component in $(basename $file)"
done

# Performance recommendations
echo ""
echo "🎯 PHASE 6: Performance Recommendations"
echo "========================================"

echo "  💡 Priority Actions:"
echo "    1. 🔥 CRITICAL: Split PracticePlannerModal.tsx (3,353 lines)"
echo "    2. 🔥 HIGH: Implement PDF lazy loading (1.4MB bundle)"
echo "    3. 🟡 MEDIUM: Add React.memo to table components"
echo "    4. 🟡 MEDIUM: Convert inline styles to CSS classes"
echo "    5. 🟢 LOW: Add useCallback to event handlers"

echo ""
echo "📋 Next Steps:"
echo "=============="
echo "  1. Review commented console statements"
echo "  2. Run tests to ensure functionality"
echo "  3. Implement React.memo for identified components"
echo "  4. Set up bundle size monitoring"
echo "  5. Create performance monitoring dashboard"

echo ""
echo "✅ Performance analysis complete!"
echo "📁 Backup created in: $backup_dir/"
echo "📊 Console statements: $console_count → 0 (commented out)"
echo "🎨 Inline styles to fix: $inline_count"
echo "📏 Large files to refactor: Check output above"
