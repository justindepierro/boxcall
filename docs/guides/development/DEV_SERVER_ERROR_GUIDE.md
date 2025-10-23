# Dev Server Error Debugging Guide

## Common Errors and Solutions

### 1. `ERR_CONNECTION_REFUSED` Errors

**Symptom:** Multiple files showing connection refused errors

**Root Cause:** Dev server is not running or has crashed

**Solutions:**

```bash
# Check if server is running
lsof -ti :5173

# Kill any stale processes
npm run predev

# Restart dev server
npm run dev
```

### 2. "Resource was preloaded using link preload but not used" Warning

**Current Status:** 6 warnings in index.html

**Root Cause:** Font files are preloaded but may not be used immediately in critical render path

**Solutions:**

#### Option A: Remove unused preloads (Quick Fix)

```html
<!-- Remove or comment out in index.html -->
<!-- Only preload fonts used in critical rendering -->
```

#### Option B: Ensure fonts are actually used immediately

```css
/* In your CSS, make sure these fonts are used right away */
body {
  font-family: "Inter", sans-serif; /* Uses Inter-400/500/600 */
}
```

#### Option C: Add `fetchpriority="low"` for non-critical fonts

```html
<link
  rel="preload"
  href="/assets/fonts/Jetbrains-Mono-400.woff2"
  as="font"
  type="font/woff2"
  crossorigin
  fetchpriority="low"
/>
```

### 3. "Message channel closed before response" Error

**Root Cause:** Browser extension (usually Chrome extensions) trying to communicate

**Solutions:**

- This is NOT your code - it's a browser extension issue
- Safe to ignore in development
- Test in incognito mode to confirm
- Disable extensions one by one to find culprit

Common culprits:

- React DevTools
- Redux DevTools
- LastPass
- Grammarly
- Ad blockers

### 4. Console Output Cleanup

**Current Status:** 379 console.error/console.warn statements in codebase

**Recommendations:**

#### Create a Logger Utility

```typescript
// src/utils/devLogger.ts
const isDev = import.meta.env.DEV;

export const devLogger = {
  error: (...args: any[]) => {
    if (isDev) console.error("[DEV]", ...args);
  },
  warn: (...args: any[]) => {
    if (isDev) console.warn("[DEV]", ...args);
  },
  info: (...args: any[]) => {
    if (isDev) console.info("[DEV]", ...args);
  },
  debug: (...args: any[]) => {
    if (isDev && import.meta.env.VITE_DEBUG) {
      console.debug("[DEBUG]", ...args);
    }
  },
};
```

#### Replace Console Statements Gradually

```typescript
// Old
console.error("Failed to fetch user");

// New
import { devLogger } from "@/utils/devLogger";
devLogger.error("Failed to fetch user");
```

#### Add Debug Mode

```bash
# .env.local
VITE_DEBUG=true  # Enable verbose debugging
```

### 5. Vite HMR (Hot Module Replacement) Issues

**Symptoms:**

- Changes not reflecting
- Full page reload instead of HMR
- Multiple reloads

**Solutions:**

#### Check vite.config.ts

```typescript
export default defineConfig({
  server: {
    hmr: {
      overlay: true, // Show errors in browser overlay
    },
  },
});
```

#### Clear Vite cache

```bash
rm -rf node_modules/.vite
npm run dev
```

## Performance Monitoring

### Enable Vite Debug Logging

```bash
DEBUG=vite:* npm run dev
```

### Check Bundle Size

```bash
npm run build -- --debug
```

### Profile Page Load

```javascript
// Add to main.tsx temporarily
if (import.meta.env.DEV) {
  performance.mark("app-start");

  window.addEventListener("load", () => {
    performance.mark("app-loaded");
    performance.measure("app-load-time", "app-start", "app-loaded");

    const measure = performance.getEntriesByName("app-load-time")[0];
    console.log(`App loaded in ${measure.duration}ms`);
  });
}
```

## Quick Diagnostic Script

Create `scripts/diagnose-dev.sh`:

```bash
#!/bin/bash

echo "🔍 BoxCall Dev Server Diagnostics"
echo "=================================="

# Check Node version
echo "Node version: $(node --version)"

# Check if port is in use
if lsof -ti :5173 > /dev/null; then
  echo "✅ Dev server is running on port 5173"
else
  echo "❌ Dev server is NOT running"
fi

# Check for common issues
if [ -f "node_modules/.vite/deps/_metadata.json" ]; then
  echo "✅ Vite dependencies cached"
else
  echo "⚠️  Vite cache missing - may cause slow startup"
fi

# Check font files
FONT_COUNT=$(find public/assets/fonts -name "*.woff2" 2>/dev/null | wc -l)
echo "📁 Font files found: $FONT_COUNT"

# Check for TypeScript errors
echo "🔍 Checking for TypeScript errors..."
npm run type-check > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "✅ No TypeScript errors"
else
  echo "⚠️  TypeScript errors detected"
fi

# Check environment variables
if [ -f ".env.local" ]; then
  echo "✅ .env.local exists"
  grep -q "VITE_SUPABASE_URL" .env.local && echo "  ✅ VITE_SUPABASE_URL set"
  grep -q "VITE_SUPABASE_ANON_KEY" .env.local && echo "  ✅ VITE_SUPABASE_ANON_KEY set"
else
  echo "⚠️  .env.local not found"
fi

echo "=================================="
echo "Run 'npm run dev' to start server"
```

## Browser DevTools Tips

### Filter Console Output

```javascript
// In browser console, create filters:

// Show only your app errors (not extensions)
-chrome-extension -moz-extension

// Show only network errors
/Failed to load resource/

// Show only HMR updates
/\[vite\]/
```

### Network Tab Filters

- Filter: `localhost:5173`
- Hide: `chrome-extension://`
- Focus on failed requests (red)

### React DevTools Profiler

1. Open React DevTools
2. Go to Profiler tab
3. Click record
4. Perform action
5. See which components are slow

## Action Items

### Immediate (5 min)

- [ ] Comment out unused font preloads in index.html
- [ ] Test in incognito mode to verify extension errors
- [ ] Add `.vite` to `.gitignore` if not already there

### Short Term (1 hour)

- [ ] Create devLogger utility
- [ ] Replace top 10 noisiest console.error/warn calls
- [ ] Add VITE_DEBUG environment variable

### Long Term (ongoing)

- [ ] Gradually replace all console statements with devLogger
- [ ] Set up error boundary for production
- [ ] Add Sentry or similar error tracking for production

## Related Files

- `index.html` - Font preloads causing warnings
- `vite.config.ts` - Dev server configuration
- `src/utils/logger.ts` - Existing logger (if any)
- `src/utils/bundleOptimization.ts` - Service worker registration

## Monitoring Production

In production, these dev server errors won't exist. Monitor production with:

```typescript
// src/utils/errorTracking.ts
if (import.meta.env.PROD) {
  window.addEventListener("error", (event) => {
    // Send to error tracking service
    console.error("Production error:", event.error);
  });

  window.addEventListener("unhandledrejection", (event) => {
    console.error("Unhandled promise rejection:", event.reason);
  });
}
```

## Additional Resources

- [Vite Troubleshooting](https://vitejs.dev/guide/troubleshooting.html)
- [Chrome DevTools Network](https://developer.chrome.com/docs/devtools/network/)
- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
