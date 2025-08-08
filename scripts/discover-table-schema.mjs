#!/usr/bin/env node

/**
 * Schema Discovery Script
 * Discovers the actual column structure of key tables
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

// Load environment variables manually from .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function loadEnvFile() {
  try {
    const envPath = resolve(__dirname, "../.env");
    const envContent = readFileSync(envPath, "utf8");
    const envVars = {};

    envContent.split("\n").forEach((line) => {
      const [key, ...valueParts] = line.split("=");
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join("=").trim();
      }
    });

    return envVars;
  } catch (error) {
    console.error("Error loading .env file:", error.message);
    return {};
  }
}

const envVars = loadEnvFile();
const supabase = createClient(
  envVars.VITE_SUPABASE_URL,
  envVars.VITE_SUPABASE_ANON_KEY
);

async function discoverTableStructures() {
  console.log("🔍 Discovering Table Column Structures...\n");

  const tables = ["teams", "team_members", "plays", "playbooks", "profiles"];

  for (const tableName of tables) {
    console.log(`📊 Table: ${tableName}`);
    try {
      // Try to get column information from information_schema
      const { data: columns, error: columnsError } = await supabase
        .from("information_schema.columns")
        .select("column_name, data_type, is_nullable")
        .eq("table_name", tableName)
        .eq("table_schema", "public")
        .order("ordinal_position");

      if (!columnsError && columns && columns.length > 0) {
        console.log("   Columns:");
        columns.forEach((col) => {
          console.log(
            `     • ${col.column_name} (${col.data_type}${col.is_nullable === "YES" ? ", nullable" : ""})`
          );
        });
      } else {
        // Fallback: try to select with limit 0 to see structure
        const { error: selectError } = await supabase
          .from(tableName)
          .select("*")
          .limit(0);

        if (selectError) {
          console.log(`   ❌ Access restricted: ${selectError.message}`);
        } else {
          console.log("   ✅ Accessible but no column info available");
        }
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    console.log();
  }
}

discoverTableStructures()
  .then(() => {
    console.log("✨ Schema discovery complete!");
  })
  .catch((error) => {
    console.error("💥 Discovery failed:", error);
  });
