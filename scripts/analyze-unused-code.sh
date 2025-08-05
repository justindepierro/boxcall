#!/bin/bash

echo "🔍 BoxCall Code Analysis - Finding Unused Code"
echo "=============================================="

# Function to check if a file is imported anywhere
check_file_usage() {
    local file="$1"
    local basename=$(basename "$file" .ts)
    basename=$(basename "$basename" .tsx)
    
    # Search for imports of this file
    local import_count=$(grep -r "from.*$basename" src/ 2>/dev/null | wc -l)
    local require_count=$(grep -r "require.*$basename" src/ 2>/dev/null | wc -l)
    
    echo "$import_count,$require_count,$file"
}

echo ""
echo "📁 Analyzing TypeScript/React files for usage..."

# Find all .ts and .tsx files (exclude test files)
find src/ -name "*.ts" -o -name "*.tsx" | grep -v "\.test\." | grep -v "\.spec\." | sort > /tmp/all_ts_files.txt

echo ""
echo "🔍 Checking file imports..."
echo "Format: ImportCount,RequireCount,FilePath"
echo "========================================"

potentially_unused=()

while read -r file; do
    result=$(check_file_usage "$file")
    import_count=$(echo "$result" | cut -d',' -f1)
    require_count=$(echo "$result" | cut -d',' -f2)
    
    total=$((import_count + require_count))
    
    # Skip main entry points and special files
    if [[ "$file" == *"main.tsx"* ]] || [[ "$file" == *"App.tsx"* ]] || [[ "$file" == *"vite-env.d.ts"* ]]; then
        continue
    fi
    
    if [[ $total -eq 0 ]]; then
        potentially_unused+=("$file")
        echo "❌ $result (POTENTIALLY UNUSED)"
    elif [[ $total -lt 2 ]]; then
        echo "⚠️  $result (LOW USAGE)"
    else
        echo "✅ $result"
    fi
done < /tmp/all_ts_files.txt

echo ""
echo "🚨 Potentially Unused Files:"
echo "============================"
for file in "${potentially_unused[@]}"; do
    echo "  - $file"
done

echo ""
echo "🔍 Checking for unused exports..."
echo "================================="

# Find exported functions/classes that might not be used
unused_exports=()

while read -r file; do
    # Find exports in the file
    exports=$(grep -n "^export" "$file" 2>/dev/null || true)
    
    if [[ -n "$exports" ]]; then
        while IFS= read -r export_line; do
            # Extract export name (simplified)
            export_name=$(echo "$export_line" | sed -n 's/.*export.*\(function\|class\|const\|let\|var\) \([a-zA-Z_][a-zA-Z0-9_]*\).*/\2/p')
            
            if [[ -n "$export_name" ]] && [[ "$export_name" != "default" ]]; then
                # Check if this export is used anywhere else
                usage_count=$(grep -r "$export_name" src/ --exclude="$file" 2>/dev/null | wc -l)
                
                if [[ $usage_count -eq 0 ]]; then
                    unused_exports+=("$export_name in $file")
                fi
            fi
        done <<< "$exports"
    fi
done < /tmp/all_ts_files.txt

echo ""
echo "📤 Potentially Unused Exports:"
echo "=============================="
for export in "${unused_exports[@]}"; do
    echo "  - $export"
done

echo ""
echo "🔍 Checking for large files that might need refactoring..."
echo "========================================================="

find src/ -name "*.ts" -o -name "*.tsx" | xargs wc -l | sort -nr | head -10 | while read -r lines file; do
    if [[ "$file" != "total" ]] && [[ $lines -gt 500 ]]; then
        echo "📏 $file: $lines lines (LARGE FILE)"
    elif [[ "$file" != "total" ]] && [[ $lines -gt 300 ]]; then
        echo "📊 $file: $lines lines (MEDIUM FILE)"
    fi
done

echo ""
echo "🔍 Checking for TODO/FIXME comments..."
echo "======================================"

todo_count=$(grep -r "TODO\|FIXME\|HACK\|XXX" src/ 2>/dev/null | wc -l)
echo "📝 Found $todo_count TODO/FIXME comments in codebase"

if [[ $todo_count -gt 0 ]]; then
    echo ""
    echo "Top TODO/FIXME locations:"
    grep -r "TODO\|FIXME\|HACK\|XXX" src/ 2>/dev/null | head -5
fi

echo ""
echo "🔍 Checking for duplicate/similar files..."
echo "========================================="

# Find files with very similar names
find src/ -name "*.ts" -o -name "*.tsx" | sed 's/\.[^.]*$//' | sort | uniq -c | sort -nr | head -5 | while read -r count basename; do
    if [[ $count -gt 1 ]]; then
        echo "🔄 Similar files: $basename* (appears $count times)"
    fi
done

# Clean up temp file
rm -f /tmp/all_ts_files.txt

echo ""
echo "🎯 Analysis Complete!"
echo "===================="
echo "Use this information to:"
echo "  - Remove unused files"
echo "  - Clean up unused exports"  
echo "  - Refactor large files"
echo "  - Address TODO comments"
echo "  - Consolidate duplicate functionality"
