#!/bin/bash

echo "🔧 Fixing onClick Handlers"
echo "=========================="

# Fix commented onClick handlers by replacing them with proper placeholder functions
fix_onclick_handlers() {
    local file="$1"
    
    # Replace commented onClick handlers with proper placeholder functions
    sed -i.bak 's|^[[:space:]]*//[[:space:]]*onClick={() => console\.log(\(.*\))}|        onClick={() => alert(`Feature: ${1} - Coming Soon!`)}|g' "$file"
    
    # Remove the backup file
    rm "${file}.bak" 2>/dev/null
}

echo "🔍 Finding files with commented onClick handlers..."

# Find and fix files with commented onClick console.log statements
find src/ -name "*.tsx" | while read file; do
    if grep -q "//.*onClick.*console\.log" "$file"; then
        echo "  🔧 Fixing: $file"
        fix_onclick_handlers "$file"
    fi
done

echo "✅ onClick handlers fixed"
echo "🔍 Running type check..."

npm run type-check
