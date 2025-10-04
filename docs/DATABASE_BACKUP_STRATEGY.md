# Database Backup & Recovery Strategy

## Overview

This document outlines the complete database backup and disaster recovery strategy for the BoxCall application using Supabase PostgreSQL database.

## Backup Objectives

### Recovery Targets

- **RTO (Recovery Time Objective):** < 4 hours
- **RPO (Recovery Point Objective):** < 1 hour
- **Backup Retention:** 30 days for daily backups, 90 days for weekly backups

### Data Protection Goals

1. Protect against accidental data deletion
2. Enable point-in-time recovery for critical errors
3. Maintain compliance with data retention policies
4. Support disaster recovery scenarios

## Supabase Backup Features

### 1. Automatic Daily Backups (Built-in)

**Supabase Free/Pro Plans:**

- Automatic daily backups (retained for 7 days on Free, 30 days on Pro)
- Point-in-time recovery (PITR) available on Pro plan
- Backups stored in secure S3 buckets
- Zero configuration required

**Access Backups:**

```
Supabase Dashboard → Settings → Database → Backups
```

### 2. Point-in-Time Recovery (PITR)

**Pro Plan Feature:**

- Recover to any point in the last 7-30 days
- Granularity: Down to the second
- Use cases: Rollback bad deployments, recover from data corruption

**How to Use:**

```
Dashboard → Settings → Database → Point in Time Recovery
1. Select target timestamp
2. Create new project from backup
3. Verify data integrity
4. Update connection strings if needed
```

### 3. Manual Backups

For additional safety, we implement custom backup scripts.

## Backup Scripts

### Script 1: Full Database Backup

**Location:** `scripts/backup/backup-database.ts`

```typescript
/**
 * Full Database Backup Script
 * Creates a complete backup of all tables and exports to JSON
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

interface BackupMetadata {
  timestamp: string;
  tables: string[];
  recordCounts: Record<string, number>;
  version: string;
}

async function backupTable(tableName: string): Promise<any[]> {
  console.log(`Backing up table: ${tableName}...`);

  const { data, error } = await supabase.from(tableName).select("*");

  if (error) {
    console.error(`Error backing up ${tableName}:`, error);
    return [];
  }

  console.log(`✓ Backed up ${data?.length || 0} records from ${tableName}`);
  return data || [];
}

async function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupDir = path.join(process.cwd(), "backups", timestamp);

  // Create backup directory
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  console.log(`\n🔄 Starting database backup: ${timestamp}\n`);

  // Tables to backup (in order of dependencies)
  const tables = [
    // User tables
    "profiles",

    // Team tables
    "teams",
    "team_members",
    "team_invitations",
    "team_roles",

    // Playbook tables
    "plays",
    "play_assignments",
    "play_tags",

    // Practice/Game tables
    "practice_plans",
    "game_plans",

    // Activity tables
    "activities",

    // Social tables
    "posts",
    "comments",
    "reactions",

    // Achievement tables
    "achievements",
    "player_achievements",
    "badges",
    "player_badges",
  ];

  const metadata: BackupMetadata = {
    timestamp,
    tables,
    recordCounts: {},
    version: "1.0.0",
  };

  // Backup each table
  for (const table of tables) {
    try {
      const data = await backupTable(table);

      // Save table data
      const tableFile = path.join(backupDir, `${table}.json`);
      fs.writeFileSync(tableFile, JSON.stringify(data, null, 2));

      metadata.recordCounts[table] = data.length;
    } catch (error) {
      console.error(`Failed to backup ${table}:`, error);
      metadata.recordCounts[table] = -1; // Indicate failure
    }
  }

  // Save metadata
  fs.writeFileSync(
    path.join(backupDir, "metadata.json"),
    JSON.stringify(metadata, null, 2)
  );

  console.log("\n✅ Backup completed successfully!");
  console.log(`📁 Backup location: ${backupDir}`);
  console.log(`📊 Total tables: ${tables.length}`);
  console.log(
    `📈 Total records: ${Object.values(metadata.recordCounts).reduce((a, b) => a + b, 0)}`
  );

  return backupDir;
}

// Run backup
createBackup()
  .then((dir) => {
    console.log(`\nBackup saved to: ${dir}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("Backup failed:", error);
    process.exit(1);
  });
```

### Script 2: Incremental Backup (Changes Only)

**Location:** `scripts/backup/incremental-backup.ts`

```typescript
/**
 * Incremental Backup Script
 * Backs up only records modified since last backup
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function getLastBackupTime(): Promise<Date> {
  const backupDir = path.join(process.cwd(), "backups");

  if (!fs.existsSync(backupDir)) {
    // No previous backups, start from epoch
    return new Date(0);
  }

  const backups = fs
    .readdirSync(backupDir)
    .filter((name) => fs.statSync(path.join(backupDir, name)).isDirectory())
    .sort()
    .reverse();

  if (backups.length === 0) {
    return new Date(0);
  }

  // Get timestamp from last backup directory name
  const lastBackup = backups[0];
  return new Date(lastBackup.replace(/-/g, ":"));
}

async function backupTableIncremental(
  tableName: string,
  since: Date
): Promise<any[]> {
  console.log(
    `Checking ${tableName} for changes since ${since.toISOString()}...`
  );

  const { data, error } = await supabase
    .from(tableName)
    .select("*")
    .gte("updated_at", since.toISOString());

  if (error) {
    console.error(`Error backing up ${tableName}:`, error);
    return [];
  }

  if (data && data.length > 0) {
    console.log(`✓ Found ${data.length} modified records in ${tableName}`);
  }

  return data || [];
}

async function createIncrementalBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupDir = path.join(
    process.cwd(),
    "backups",
    `incremental-${timestamp}`
  );

  fs.mkdirSync(backupDir, { recursive: true });

  const lastBackupTime = await getLastBackupTime();
  console.log(
    `\n🔄 Starting incremental backup since: ${lastBackupTime.toISOString()}\n`
  );

  const tablesWithTimestamps = [
    "profiles",
    "teams",
    "team_members",
    "plays",
    "practice_plans",
    "game_plans",
    "activities",
    "posts",
    "comments",
  ];

  let totalRecords = 0;

  for (const table of tablesWithTimestamps) {
    const data = await backupTableIncremental(table, lastBackupTime);

    if (data.length > 0) {
      fs.writeFileSync(
        path.join(backupDir, `${table}.json`),
        JSON.stringify(data, null, 2)
      );
      totalRecords += data.length;
    }
  }

  const metadata = {
    timestamp,
    since: lastBackupTime.toISOString(),
    recordsBackedUp: totalRecords,
    type: "incremental",
  };

  fs.writeFileSync(
    path.join(backupDir, "metadata.json"),
    JSON.stringify(metadata, null, 2)
  );

  console.log("\n✅ Incremental backup completed!");
  console.log(`📊 Total modified records: ${totalRecords}`);

  return backupDir;
}

createIncrementalBackup()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Incremental backup failed:", error);
    process.exit(1);
  });
```

### Script 3: Backup Verification

**Location:** `scripts/backup/verify-backup.ts`

```typescript
/**
 * Backup Verification Script
 * Validates backup integrity and completeness
 */

import * as fs from "fs";
import * as path from "path";

interface VerificationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  summary: {
    tablesFound: number;
    totalRecords: number;
    missingTables: string[];
  };
}

function verifyBackup(backupPath: string): VerificationResult {
  const result: VerificationResult = {
    valid: true,
    errors: [],
    warnings: [],
    summary: {
      tablesFound: 0,
      totalRecords: 0,
      missingTables: [],
    },
  };

  // Check backup directory exists
  if (!fs.existsSync(backupPath)) {
    result.valid = false;
    result.errors.push(`Backup directory not found: ${backupPath}`);
    return result;
  }

  // Check metadata file
  const metadataPath = path.join(backupPath, "metadata.json");
  if (!fs.existsSync(metadataPath)) {
    result.valid = false;
    result.errors.push("metadata.json not found");
    return result;
  }

  // Parse metadata
  const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"));

  // Critical tables that must exist
  const criticalTables = ["profiles", "teams", "plays"];

  // Verify each table
  for (const table of metadata.tables || []) {
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
      const data = JSON.parse(fs.readFileSync(tablePath, "utf8"));
      result.summary.tablesFound++;
      result.summary.totalRecords += data.length;

      // Check record count matches metadata
      if (
        metadata.recordCounts &&
        metadata.recordCounts[table] !== data.length
      ) {
        result.warnings.push(
          `Record count mismatch for ${table}: expected ${metadata.recordCounts[table]}, got ${data.length}`
        );
      }
    } catch (error) {
      result.valid = false;
      result.errors.push(`Failed to parse ${table}.json: ${error}`);
    }
  }

  return result;
}

// CLI usage
const backupPath = process.argv[2];

if (!backupPath) {
  console.error("Usage: ts-node verify-backup.ts <backup-path>");
  process.exit(1);
}

console.log(`\n🔍 Verifying backup: ${backupPath}\n`);

const result = verifyBackup(backupPath);

if (result.valid) {
  console.log("✅ Backup is valid!");
  console.log(`📊 Tables: ${result.summary.tablesFound}`);
  console.log(`📈 Records: ${result.summary.totalRecords}`);
} else {
  console.log("❌ Backup validation failed!");
  console.log(`\nErrors (${result.errors.length}):`);
  result.errors.forEach((err) => console.log(`  - ${err}`));
}

if (result.warnings.length > 0) {
  console.log(`\n⚠️  Warnings (${result.warnings.length}):`);
  result.warnings.forEach((warn) => console.log(`  - ${warn}`));
}

process.exit(result.valid ? 0 : 1);
```

## Automated Backup Schedule

### GitHub Actions Workflow

**Location:** `.github/workflows/database-backup.yml`

```yaml
name: Database Backup

on:
  schedule:
    # Run daily at 2 AM UTC (during low traffic)
    - cron: "0 2 * * *"

  # Allow manual trigger
  workflow_dispatch:

jobs:
  backup:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run database backup
        env:
          VITE_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
        run: npx tsx scripts/backup/backup-database.ts

      - name: Verify backup
        run: |
          BACKUP_DIR=$(ls -td backups/*/ | head -1)
          npx tsx scripts/backup/verify-backup.ts "$BACKUP_DIR"

      - name: Upload backup to S3
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Sync to S3
        run: |
          aws s3 sync backups/ s3://boxcall-backups/database/ \
            --exclude "*" \
            --include "$(date +%Y-%m-%d)*/*"

      - name: Cleanup old local backups
        run: |
          # Keep only last 7 days locally
          find backups/ -type d -mtime +7 -exec rm -rf {} +

      - name: Notify on failure
        if: failure()
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: "Database backup failed!"
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

## Recovery Procedures

### Scenario 1: Accidental Data Deletion (Recent)

**Recovery Time:** 15-30 minutes

**Steps:**

1. Identify the timestamp before deletion
2. Use Supabase PITR to restore:
   ```
   Dashboard → Settings → Database → Point in Time Recovery
   Select timestamp → Create recovery project
   ```
3. Export specific table data from recovery project
4. Import data back to production database
5. Verify data integrity

### Scenario 2: Complete Database Loss

**Recovery Time:** 2-4 hours

**Steps:**

1. Create new Supabase project
2. Run database schema from `database/schema.sql`
3. Locate most recent backup
4. Run restoration script:
   ```bash
   npx tsx scripts/backup/restore-database.ts backups/2025-10-04T02-00-00/
   ```
5. Verify all tables and record counts
6. Update application environment variables
7. Run smoke tests
8. Update DNS/connection strings
9. Monitor application for issues

### Scenario 3: Partial Data Corruption

**Recovery Time:** 30-60 minutes

**Steps:**

1. Identify affected tables
2. Extract data from latest backup:
   ```bash
   # Extract specific table
   cat backups/latest/teams.json | jq . > teams-restore.json
   ```
3. Stop writes to affected tables (maintenance mode)
4. Delete corrupted data
5. Import clean data from backup
6. Resume normal operations
7. Monitor for data consistency issues

## Backup Storage

### Primary Storage: Supabase (Built-in)

- **Location:** Supabase-managed S3
- **Retention:** 7-30 days (plan dependent)
- **Access:** Via Supabase Dashboard

### Secondary Storage: AWS S3 (Custom)

- **Bucket:** `s3://boxcall-backups/database/`
- **Retention:** 30 days (daily), 90 days (weekly)
- **Encryption:** AES-256
- **Access:** IAM roles, restricted

### Local Storage (Development)

- **Location:** `./backups/`
- **Retention:** 7 days
- **Purpose:** Testing and development

## Monitoring and Alerts

### Backup Success Monitoring

**Metrics to Track:**

- Backup completion status (success/failure)
- Backup duration (should be < 10 minutes)
- Backup size (monitor for anomalies)
- Record counts per table

**Alerting Rules:**

1. **Critical:** Backup fails 2 days in a row
2. **Warning:** Backup takes > 15 minutes
3. **Info:** Backup size increases > 50% week-over-week

### Health Checks

Add backup health to `/health` endpoint:

```typescript
// In src/api/health.ts
async function checkBackupHealth() {
  const lastBackupFile = path.join(process.cwd(), "backups", ".last-backup");

  if (!fs.existsSync(lastBackupFile)) {
    return { status: "unknown", message: "No backup history found" };
  }

  const lastBackupTime = new Date(fs.readFileSync(lastBackupFile, "utf8"));
  const hoursSinceBackup =
    (Date.now() - lastBackupTime.getTime()) / (1000 * 60 * 60);

  if (hoursSinceBackup > 48) {
    return { status: "critical", hoursSince: hoursSinceBackup };
  } else if (hoursSinceBackup > 26) {
    return { status: "warning", hoursSince: hoursSinceBackup };
  }

  return { status: "healthy", hoursSince: hoursSinceBackup };
}
```

## Testing the Backup System

### 1. Create Test Backup

```bash
# Set environment variables
export VITE_SUPABASE_URL="your-url"
export SUPABASE_SERVICE_ROLE_KEY="your-key"

# Run backup
npx tsx scripts/backup/backup-database.ts

# Verify backup
npx tsx scripts/backup/verify-backup.ts backups/[timestamp]/
```

### 2. Test Restoration

```bash
# Create test database
# Restore from backup
npx tsx scripts/backup/restore-database.ts backups/[timestamp]/

# Verify record counts match
```

### 3. Test Recovery Scenarios

- Delete test record → Restore from backup
- Corrupt test data → Restore from backup
- Simulate database loss → Full recovery

## Compliance and Auditing

### Backup Audit Log

Track all backup operations:

- Timestamp
- Duration
- Record counts
- Success/failure status
- Operator (manual vs automated)

### Retention Policy

- **Daily backups:** 30 days
- **Weekly backups:** 90 days
- **Monthly backups:** 1 year
- **Yearly backups:** 7 years (compliance requirement)

## Cost Considerations

### Supabase Backup Costs

- **Free Plan:** 7-day retention (included)
- **Pro Plan:** 30-day retention + PITR ($25/month)
- **Storage:** ~$0.10/GB/month for backups

### AWS S3 Costs (Custom Backups)

- **Standard Storage:** ~$0.023/GB/month
- **Estimated backup size:** 1-5 GB
- **Monthly cost:** ~$0.10 - $0.50

**Total estimated cost:** < $30/month

## Maintenance Tasks

### Weekly

- [ ] Review backup success rate
- [ ] Check backup sizes for anomalies
- [ ] Verify backup verification passed

### Monthly

- [ ] Test restore procedure with real backup
- [ ] Review backup retention policy
- [ ] Clean up old backups from S3
- [ ] Update recovery documentation if needed

### Quarterly

- [ ] Full disaster recovery drill
- [ ] Review and update RTO/RPO targets
- [ ] Audit backup access logs
- [ ] Update backup scripts for schema changes

## Next Steps

1. **Immediate (This Week):**
   - [ ] Create backup scripts directory structure
   - [ ] Implement backup-database.ts script
   - [ ] Test manual backup locally
   - [ ] Set up S3 bucket for backup storage

2. **Short-term (This Month):**
   - [ ] Create GitHub Actions workflow
   - [ ] Implement verify-backup.ts script
   - [ ] Set up backup monitoring alerts
   - [ ] Document recovery procedures in runbook

3. **Long-term (This Quarter):**
   - [ ] Implement automated restore testing
   - [ ] Set up backup encryption
   - [ ] Create compliance audit reports
   - [ ] Establish disaster recovery team and procedures

## Resources

- [Supabase Backup Documentation](https://supabase.com/docs/guides/platform/backups)
- [PostgreSQL Backup Best Practices](https://www.postgresql.org/docs/current/backup.html)
- [AWS S3 Backup Strategies](https://docs.aws.amazon.com/AmazonS3/latest/userguide/backup-and-restore.html)

## Support

**Questions or Issues?**

- Check backup logs in GitHub Actions
- Review Supabase Dashboard backup status
- Contact: @justindepierro
