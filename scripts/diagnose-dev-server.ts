#!/usr/bin/env tsx
/**
 * Dev Server Diagnostic & Auto-Fix Tool
 * Run this if dev server won't start
 */

import { execSync } from "child_process";

console.log("🔍 BoxCall Dev Server Diagnostic\n");
console.log("=" .repeat(60));

// Check for processes on port 5173
console.log("\n📡 Checking port 5173...");
try {
  const processes = execSync("lsof -ti :5173 2>/dev/null").toString().trim();
  if (processes) {
    console.log(`⚠️  Found ${processes.split("\n").length} process(es) on port 5173:`);
    processes.split("\n").forEach((pid) => {
      try {
        const info = execSync(`ps -p ${pid} -o command=`).toString().trim();
        console.log(`   PID ${pid}: ${info.slice(0, 80)}${info.length > 80 ? "..." : ""}`);
      } catch {
        console.log(`   PID ${pid}: (no info)`);
      }
    });
    
    console.log("\n🔧 Killing these processes...");
    execSync("lsof -ti :5173 | xargs kill -9 2>/dev/null || true");
    console.log("✅ Processes killed");
  } else {
    console.log("✅ Port 5173 is free");
  }
} catch {
  console.log("✅ Port 5173 is free");
}

// Check Vite cache
console.log("\n📦 Checking Vite cache...");
const viteCachePath = "node_modules/.vite";
try {
  execSync(`ls ${viteCachePath} >/dev/null 2>&1`);
  console.log("ℹ️  Vite cache exists");
  console.log("   To clear: rm -rf node_modules/.vite");
} catch {
  console.log("✅ No Vite cache (clean state)");
}

// Check vite.config.ts settings
console.log("\n⚙️  Checking vite.config.ts...");
const config = require("fs").readFileSync("vite.config.ts", "utf-8");

const checks = [
  { 
    pattern: /strictPort:\s*false/, 
    name: "strictPort: false", 
    good: true 
  },
  { 
    pattern: /open:\s*true/, 
    name: "open: true (auto-open browser)", 
    good: true 
  },
  { 
    pattern: /overlay:\s*true/, 
    name: "HMR overlay: true", 
    good: true 
  },
];

checks.forEach((check) => {
  if (check.pattern.test(config)) {
    console.log(`   ✅ ${check.name}`);
  } else {
    console.log(`   ${check.good ? "⚠️ " : "ℹ️ "} ${check.name} - NOT SET`);
  }
});

// Check for zombie node processes
console.log("\n🧟 Checking for zombie node/vite processes...");
try {
  const nodeProcesses = execSync("ps aux | grep -E '(node|vite)' | grep -v grep | wc -l")
    .toString()
    .trim();
  const count = parseInt(nodeProcesses, 10);
  if (count > 10) {
    console.log(`⚠️  Found ${count} node/vite processes (seems high)`);
    console.log("   Run: pkill -f vite  (to kill all vite processes)");
  } else {
    console.log(`✅ Normal process count: ${count}`);
  }
} catch {
  console.log("✅ No zombie processes detected");
}

// Check package.json scripts
console.log("\n📜 Checking package.json scripts...");
const pkg = require("./package.json");
if (pkg.scripts.predev) {
  console.log("   ✅ predev script exists (auto-cleanup)");
} else {
  console.log("   ⚠️  No predev script (manual cleanup required)");
}

if (pkg.scripts["dev:clean"]) {
  console.log("   ✅ dev:clean script exists");
} else {
  console.log("   ⚠️  No dev:clean script");
}

// Final recommendations
console.log("\n" + "=".repeat(60));
console.log("\n💡 Recommendations:\n");
console.log("To start dev server:");
console.log("   npm run dev          # Auto-cleans port, opens browser");
console.log("   npm run dev:clean    # Explicit cleanup + start");
console.log("");
console.log("If still having issues:");
console.log("   1. Clear Vite cache:  rm -rf node_modules/.vite");
console.log("   2. Kill all vite:     pkill -f vite");
console.log("   3. Restart terminal:  Close and reopen terminal");
console.log("   4. Check .env file:   Ensure VITE_* vars are set");
console.log("");
console.log("Dev server should now:");
console.log("   ✓ Auto-kill port conflicts");
console.log("   ✓ Open browser automatically");
console.log("   ✓ Show error overlays");
console.log("   ✓ Persist through file changes (HMR)");
console.log("");
