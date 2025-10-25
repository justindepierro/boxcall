#!/usr/bin/env node
/**
 * Simple migration runner - Uses Supabase client to run migrations
 * Works directly in VS Code terminal!
 *
 * Usage: node run-migration.js <path-to-migration.sql>
 * Example: node run-migration.js database/migrations/008_add_coverage_tracking.sql
 */

import fs from "fs";
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import path from "path";

// Load environment variables
config();

// Get migration file from command line argument
const migrationFile = process.argv[2];

if (!migrationFile) {
  console.error("❌ Please provide a migration file path");
  console.error("\nUsage: node run-migration.js <path-to-migration.sql>");
  console.error("\n📝 Available migrations:");
  const migrations = fs
    .readdirSync("database/migrations")
    .filter((f) => f.endsWith(".sql"))
    .sort();
  migrations.forEach((m) => console.error(`   - database/migrations/${m}`));
  process.exit(1);
}

if (!fs.existsSync(migrationFile)) {
  console.error(`❌ Migration file not found: ${migrationFile}`);
  process.exit(1);
}

// Read the SQL file
const sqlContent = fs.readFileSync(migrationFile, "utf8");

console.log(`\n🚀 Running Migration\n`);
console.log(`📄 File: ${path.basename(migrationFile)}`);

// Get Supabase credentials
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("\n❌ Missing environment variables:");
  if (!SUPABASE_URL) console.error("   ✗ VITE_SUPABASE_URL");
  if (!SERVICE_ROLE_KEY) console.error("   ✗ SUPABASE_SERVICE_ROLE_KEY");
  console.error("\n📝 Make sure your .env file contains:");
  console.error('   VITE_SUPABASE_URL="https://xxxxx.supabase.co"');
  console.error('   SUPABASE_SERVICE_ROLE_KEY="eyJxxx..."');
  console.error("\n💡 Find your service role key at:");
  console.error("   Supabase Dashboard → Settings → API → service_role");
  process.exit(1);
}

// Extract project ref
const match = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/);
const PROJECT_REF = match ? match[1] : "unknown";

console.log(`📡 Project: ${PROJECT_REF}\n`);

// Create Supabase client with service role
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function runMigration() {
  try {
    // Split SQL into statements (handle both ; and $$ delimiters)
    const statements = [];
    let currentStatement = "";
    let inDollarQuote = false;

    const lines = sqlContent.split("\n");

    for (const line of lines) {
      const trimmed = line.trim();

      // Skip comments
      if (trimmed.startsWith("--")) continue;

      // Track $$ blocks (for functions)
      if (trimmed.includes("$$")) {
        inDollarQuote = !inDollarQuote;
      }

      currentStatement += line + "\n";

      // Statement ends at ; (but not inside $$ blocks)
      if (!inDollarQuote && trimmed.endsWith(";")) {
        const stmt = currentStatement.trim();
        if (stmt && stmt !== ";") {
          statements.push(stmt);
        }
        currentStatement = "";
      }
    }

    // Add any remaining statement
    if (currentStatement.trim()) {
      statements.push(currentStatement.trim());
    }

    console.log(`📝 Found ${statements.length} SQL statement(s)\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      const preview = statement.substring(0, 60).replace(/\s+/g, " ");

      console.log(`   ${i + 1}/${statements.length}: ${preview}...`);

      // Use raw SQL query - this requires a custom RPC or direct query
      // For Supabase, we'll use the .rpc() method if available, or raw fetch
      const { data, error } = await supabase
        .rpc("exec", {
          sql: statement,
        })
        .catch(async () => {
          // Fallback: Try to execute via REST API directly
          const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: SERVICE_ROLE_KEY,
              Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
              Prefer: "return=representation",
            },
            body: JSON.stringify({ sql: statement }),
          });

          if (!response.ok) {
            throw new Error(
              `HTTP ${response.status}: ${await response.text()}`
            );
          }

          return { data: await response.json(), error: null };
        });

      if (error) {
        console.error(`\n❌ Error executing statement ${i + 1}:`);
        console.error(`   ${error.message}`);
        console.error(`\n📄 Failed statement:`);
        console.error(statement);
        console.error(
          "\n💡 You may need to run this migration manually in Supabase SQL Editor:"
        );
        console.error(`   Dashboard → SQL Editor → New Query → Paste the SQL`);
        process.exit(1);
      }
    }

    console.log(`\n✅ Migration completed successfully!\n`);
  } catch (error) {
    console.error("\n❌ Migration failed:");
    console.error(`   ${error.message}\n`);
    console.error("💡 Alternative: Run migration in Supabase Dashboard");
    console.error(
      "   1. Open: https://supabase.com/dashboard/project/" + PROJECT_REF
    );
    console.error("   2. Go to: SQL Editor");
    console.error("   3. Click: New Query");
    console.error("   4. Paste the SQL from: " + migrationFile);
    console.error("   5. Click: Run\n");
    process.exit(1);
  }
}

runMigration();
