#!/bin/bash

# Phase 4 Responsive Dashboard Validation Script
# Tests responsive behavior across breakpoints

echo "🧪 Phase 4 Responsive Dashboard Validation"
echo "=========================================="

# Check if development server is running
if curl -s http://localhost:5174 > /dev/null; then
    echo "✅ Development server is running on localhost:5174"
else
    echo "❌ Development server is not running"
    exit 1
fi

# Check TypeScript compilation
echo "📊 Checking TypeScript compilation..."
if npx tsc --noEmit > /dev/null 2>&1; then
    echo "✅ Zero TypeScript compilation errors"
else
    echo "❌ TypeScript compilation errors detected"
    npx tsc --noEmit
fi

# Check if CSS files exist and are imported
echo "🎨 Checking CSS imports..."
if grep -q "responsive-dashboard.css" src/main.tsx; then
    echo "✅ responsive-dashboard.css is properly imported"
else
    echo "❌ responsive-dashboard.css import not found"
fi

# Validate component files exist
echo "⚛️  Checking React components..."
components=(
    "src/components/dashboard/ResponsiveDashboardLayout.tsx"
    "src/components/mobile/MobileBottomNavigation.tsx"
    "src/components/mobile/MobileQuickActions.tsx"
    "src/pages/DashboardPage.tsx"
)

for component in "${components[@]}"; do
    if [[ -f "$component" ]]; then
        echo "✅ $component exists"
    else
        echo "❌ $component missing"
    fi
done

# Check for problematic JavaScript mobile detection
echo "🔍 Checking for old mobile detection patterns..."
if grep -r "window.innerWidth" src/pages/DashboardPage.tsx > /dev/null 2>&1; then
    echo "❌ JavaScript mobile detection still found in DashboardPage.tsx"
    grep -n "window.innerWidth" src/pages/DashboardPage.tsx
else
    echo "✅ No JavaScript mobile detection found - using CSS-only approach"
fi

echo ""
echo "📱 Manual Testing Checklist:"
echo "1. Open http://localhost:5174 in browser"
echo "2. Open browser dev tools (F12)"
echo "3. Toggle device toolbar (Ctrl+Shift+M)"
echo "4. Test breakpoints:"
echo "   - Mobile: 320px (iPhone SE)"
echo "   - Mobile: 375px (iPhone 12/13)"
echo "   - Tablet: 768px (iPad)"
echo "   - Desktop: 1024px+"
echo ""
echo "Expected behavior:"
echo "- Mobile: Stack layout, bottom nav, view switcher"
echo "- Tablet: 2x2 grid, no bottom nav"
echo "- Desktop: 3-column grid, no mobile elements"

echo ""
echo "✨ Validation script complete! Ready for manual testing."
