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
