#!/bin/bash

echo "🚀 BoxCall Performance Analysis"
echo "==============================="

# Check bundle size and dependencies
echo ""
echo "📦 Bundle Analysis..."
echo "===================="

# Build the project to analyze bundle
echo "Building project for analysis..."
npm run build > /dev/null 2>&1

if [ -d "dist" ]; then
    echo "📊 Build Output Analysis:"
    find dist -name "*.js" -o -name "*.css" | while read file; do
        size=$(du -h "$file" | cut -f1)
        echo "  📄 $file: $size"
    done
    
    total_size=$(du -sh dist/ | cut -f1)
    echo "  🎯 Total bundle size: $total_size"
else
    echo "❌ Build failed or dist directory not found"
fi

echo ""
echo "📊 Dependency Analysis..."
echo "========================"

# Analyze package.json dependencies
deps_count=$(cat package.json | grep -A 100 '"dependencies"' | grep -E '^\s*"' | wc -l)
dev_deps_count=$(cat package.json | grep -A 100 '"devDependencies"' | grep -E '^\s*"' | wc -l)

echo "  📦 Production dependencies: $deps_count"
echo "  🔧 Development dependencies: $dev_deps_count"

# Check for heavy dependencies
echo ""
echo "  🔍 Large Dependencies:"
npm list --depth=0 --prod 2>/dev/null | grep -E "\d+\.\d+" | head -10

echo ""
echo "💾 File System Analysis..."
echo "=========================="

# Analyze source code structure
echo "  📂 Source Code Metrics:"
total_files=$(find src -name "*.ts" -o -name "*.tsx" | wc -l)
total_lines=$(find src -name "*.ts" -o -name "*.tsx" -exec wc -l {} + | tail -1 | awk '{print $1}')
echo "    📄 TypeScript files: $total_files"
echo "    📝 Total lines of code: $total_lines"

# Find largest files
echo ""
echo "  📏 Largest Source Files (top 10):"
find src -name "*.ts" -o -name "*.tsx" | xargs wc -l | sort -nr | head -10 | while read lines file; do
    if [ "$file" != "total" ]; then
        echo "    🔥 $file: $lines lines"
    fi
done

echo ""
echo "🔄 Import Analysis..."
echo "===================="

# Check for circular dependencies
echo "  🔍 Potential Circular Dependencies:"
find src -name "*.ts" -o -name "*.tsx" | while read file; do
    imports=$(grep -o "from ['\"].*['\"]" "$file" 2>/dev/null | grep -o "['\"][^'\"]*['\"]" | tr -d "'\"" | grep "^\\.\\|^src")
    for import in $imports; do
        # Simple check for potential circular refs
        if [ "$import" != "" ]; then
            echo "$file -> $import" >> /tmp/imports.txt
        fi
    done
done 2>/dev/null

if [ -f "/tmp/imports.txt" ]; then
    echo "    📊 Import relationships found: $(wc -l < /tmp/imports.txt)"
    rm -f /tmp/imports.txt
fi

echo ""
echo "🎯 Performance Patterns Analysis..."
echo "==================================="

# Check for performance anti-patterns
echo "  ⚠️  Potential Performance Issues:"

# Inline styles
inline_styles=$(grep -r "style={{" src/ 2>/dev/null | wc -l)
echo "    🎨 Inline styles usage: $inline_styles occurrences"

# Console.log statements
console_logs=$(grep -r "console\.log\|console\.warn\|console\.error" src/ 2>/dev/null | wc -l)
echo "    📝 Console statements: $console_logs occurrences"

# Large useEffect dependencies
large_deps=$(grep -r "useEffect.*\[.*\]" src/ 2>/dev/null | grep -o "\[.*\]" | awk 'length > 20' | wc -l)
echo "    🔄 Potentially large useEffect deps: $large_deps"

# Any TODO performance comments
perf_todos=$(grep -r "TODO.*performance\|FIXME.*performance\|PERF:" src/ 2>/dev/null | wc -l)
echo "    📋 Performance TODOs: $perf_todos"

echo ""
echo "🚀 Optimization Opportunities..."
echo "================================"

# Check for optimization opportunities
echo "  💡 Quick Wins:"

# Check if React.memo is used
memo_usage=$(grep -r "React\.memo\|memo(" src/ 2>/dev/null | wc -l)
echo "    🧠 React.memo usage: $memo_usage components"

# Check for useMemo/useCallback
memo_hooks=$(grep -r "useMemo\|useCallback" src/ 2>/dev/null | wc -l)
echo "    🎯 Memoization hooks: $memo_hooks usages"

# Check for lazy loading
lazy_loading=$(grep -r "React\.lazy\|lazy(" src/ 2>/dev/null | wc -l)
echo "    ⚡ Lazy loading: $lazy_loading components"

# Check for image optimization
image_files=$(find public src -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.gif" | wc -l)
echo "    🖼️  Image files: $image_files (consider optimization)"

echo ""
echo "🎭 Component Analysis..."
echo "======================="

# Analyze component complexity
echo "  📊 Component Metrics:"

# Count hooks usage per file
echo "    🎣 Top Hook Usage Files:"
find src -name "*.tsx" | while read file; do
    hooks=$(grep -o "use[A-Z][a-zA-Z]*" "$file" 2>/dev/null | wc -l)
    if [ $hooks -gt 5 ]; then
        echo "      🔥 $file: $hooks hooks"
    fi
done | head -5

echo ""
echo "📈 Bundle Optimization Suggestions..."
echo "===================================="

# Check for tree-shaking opportunities
echo "  🌳 Tree-shaking Analysis:"

# Check for barrel imports
barrel_imports=$(grep -r "from ['\"].*index['\"]" src/ 2>/dev/null | wc -l)
echo "    📦 Barrel imports: $barrel_imports (may hurt tree-shaking)"

# Check for lodash usage (common bundle bloat)
lodash_usage=$(grep -r "import.*lodash\|from.*lodash" src/ 2>/dev/null | wc -l)
echo "    🔧 Lodash imports: $lodash_usage (consider individual imports)"

echo ""
echo "🎯 Analysis Complete!"
echo "===================="
echo "📋 Check the generated TODO recommendations for specific optimization tasks."
