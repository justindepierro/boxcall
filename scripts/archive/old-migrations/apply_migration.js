#!/usr/bin/env node
/**
 * Apply migration using Supabase client
 * Usage: node apply_migration.js <path-to-migration.sql>
 * Example: node apply_migration.js database/migrations/008_add_coverage_tracking.sql
 */

import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
config();

// Get migration file from command line argument
const migrationFile = process.argv[2];

if (!migrationFile) {
  console.error("❌ Please provide a migration file path");
  console.error("Usage: node apply_migration.js <path-to-migration.sql>");
  console.error("Example: node apply_migration.js database/migrations/008_add_coverage_tracking.sql");
  process.exit(1);
}

if (!fs.existsSync(migrationFile)) {
  console.error(`❌ Migration file not found: ${migrationFile}`);
  process.exit(1);
}

// Read the SQL file
const sqlContent = fs.readFileSync(migrationFile, "utf8");

console.log(`🚀 Applying migration: ${path.basename(migrationFile)}...\n`);

// Get Supabase credentials
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const DB_URL = process.env.SUPABASE_DB_URL || "";

// Extract project ref from URL
let PROJECT_REF = "";
if (SUPABASE_URL) {
  const match = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/);
  if (match) {
    PROJECT_REF = match[1];
  }
}

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("❌ Missing environment variables:");
  if (!SUPABASE_URL) console.error("   ✗ VITE_SUPABASE_URL");
  if (!SERVICE_ROLE_KEY) console.error("   ✗ SUPABASE_SERVICE_ROLE_KEY");
  console.error("\n📝 Make sure your .env file contains:");
  console.error('   VITE_SUPABASE_URL="https://your-project-ref.supabase.co"');
  console.error('   SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"');
  console.error("\n💡 Find your service role key at:");
  console.error("   Supabase Dashboard → Project Settings → API → service_role key");
  process.exit(1);
}

console.log(`📡 Connecting to project: ${PROJECT_REF}`);
console.log(`📄 Migration file: ${migrationFile}\n`);

// Use direct database connection if available, otherwise use Supabase client
async function runMigration() {
  try {
    if (DB_URL) {
      // Direct PostgreSQL connection
      console.log("🔌 Using direct database connection...\n");
      const client = new Client({ connectionString: DB_URL });
      
      await client.connect();
      console.log("✅ Connected to database\n");
      
      console.log("📝 Executing migration...");
      await client.query(sqlContent);
      
      await client.end();
      console.log("\n✅ Migration completed successfully!");
    } else {
      // Fallback to Supabase client with multiple statements
      console.log("🔌 Using Supabase client (splitting statements)...\n");
      const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });

      // Split SQL into individual statements
      const statements = sqlContent
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      console.log(`📝 Found ${statements.length} SQL statements to execute...\n`);

      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i] + ';';
        console.log(`Executing statement ${i + 1}/${statements.length}...`);
        
        const { error } = await supabase.rpc('exec', { sql: statement });
        
        if (error) {
          console.error(`\n❌ Error in statement ${i + 1}:`, error.message);
          console.error("Statement:", statement.substring(0, 100) + "...");
          throw error;
        }
      }

      console.log("\n✅ All statements executed successfully!");
    }
  } catch (error) {
    console.error("\n❌ Migration failed:", error.message);
    console.error("\n💡 Troubleshooting tips:");
    console.error("   1. Add SUPABASE_DB_URL to your .env file for direct database access");
    console.error("   2. Format: postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres");
    console.error("   3. Find connection string: Supabase Dashboard → Project Settings → Database → Connection String");
    process.exit(1);
  }
}

runMigration();
