#!/bin/bash

# Fix all broken console.log statements throughout the codebase
echo "🧹 Fixing all broken console.log statements..."

# Find all files with broken console patterns and fix them systematically
find src -name "*.ts" -o -name "*.tsx" | while read file; do
    echo "Checking $file..."
    
    # Fix empty arrow functions
    sed -i '' 's/() => }/() => { \/\/ TODO: Implement functionality }/g' "$file"
    
    # Fix orphaned object properties that were left from console.log removal
    sed -i '' '/^\s*[a-zA-Z_][a-zA-Z0-9_]*:\s*[^,}]*,$/{N;s/^\s*[a-zA-Z_][a-zA-Z0-9_]*:\s*[^,}]*,\n\s*});//}' "$file"
    
    # Remove standalone property lines that were left from console.log
    sed -i '' '/^\s*[a-zA-Z_][a-zA-Z0-9_]*,$/d' "$file"
    sed -i '' '/^\s*[a-zA-Z_][a-zA-Z0-9_]*:\s*[^,}]*,$/d' "$file"
    
    # Fix incomplete function calls
    sed -i '' 's/(\s*$/{/g' "$file"
    
done

echo "✅ Fixed broken console.log patterns"
