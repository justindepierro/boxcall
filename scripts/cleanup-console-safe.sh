#!/bin/bash

# More precise console.log cleanup
echo "🧹 Cleaning up console.log statements (keeping console.error/warn)..."

# Remove complete console.log statements including multiline ones
find src -name "*.ts" -o -name "*.tsx" | while read file; do
  # Remove single line console.log statements
  sed -i '' '/^[[:space:]]*console\.log(/d' "$file"
  
  # Remove console.log with content on same line
  sed -i '' 's/console\.log([^;]*);*//g' "$file"
  
  # Clean up any trailing semicolons or commas left behind
  sed -i '' '/^[[:space:]]*;[[:space:]]*$/d' "$file"
  sed -i '' '/^[[:space:]]*,[[:space:]]*$/d' "$file"
done

echo "✅ Console.log cleanup complete (preserved console.error/warn)"
