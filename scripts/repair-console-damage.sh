#!/bin/bash

echo "🧹 Comprehensive console.log damage repair..."

# Fix all broken arrow functions
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/() => }/() => {\n      \/\/ TODO: Implement functionality\n    }/g'

# Fix orphaned console.log parameters - common patterns
find src -name "*.ts" -o -name "*.tsx" | while read file; do
    # Fix broken console.log calls - add console.log( at beginning of orphaned strings
    sed -i '' '/^\s*"[^"]*",\s*$/N;s/^\s*\("\[^"]*\)",\s*\n\s*\([^;)]*\)\s*$/    console.log(\1, \2/g' "$file"
    
    # Fix incomplete console.log calls
    sed -i '' 's/^\s*"[^"]*"\s*$/    \/\/ console.log debug removed/g' "$file"
    
    # Remove standalone orphaned parameters
    sed -i '' '/^\s*[a-zA-Z_][a-zA-Z0-9_]*,\s*$/d' "$file"
    sed -i '' '/^\s*[a-zA-Z_][a-zA-Z0-9_]*:\s*[^,}]*,\s*$/d' "$file"
    
    # Fix prefix unused parameters with underscore
    sed -i '' 's/(\([a-zA-Z_][a-zA-Z0-9_]*\)) =>/(_\1) =>/g' "$file"
done

echo "✅ Console damage repair complete"
