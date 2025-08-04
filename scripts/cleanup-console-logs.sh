#!/bin/bash

# Remove console.log statements but keep console.error for error handling
echo "🧹 Cleaning up console.log statements from production code..."

# Find and remove console.log but keep console.error/warn
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' '/console\.log(/d'

echo "✅ Removed console.log statements (kept console.error/warn for error handling)"
