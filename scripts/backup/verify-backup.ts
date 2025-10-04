#!/usr/bin/env tsx
/**
 * Backup Verification Script
 * Validates backup integrity and completeness
 * 
 * Usage:
 *   npm run backup:verify backups/2025-10-04T02-00-00
 *   or
 *   npx tsx scripts/backup/verify-backup.ts backups/2025-10-04T02-00-00
 */

import * as fs from 'fs';
import * as path from 'path';

interface VerificationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  summary: {
    tablesFound: number;
    totalRecords: number;
    missingTables: string[];
    backupSize: string;
  };
}

/**
 * Get human-readable file size
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
  
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = totalSize;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

/**
 * Verify backup integrity
 */
function verifyBackup(backupPath: string): VerificationResult {
  const result: VerificationResult = {
    valid: true,
    errors: [],
    warnings: [],
    summary: {
      tablesFound: 0,
      totalRecords: 0,
      missingTables: [],
      backupSize: '0 B',
    },
  };
  
  // Check backup directory exists
  if (!fs.existsSync(backupPath)) {
    result.valid = false;
    result.errors.push(`Backup directory not found: ${backupPath}`);
    return result;
  }
  
  // Get backup size
  result.summary.backupSize = getDirectorySize(backupPath);
  
  // Check metadata file
  const metadataPath = path.join(backupPath, 'metadata.json');
  if (!fs.existsSync(metadataPath)) {
    result.valid = false;
    result.errors.push('metadata.json not found');
    return result;
  }
  
  // Parse metadata
  let metadata: any;
  try {
    metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
  } catch (error: any) {
    result.valid = false;
    result.errors.push(`Failed to parse metadata.json: ${error.message}`);
    return result;
  }
  
  // Check metadata structure
  if (!metadata.tables || !Array.isArray(metadata.tables)) {
    result.valid = false;
    result.errors.push('metadata.tables is missing or invalid');
    return result;
  }
  
  // Critical tables that must exist
  const criticalTables = ['profiles', 'teams'];
  
  // Verify each table
  for (const table of metadata.tables) {
    const tablePath = path.join(backupPath, `${table}.json`);
    
    if (!fs.existsSync(tablePath)) {
      result.summary.missingTables.push(table);
      
      if (criticalTables.includes(table)) {
        result.valid = false;
        result.errors.push(`Critical table missing: ${table}`);
      } else {
        result.warnings.push(`Optional table missing: ${table}`);
      }
      continue;
    }
    
    // Verify JSON is parseable
    try {
      const data = JSON.parse(fs.readFileSync(tablePath, 'utf8'));
      
      // Check if data is an array
      if (!Array.isArray(data)) {
        result.valid = false;
        result.errors.push(`${table}.json is not an array`);
        continue;
      }
      
      result.summary.tablesFound++;
      result.summary.totalRecords += data.length;
      
      // Check record count matches metadata
      if (metadata.recordCounts && metadata.recordCounts[table] !== undefined) {
        const expectedCount = metadata.recordCounts[table];
        
        if (expectedCount === -1) {
          result.warnings.push(`${table} was marked as failed in backup`);
        } else if (expectedCount !== data.length) {
          result.warnings.push(
            `Record count mismatch for ${table}: expected ${expectedCount}, got ${data.length}`
          );
        }
      }
      
      // Validate data structure (basic check)
      if (data.length > 0 && typeof data[0] !== 'object') {
        result.warnings.push(`${table} contains non-object records`);
      }
    } catch (error: any) {
      result.valid = false;
      result.errors.push(`Failed to parse ${table}.json: ${error.message}`);
    }
  }
  
  // Check for critical tables
  for (const table of criticalTables) {
    if (!metadata.tables.includes(table)) {
      result.valid = false;
      result.errors.push(`Critical table not in backup: ${table}`);
    }
  }
  
  return result;
}

/**
 * Print verification results
 */
function printResults(result: VerificationResult, backupPath: string) {
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║           Backup Verification Report                    ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');
  
  console.log(`📁 Backup: ${backupPath}`);
  console.log(`📊 Size: ${result.summary.backupSize}`);
  console.log(`📈 Tables: ${result.summary.tablesFound}`);
  console.log(`📉 Records: ${result.summary.totalRecords.toLocaleString()}\n`);
  
  if (result.valid) {
    console.log('✅ Backup is VALID and complete!\n');
  } else {
    console.log('❌ Backup validation FAILED!\n');
  }
  
  if (result.errors.length > 0) {
    console.log(`\n🔴 Errors (${result.errors.length}):`);
    result.errors.forEach(err => console.log(`  × ${err}`));
  }
  
  if (result.warnings.length > 0) {
    console.log(`\n⚠️  Warnings (${result.warnings.length}):`);
    result.warnings.forEach(warn => console.log(`  ! ${warn}`));
  }
  
  if (result.summary.missingTables.length > 0) {
    console.log(`\n📋 Missing Tables (${result.summary.missingTables.length}):`);
    result.summary.missingTables.forEach(table => console.log(`  - ${table}`));
  }
  
  console.log('\n═══════════════════════════════════════════════════════════\n');
}

// CLI usage
const backupPath = process.argv[2];

if (!backupPath) {
  console.error('\n❌ Error: Backup path is required\n');
  console.error('Usage:');
  console.error('  npm run backup:verify backups/2025-10-04T02-00-00');
  console.error('  or');
  console.error('  npx tsx scripts/backup/verify-backup.ts backups/2025-10-04T02-00-00\n');
  process.exit(1);
}

// Resolve relative paths
const resolvedPath = path.isAbsolute(backupPath)
  ? backupPath
  : path.join(process.cwd(), backupPath);

console.log('\n🔍 Verifying backup...');

const result = verifyBackup(resolvedPath);
printResults(result, resolvedPath);

process.exit(result.valid ? 0 : 1);
