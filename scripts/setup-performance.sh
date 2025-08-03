#!/bin/bash

# BoxCall Performance Optimization Setup
# Phase 3: Performance Tools & Monitoring

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }

print_status "🚀 Setting up Performance Optimization Tools..."
print_status "============================================="

# 1. Install bundle analyzer
print_status "1. Installing bundle analyzer..."
npm install --save-dev webpack-bundle-analyzer
npm install --save-dev vite-bundle-analyzer

# 2. Install Core Web Vitals monitoring
print_status "2. Installing Core Web Vitals monitoring..."
npm install web-vitals

# 3. Install performance testing tools
print_status "3. Installing performance testing tools..."
npm install --save-dev lighthouse
npm install --save-dev @axe-core/playwright

# 4. Create performance monitoring utilities
print_status "4. Creating performance monitoring utilities..."

# Create web vitals monitoring
mkdir -p src/utils/performance
cat > src/utils/performance/webVitals.ts << 'EOF'
import { onCLS, onFCP, onFID, onLCP, onTTFB } from 'web-vitals';

// Core Web Vitals thresholds
const THRESHOLDS = {
  LCP: 2500, // Largest Contentful Paint
  FID: 100,  // First Input Delay
  CLS: 0.1,  // Cumulative Layout Shift
  FCP: 1800, // First Contentful Paint
  TTFB: 800  // Time to First Byte
};

interface VitalsData {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  threshold: number;
}

const reportVital = (vital: VitalsData) => {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔍 ${vital.name}: ${vital.value}ms (${vital.rating})`, {
      threshold: vital.threshold,
      delta: vital.value - vital.threshold
    });
  }

  // Send to analytics in production
  if (process.env.NODE_ENV === 'production') {
    // TODO: Integrate with your analytics service
    // analytics.track('Core Web Vital', vital);
  }
};

export const initWebVitals = () => {
  onLCP((metric) => reportVital({
    name: 'LCP',
    value: metric.value,
    rating: metric.rating,
    threshold: THRESHOLDS.LCP
  }));

  onFID((metric) => reportVital({
    name: 'FID', 
    value: metric.value,
    rating: metric.rating,
    threshold: THRESHOLDS.FID
  }));

  onCLS((metric) => reportVital({
    name: 'CLS',
    value: metric.value,
    rating: metric.rating,
    threshold: THRESHOLDS.CLS
  }));

  onFCP((metric) => reportVital({
    name: 'FCP',
    value: metric.value,
    rating: metric.rating,
    threshold: THRESHOLDS.FCP
  }));

  onTTFB((metric) => reportVital({
    name: 'TTFB',
    value: metric.value,
    rating: metric.rating,
    threshold: THRESHOLDS.TTFB
  }));
};
EOF

# 5. Create bundle analysis script
cat > scripts/analyze-bundle.sh << 'EOF'
#!/bin/bash

echo "📊 Analyzing Bundle Size..."
echo "=========================="

# Build for production
npm run build

# Analyze with vite-bundle-analyzer
npx vite-bundle-analyzer

echo ""
echo "Bundle analysis complete! Check the generated report."
EOF

chmod +x scripts/analyze-bundle.sh

# 6. Create performance test scripts
mkdir -p tests/performance
cat > tests/performance/lighthouse.spec.ts << 'EOF'
import { test, expect } from '@playwright/test';
import { playAudit } from 'playwright-lighthouse';

test.describe('Performance Tests', () => {
  test('Lighthouse performance audit', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    await playAudit({
      page,
      thresholds: {
        performance: 85,
        accessibility: 90,
        'best-practices': 85,
        seo: 80,
        pwa: 80,
      },
      port: 9222,
    });
  });
});
EOF

# 7. Update package.json with performance scripts
print_status "5. Adding performance scripts to package.json..."

# Check if package.json exists and add scripts
if [ -f "package.json" ]; then
  npm pkg set scripts.analyze="vite-bundle-analyzer"
  npm pkg set scripts.perf:test="playwright test tests/performance"
  npm pkg set scripts.perf:audit="lighthouse http://localhost:5173 --output=html --output-path=./performance-report.html"
  print_success "Added performance scripts to package.json"
fi

# 8. Create performance monitoring dashboard component
mkdir -p src/components/dev
cat > src/components/dev/PerformanceMonitor.tsx << 'EOF'
import React, { useEffect, useState } from 'react';

interface PerformanceData {
  navigation: PerformanceTiming;
  resources: PerformanceResourceTiming[];
  memory?: PerformanceMemory;
}

export const PerformanceMonitor: React.FC = () => {
  const [perfData, setPerfData] = useState<PerformanceData | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const collectPerformanceData = () => {
      const navigation = performance.timing;
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      const memory = (performance as any).memory;

      setPerfData({ navigation, resources, memory });
    };

    // Collect initial data
    collectPerformanceData();

    // Update every 5 seconds
    const interval = setInterval(collectPerformanceData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!perfData || process.env.NODE_ENV !== 'development') {
    return null;
  }

  const loadTime = perfData.navigation.loadEventEnd - perfData.navigation.navigationStart;
  const domContentLoaded = perfData.navigation.domContentLoadedEventEnd - perfData.navigation.navigationStart;

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '12px',
        borderRadius: '8px',
        fontSize: '12px',
        zIndex: 9999,
        minWidth: '200px'
      }}
    >
      <h4 style={{ margin: '0 0 8px 0' }}>⚡ Performance</h4>
      <div>Load Time: {loadTime}ms</div>
      <div>DOM Ready: {domContentLoaded}ms</div>
      <div>Resources: {perfData.resources.length}</div>
      {perfData.memory && (
        <div>Memory: {(perfData.memory.usedJSHeapSize / 1024 / 1024).toFixed(1)}MB</div>
      )}
    </div>
  );
};
EOF

print_status "============================================="
print_success "✅ Performance Optimization Tools Setup Complete!"
print_status ""
print_status "Available commands:"
print_status "• npm run analyze - Bundle size analysis"
print_status "• npm run perf:test - Performance tests"
print_status "• npm run perf:audit - Lighthouse audit"
print_status "• ./scripts/analyze-bundle.sh - Full bundle analysis"
print_status ""
print_status "Next: Import PerformanceMonitor in your App.tsx for dev monitoring"
