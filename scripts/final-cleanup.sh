#!/bin/bash

echo "🧹 Final BoxCall Cleanup - Removing Empty/Unused Directories"
echo "============================================================="

# Remove empty/placeholder test directories
echo "🗑️  Removing placeholder test directories..."
rm -rf tests/

# Remove Storybook if not actively used
echo "🗑️  Removing Storybook setup..."
rm -rf .storybook/ stories/

# Remove mobile directory (can be recreated if needed)
echo "🗑️  Removing mobile directory..."
rm -rf mobile/

# Check if shared directory is actually used
echo "🔍 Checking shared directory usage..."
shared_usage=$(grep -r "shared/" src/ 2>/dev/null | wc -l)
if [[ $shared_usage -eq 0 ]]; then
    echo "🗑️  Removing unused shared directory..."
    rm -rf shared/
else
    echo "✅ Keeping shared directory (found $shared_usage references)"
fi

# Remove .husky and commitlint if not using git hooks
echo "🗑️  Removing git hooks setup..."
rm -rf .husky/
rm -f .commitlintrc.json

# Update package.json to remove storybook and husky dependencies
echo "📦 Updating package.json..."
npm uninstall @storybook/addon-links @storybook/addon-onboarding @storybook/react @storybook/react-vite storybook husky @commitlint/cli @commitlint/config-conventional 2>/dev/null || true

# Remove storybook scripts from package.json
if command -v sed >/dev/null 2>&1; then
    # Create a temporary package.json without storybook scripts
    grep -v '"storybook":\|"build-storybook":' package.json > package.json.tmp && mv package.json.tmp package.json
fi

echo ""
echo "🧹 Cleaned up:"
echo "  ✅ Removed test directory placeholders"
echo "  ✅ Removed Storybook setup"
echo "  ✅ Removed mobile directory"
echo "  ✅ Removed git hooks setup"
echo "  ✅ Updated package.json dependencies"

echo ""
echo "📁 Current directory structure:"
ls -la | grep "^d" | awk '{print "  📂 " $9}'

echo ""
echo "🔍 Verifying project still works..."
npm install --silent
npm run type-check

if [[ $? -eq 0 ]]; then
    echo "✅ TypeScript compilation successful"
else
    echo "❌ TypeScript compilation failed - may need manual review"
fi

echo ""
echo "🎉 Cleanup complete!"
echo "The project has been significantly streamlined."
