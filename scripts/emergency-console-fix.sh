#!/bin/bash

# Quick fix for critical console cleanup damage
echo "🚨 Emergency Fix for Console Cleanup"

# Quick pattern to remove dangling string literals
find src/ -name "*.ts" -exec sed -i '' '/^[[:space:]]*".*"[[:space:]]*$/d' {} \;
find src/ -name "*.tsx" -exec sed -i '' '/^[[:space:]]*".*"[[:space:]]*$/d' {} \;

# Remove standalone closing parens
find src/ -name "*.ts" -exec sed -i '' '/^[[:space:]]*);[[:space:]]*$/d' {} \;
find src/ -name "*.tsx" -exec sed -i '' '/^[[:space:]]*);[[:space:]]*$/d' {} \;

echo "✅ Emergency fixes applied"
