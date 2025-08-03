#!/bin/bash

# BoxCall Developer Experience Enhancement
# Phase 4: Code Quality Tools & Automation

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }

print_status "🛠️  Setting up Developer Experience Tools..."
print_status "============================================="

# 1. Install code quality tools
print_status "1. Installing code quality tools..."
npm install --save-dev --legacy-peer-deps prettier husky lint-staged @commitlint/cli @commitlint/config-conventional

# 2. Setup Prettier configuration
print_status "2. Setting up Prettier configuration..."
cat > .prettierrc << 'EOF'
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": false,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
EOF

cat > .prettierignore << 'EOF'
# Dependencies
node_modules
dist
build

# Generated files
coverage
.nyc_output
*.log

# Config files
package-lock.json
yarn.lock
EOF

# 3. Setup Husky for Git hooks
print_status "3. Setting up Git hooks with Husky..."
npx husky init
echo "npx lint-staged" > .husky/pre-commit
chmod +x .husky/pre-commit

# 4. Setup lint-staged configuration
print_status "4. Setting up lint-staged..."
npm pkg set lint-staged.'{src,tests}/**/*.{ts,tsx}[0]'="eslint --fix"
npm pkg set lint-staged.'{src,tests}/**/*.{ts,tsx,js,jsx,json,css,md}[1]'="prettier --write"

# 5. Setup commit linting
cat > .commitlintrc.js << 'EOF'
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'chore',
        'ci',
        'build'
      ]
    ],
    'subject-case': [2, 'never', ['start-case', 'pascal-case', 'upper-case']],
    'subject-max-length': [2, 'always', 72]
  }
};
EOF

echo "npx --no -- commitlint --edit \$1" > .husky/commit-msg
chmod +x .husky/commit-msg

# 6. Add development scripts to package.json
print_status "5. Adding development scripts..."
npm pkg set scripts.format="prettier --write ."
npm pkg set scripts.format:check="prettier --check ."
npm pkg set scripts.lint:fix="eslint . --ext ts,tsx --fix"
npm pkg set scripts.quality:check="npm run type-check && npm run lint && npm run format:check"
npm pkg set scripts.prepare="husky"

# 7. Create VS Code workspace settings
print_status "6. Setting up VS Code workspace..."
mkdir -p .vscode
cat > .vscode/settings.json << 'EOF'
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.suggest.autoImports": true,
  "files.exclude": {
    "node_modules": true,
    "dist": true,
    "build": true,
    "**/.DS_Store": true
  },
  "search.exclude": {
    "node_modules": true,
    "dist": true,
    "build": true,
    "coverage": true
  }
}
EOF

cat > .vscode/extensions.json << 'EOF'
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "ms-playwright.playwright",
    "ms-vscode.test-adapter-converter"
  ]
}
EOF

# 8. Create development health check script
cat > scripts/health-check.sh << 'EOF'
#!/bin/bash

echo "🏥 BoxCall Development Health Check"
echo "================================="

# Check Node.js version
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"

# Check TypeScript
echo "TypeScript: $(npx tsc --version)"

# Check if all dependencies are installed
if [ -d "node_modules" ]; then
  echo "✅ Dependencies installed"
else
  echo "❌ Dependencies not installed - run 'npm install'"
fi

# Check if development server is responsive
if curl -s http://localhost:5173 > /dev/null; then
  echo "✅ Development server running"
else
  echo "⚠️  Development server not running - run 'npm run dev'"
fi

# Run quick checks
echo ""
echo "Running quick quality checks..."
npm run type-check --silent && echo "✅ TypeScript compilation" || echo "❌ TypeScript errors"
npm run lint --silent && echo "✅ ESLint passing" || echo "❌ ESLint errors"
npm run format:check --silent && echo "✅ Code formatting" || echo "❌ Formatting issues"

echo ""
echo "🎯 Health check complete!"
EOF

chmod +x scripts/health-check.sh

# 9. Create comprehensive package.json scripts update
print_status "7. Updating package.json with comprehensive scripts..."
npm pkg set scripts.dev:check="./scripts/health-check.sh && npm run dev"
npm pkg set scripts.precommit="npm run quality:check"
npm pkg set scripts.clean="rm -rf node_modules dist build coverage .nyc_output"
npm pkg set scripts.clean:install="npm run clean && npm install"

print_status "============================================="
print_success "✅ Developer Experience Tools Setup Complete!"
print_status ""
print_status "🎯 Available development commands:"
print_status "• npm run dev:check - Health check + start dev server"
print_status "• npm run quality:check - Run all quality checks"
print_status "• npm run format - Format all code"
print_status "• npm run lint:fix - Fix ESLint issues"
print_status "• npm run analyze - Bundle analysis"
print_status "• npm run perf:test - Performance tests"
print_status "• ./scripts/health-check.sh - Quick health check"
print_status ""
print_status "🔧 Git hooks configured:"
print_status "• Pre-commit: Auto-lint and format"
print_status "• Commit-msg: Enforce conventional commits"
print_status ""
print_success "🚀 BoxCall workspace optimization complete!"
print_status "Your development environment is now production-ready!"
