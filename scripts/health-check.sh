#!/bin/bash

echo "🔍 BoxCall Error Checking System"
echo "================================"
echo ""

echo "📝 TypeScript Compilation Check..."
if npm run type-check > /dev/null 2>&1; then
    echo "✅ TypeScript: No errors"
else
    echo "❌ TypeScript: Errors found"
    npm run type-check
fi

echo ""
echo "🔍 ESLint Code Quality Check..."
if npm run lint > /dev/null 2>&1; then
    echo "✅ ESLint: No errors"
else
    echo "❌ ESLint: Errors found"
    npm run lint
fi

echo ""
echo "📁 Project Structure Check..."
MISSING_DIRS=()

# Check critical directories exist
for dir in "src/components" "src/utils" "src/features" "docs"; do
    if [ ! -d "$dir" ]; then
        MISSING_DIRS+=("$dir")
    fi
done

if [ ${#MISSING_DIRS[@]} -eq 0 ]; then
    echo "✅ Project Structure: All critical directories present"
else
    echo "⚠️  Project Structure: Missing directories: ${MISSING_DIRS[*]}"
fi

echo ""
echo "🔧 Configuration Files Check..."
CONFIG_FILES=("package.json" "tsconfig.json" "tailwind.config.js" "postcss.config.js" "vite.config.ts")
MISSING_CONFIGS=()

for file in "${CONFIG_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        MISSING_CONFIGS+=("$file")
    fi
done

if [ ${#MISSING_CONFIGS[@]} -eq 0 ]; then
    echo "✅ Configuration: All config files present"
else
    echo "❌ Configuration: Missing files: ${MISSING_CONFIGS[*]}"
fi

echo ""
echo "📦 Node Modules Check..."
if [ -d "node_modules" ] && [ -f "package-lock.json" ]; then
    echo "✅ Dependencies: Installed"
else
    echo "❌ Dependencies: Run 'npm install'"
fi

echo ""
echo "🎯 Summary"
echo "=========="
echo "If all items show ✅, your BoxCall development environment is ready!"
echo "Any ❌ items need to be fixed before development."
echo ""
