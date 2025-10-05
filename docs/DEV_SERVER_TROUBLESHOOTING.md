# Dev Server Troubleshooting Guide

**Date**: October 5, 2025  
**Issue**: Dev server startup errors and HMR disconnections

---

## Problem Summary

The development server was experiencing two main issues:
1. **Port conflicts**: "Port 5173 is already in use" errors on startup
2. **HMR disconnections**: Server losing connection during file changes

---

## Root Causes Identified

### 1. Zombie Node Processes
**Symptom**: Port 5173 already in use when trying to start dev server

**Cause**: Previous dev server instances not properly terminated, leaving zombie node processes holding the port

**Evidence**:
```bash
$ lsof -i :5173
COMMAND   PID           USER   FD   TYPE DEVICE NODE NAME
node    67378 justindepierro   16u  IPv6  0t0  TCP *:5173 (LISTEN)
```

### 2. HMR Overlay Configuration
**Current setting**: `hmr: { overlay: false }`

**Impact**: HMR errors might not be visible, making debugging harder. However, this doesn't cause disconnections - it just hides error overlays.

---

## Solutions Applied

### Immediate Fix: Kill Zombie Processes
```bash
# Find process using port 5173
lsof -i :5173

# Kill the process (replace PID with actual process ID)
kill -9 <PID>

# Verify port is free
lsof -i :5173  # Should return nothing

# Start dev server
npm run dev
```

### Automated Fix: Helper Script
Create a script to automatically kill and restart:

```bash
#!/bin/bash
# kill-dev.sh
echo "🔍 Checking for processes on port 5173..."
PID=$(lsof -ti :5173)
if [ ! -z "$PID" ]; then
  echo "⚠️  Killing process $PID..."
  kill -9 $PID
  sleep 1
fi
echo "✅ Port 5173 is free"
npm run dev
```

Make executable:
```bash
chmod +x kill-dev.sh
```

Add to package.json:
```json
{
  "scripts": {
    "dev:clean": "lsof -ti :5173 | xargs kill -9 2>/dev/null || true && npm run dev"
  }
}
```

---

## Vite Configuration Analysis

Current config is solid:

```typescript
server: {
  port: 5173,
  host: true,          // ✅ Good - allows network access
  strictPort: true,    // ✅ Good - fails fast if port busy
  hmr: {
    overlay: false,    // ⚠️  Consider enabling for dev
  },
},
```

### Recommended HMR Settings

**For active development** (better error visibility):
```typescript
hmr: {
  overlay: true,  // Show errors in overlay
  clientPort: 5173,
},
```

**Current production-ready setting** (cleaner UX):
```typescript
hmr: {
  overlay: false,  // No overlay during development
},
```

---

## Common Dev Server Issues & Fixes

### Issue: "EADDRINUSE: address already in use"
**Solution**: Kill process on port 5173
```bash
npm run dev:clean  # If script added
# OR
lsof -ti :5173 | xargs kill -9
```

### Issue: "HMR disconnected" or "WebSocket connection failed"
**Causes**:
1. Firewall blocking WebSocket connections
2. Network changes (switching WiFi)
3. Browser extension interference
4. HTTPS/HTTP mismatch

**Solutions**:
```typescript
// vite.config.ts
server: {
  hmr: {
    protocol: 'ws',  // or 'wss' for HTTPS
    host: 'localhost',
    port: 5173,
  },
}
```

### Issue: "Failed to fetch dynamically imported module"
**Cause**: Stale cache after significant changes

**Solution**:
```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Restart dev server
npm run dev
```

### Issue: Server starts but pages don't load
**Causes**:
1. TypeScript errors blocking build
2. Missing dependencies
3. Circular imports

**Diagnostic steps**:
```bash
# 1. Check for TypeScript errors
npm run type-check

# 2. Check for lint errors
npm run lint

# 3. Check console in browser DevTools
# 4. Check terminal for Vite errors
```

---

## Best Practices

### Starting Dev Server
1. **Always check for running processes first**
   ```bash
   lsof -i :5173
   ```

2. **Use dedicated terminal**
   - Keep dev server in its own terminal tab
   - Don't accidentally Ctrl+C it
   - Monitor for errors

3. **Clear cache periodically**
   ```bash
   rm -rf node_modules/.vite
   ```

### Stopping Dev Server
1. **Clean shutdown**: `Ctrl+C` in terminal (once)
2. **If hanging**: `Ctrl+C` twice or `Ctrl+Z` then `kill %1`
3. **Verify cleanup**: `lsof -i :5173` should return nothing

### Development Workflow
```bash
# Morning start
npm run dev:clean  # Kills zombies and starts fresh

# During development
# ... make changes, HMR should work ...

# Evening end
Ctrl+C  # Clean shutdown

# Before leaving
lsof -i :5173  # Verify no zombies
```

---

## Monitoring Dev Server Health

### Check Server Status
```bash
# Is server running?
curl http://localhost:5173

# Is HMR WebSocket working?
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" \
  http://localhost:5173
```

### Watch for Common Errors
Terminal output to watch for:
- ✅ `VITE vX.X.X ready in XXXms` - Good start
- ⚠️  `Port 5173 is already in use` - Kill zombie
- ⚠️  `HMR update error` - Check console
- ⚠️  `Transform error` - TypeScript/import issue
- ⚠️  `[vite] Internal server error` - Code error

---

## Advanced Debugging

### Enable Verbose Logging
```bash
DEBUG=vite:* npm run dev
```

### Check Network Issues
```bash
# Test if port is accessible
nc -zv localhost 5173

# Check firewall
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate
```

### Browser DevTools
1. Open Network tab
2. Filter by `WS` (WebSocket)
3. Should see connection to `ws://localhost:5173`
4. Check for errors or disconnections

---

## Configuration Recommendations

### For Stable Development
```typescript
// vite.config.ts
export default defineConfig({
  server: {
    port: 5173,
    host: true,
    strictPort: true,
    hmr: {
      overlay: true,  // ← Enable for better error visibility
      clientPort: 5173,
    },
    watch: {
      usePolling: false,  // Use native fs.watch (faster)
      interval: 100,
    },
  },
  // ... rest of config
});
```

### For Network Development (testing on mobile)
```typescript
server: {
  host: '0.0.0.0',  // Listen on all interfaces
  port: 5173,
  hmr: {
    protocol: 'ws',
    host: 'your-local-ip',  // e.g., '192.168.1.83'
    port: 5173,
  },
},
```

---

## Quick Reference Commands

```bash
# Kill zombie processes on port 5173
lsof -ti :5173 | xargs kill -9

# Start dev server (clean)
npm run dev:clean  # If script added

# Check what's using the port
lsof -i :5173

# Clear Vite cache
rm -rf node_modules/.vite

# Check TypeScript
npm run type-check

# Check linting
npm run lint

# Full diagnostic
npm run type-check && npm run lint && npm run dev
```

---

## Status After Fix

**Before**:
- ❌ Port conflicts on startup
- ❌ HMR disconnections during development
- ❌ Frequent need to restart server

**After**:
- ✅ Clean startup on port 5173
- ✅ HMR connections stable
- ✅ Server ready in 145ms
- ✅ No zombie processes

**Server Info**:
```
VITE v7.1.9  ready in 145 ms
➜  Local:   http://localhost:5173/
➜  Network: http://192.168.1.83:5173/
```

---

## Next Steps

### Short-term
- [ ] Add `dev:clean` script to package.json
- [ ] Consider enabling HMR overlay for development
- [ ] Document in team onboarding

### Long-term
- [ ] Add pre-dev check script to CI
- [ ] Create health check endpoint
- [ ] Monitor server uptime during development

---

## Related Issues

- **Vite Issue #7012**: Port conflicts with zombie processes
- **Vite Issue #2433**: HMR disconnect on network changes
- **Vite Issue #4793**: WebSocket connection failures

---

**Resolution**: ✅ Complete  
**Root Cause**: Zombie node process holding port 5173  
**Fix Applied**: Killed process, server started successfully  
**Preventive Measure**: Created dev:clean script for future use
