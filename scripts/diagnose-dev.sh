#!/bin/bash

echo "🔍 BoxCall Dev Server Diagnostics"
echo "=================================="
echo ""

# Check Node version
NODE_VERSION=$(node --version)
echo "📦 Node version: $NODE_VERSION"

# Check if port is in use
if lsof -ti :5173 > /dev/null 2>&1; then
  PID=$(lsof -ti :5173)
  echo "✅ Dev server is running on port 5173 (PID: $PID)"
else
  echo "❌ Dev server is NOT running on port 5173"
fi
echo ""

# Check for common issues
if [ -d "node_modules/.vite" ]; then
  CACHE_SIZE=$(du -sh node_modules/.vite 2>/dev/null | cut -f1)
  echo "✅ Vite cache exists ($CACHE_SIZE)"
else
  echo "⚠️  Vite cache missing - first run may be slow"
fi

# Check font files
if [ -d "public/assets/fonts" ]; then
  FONT_COUNT=$(find public/assets/fonts -name "*.woff2" 2>/dev/null | wc -l | tr -d ' ')
  echo "📁 Font files found: $FONT_COUNT"
else
  echo "⚠️  Font directory not found"
fi
echo ""

# Check for TypeScript errors
echo "🔍 Checking for TypeScript errors..."
if npm run type-check > /dev/null 2>&1; then
  echo "✅ No TypeScript errors"
else
  echo "⚠️  TypeScript errors detected (run 'npm run type-check' for details)"
fi
echo ""

# Check environment variables
if [ -f ".env.local" ]; then
  echo "✅ .env.local exists"
  grep -q "VITE_SUPABASE_URL" .env.local 2>/dev/null && echo "  ✅ VITE_SUPABASE_URL set"
  grep -q "VITE_SUPABASE_ANON_KEY" .env.local 2>/dev/null && echo "  ✅ VITE_SUPABASE_ANON_KEY set"
  grep -q "VITE_DEBUG" .env.local 2>/dev/null && echo "  ℹ️  VITE_DEBUG enabled" || echo "  ℹ️  VITE_DEBUG not set (add for verbose logging)"
else
  echo "⚠️  .env.local not found"
fi
echo ""

# Check dependencies
if [ -d "node_modules" ]; then
  echo "✅ Dependencies installed"
else
  echo "❌ Dependencies not installed (run 'npm install')"
fi
echo ""

# Check git status
if git rev-parse --git-dir > /dev/null 2>&1; then
  BRANCH=$(git branch --show-current)
  UNCOMMITTED=$(git status --porcelain | wc -l | tr -d ' ')
  echo "📂 Git branch: $BRANCH"
  if [ "$UNCOMMITTED" -gt 0 ]; then
    echo "  ℹ️  $UNCOMMITTED uncommitted changes"
  else
    echo "  ✅ Working directory clean"
  fi
fi
echo ""

echo "=================================="
echo "💡 Quick Actions:"
echo ""
echo "  Start dev server:    npm run dev"
echo "  Type check:          npm run type-check"
echo "  Run tests:           npm run test"
echo "  Build for prod:      npm run build"
echo "  Clear Vite cache:    rm -rf node_modules/.vite"
echo "  Enable debug mode:   echo 'VITE_DEBUG=true' >> .env.local"
echo ""
echo "📚 See docs/DEV_SERVER_ERROR_GUIDE.md for troubleshooting"
echo "=================================="
