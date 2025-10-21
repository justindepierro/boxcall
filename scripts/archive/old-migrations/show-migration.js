#!/usr/bin/env node
/**
 * Display migration SQL for easy copy-paste to Supabase SQL Editor
 * This is the SIMPLEST way to run migrations!
 * 
 * Usage: node show-migration.js <path-to-migration.sql>
 * Example: node show-migration.js database/migrations/008_add_coverage_tracking.sql
 */

import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';

config();

const migrationFile = process.argv[2];

if (!migrationFile) {
  console.log("\n📋 Available Migrations:\n");
  const migrations = fs.readdirSync('database/migrations')
    .filter(f => f.endsWith('.sql'))
    .sort();
  
  migrations.forEach((m, i) => {
    console.log(`   ${i + 1}. ${m}`);
  });
  
  console.log("\n💡 Usage: node show-migration.js database/migrations/<filename>.sql\n");
  process.exit(0);
}

if (!fs.existsSync(migrationFile)) {
  console.error(`\n❌ File not found: ${migrationFile}\n`);
  process.exit(1);
}

const sqlContent = fs.readFileSync(migrationFile, "utf8");
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "";
const match = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/);
const PROJECT_REF = match ? match[1] : "your-project";

console.log("\n" + "=".repeat(80));
console.log(`📄 Migration: ${path.basename(migrationFile)}`);
console.log("=".repeat(80));
console.log("\n🚀 HOW TO RUN THIS MIGRATION:\n");
console.log(`   1. Open: https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new`);
console.log("   2. Copy the SQL below (between the lines)");
console.log("   3. Paste into the SQL Editor");
console.log("   4. Click RUN\n");
console.log("=".repeat(80));
console.log("📝 SQL TO COPY:");
console.log("=".repeat(80));
console.log("\n" + sqlContent + "\n");
console.log("=".repeat(80));
console.log("✅ Copy the SQL above and run it in Supabase SQL Editor");
console.log("=".repeat(80) + "\n");
