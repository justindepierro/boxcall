#!/usr/bin/env tsx
/**
 * Full Database Backup Script
 * Creates a complete backup of all tables and exports to JSON
 *
 * Usage:
 *   npm run backup
 *   or
 *   npx tsx scripts/backup/backup-database.ts
 *
 * Environment Variables Required:
 *   - VITE_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("❌ Error: Missing required environment variables");
  console.error("   Required: VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

interface BackupMetadata {
  timestamp: string;
  tables: string[];
  recordCounts: Record<string, number>;
  version: string;
  duration: number;
  success: boolean;
}

/**
 * Backup a single table
 */
async function backupTable(tableName: string): Promise<any[]> {
  console.log(`  📦 Backing up table: ${tableName}...`);

  try {
    const { data, error } = await supabase.from(tableName).select("*");

    if (error) {
      console.error(`     ❌ Error: ${error.message}`);
      throw error;
    }

    const count = data?.length || 0;
    console.log(`     ✓ Backed up ${count} records`);
    return data || [];
  } catch (error: any) {
    console.error(`     ❌ Failed to backup ${tableName}:`, error.message);
    return [];
  }
}

/**
 * Main backup function
 */
async function createBackup() {
  const startTime = Date.now();
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupDir = path.join(process.cwd(), "backups", timestamp);

  // Create backup directory
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  console.log("\n╔══════════════════════════════════════════════════════════╗");
  console.log("║           BoxCall Database Backup                        ║");
  console.log("╚══════════════════════════════════════════════════════════╝\n");
  console.log(
    `🕐 Start time: ${new Date(timestamp.replace(/-/g, ":")).toLocaleString()}`
  );
  console.log(`📁 Backup directory: ${backupDir}\n`);

  // Tables to backup (in order of dependencies)
  const tables = [
    // Core user tables
    "profiles",

    // Team tables
    "teams",
    "team_members",
    "team_invitations",

    // Playbook tables
    "plays",
    "play_assignments",

    // Practice/Game tables
    "practice_plans",
    "game_plans",

    // Activity tables
    "activities",

    // Social tables (if they exist)
    "posts",
    "comments",

    // Achievement tables (if they exist)
    "achievements",
    "player_achievements",
  ];

  const metadata: BackupMetadata = {
    timestamp,
    tables,
    recordCounts: {},
    version: "1.0.0",
    duration: 0,
    success: true,
  };

  console.log("📊 Backing up tables...\n");

  // Backup each table
  let successCount = 0;
  let totalRecords = 0;

  for (const table of tables) {
    try {
      const data = await backupTable(table);

      // Save table data
      const tableFile = path.join(backupDir, `${table}.json`);
      fs.writeFileSync(tableFile, JSON.stringify(data, null, 2));

      metadata.recordCounts[table] = data.length;
      totalRecords += data.length;
      successCount++;
    } catch (error: any) {
      console.error(`  ❌ Failed to backup ${table}:`, error.message);
      metadata.recordCounts[table] = -1; // Indicate failure
      metadata.success = false;
    }
  }

  // Calculate duration
  metadata.duration = Date.now() - startTime;

  // Save metadata
  fs.writeFileSync(
    path.join(backupDir, "metadata.json"),
    JSON.stringify(metadata, null, 2)
  );

  // Update last backup timestamp
  fs.writeFileSync(
    path.join(process.cwd(), "backups", ".last-backup"),
    new Date().toISOString()
  );

  // Print summary
  console.log("\n╔══════════════════════════════════════════════════════════╗");
  console.log("║           Backup Summary                                 ║");
  console.log("╚══════════════════════════════════════════════════════════╝\n");
  console.log(
    `Status: ${metadata.success ? "✅ SUCCESS" : "⚠️  PARTIAL FAILURE"}`
  );
  console.log(`Duration: ${(metadata.duration / 1000).toFixed(2)}s`);
  console.log(`Tables backed up: ${successCount}/${tables.length}`);
  console.log(`Total records: ${totalRecords.toLocaleString()}`);
  console.log(`Backup size: ${getDirectorySize(backupDir)}\n`);
  console.log(`📁 Backup location: ${backupDir}\n`);

  // Print per-table stats
  console.log("Table Record Counts:");
  Object.entries(metadata.recordCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([table, count]) => {
      const status = count >= 0 ? "✓" : "✗";
      const displayCount = count >= 0 ? count.toLocaleString() : "FAILED";
      console.log(
        `  ${status} ${table.padEnd(25)} ${displayCount.padStart(8)}`
      );
    });

  return { backupDir, metadata };
}

/**
 * Get human-readable directory size
 */
function getDirectorySize(dirPath: string): string {
  let totalSize = 0;

  function calculateSize(currentPath: string) {
    const files = fs.readdirSync(currentPath);

    for (const file of files) {
      const filePath = path.join(currentPath, file);
      const stats = fs.statSync(filePath);

      if (stats.isDirectory()) {
        calculateSize(filePath);
      } else {
        totalSize += stats.size;
      }
    }
  }

  calculateSize(dirPath);

  // Convert to human-readable format
  const units = ["B", "KB", "MB", "GB"];
  let size = totalSize;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

// Run backup
createBackup()
  .then(({ metadata }) => {
    console.log(
      "═══════════════════════════════════════════════════════════\n"
    );

    if (metadata.success) {
      console.log("✅ Backup completed successfully!\n");
      process.exit(0);
    } else {
      console.log("⚠️  Backup completed with errors. Check logs above.\n");
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error("\n❌ Backup failed with critical error:");
    console.error(error);
    console.error("\n");
    process.exit(1);
  });
