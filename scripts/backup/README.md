# Database Backup Scripts

This directory contains automated database backup and recovery scripts for the BoxCall application.

## Quick Start

### Create a Backup

```bash
# Set environment variables (or use .env.local)
export VITE_SUPABASE_URL="your-supabase-url"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Run backup
npm run backup
```

### Verify a Backup

```bash
npm run backup:verify backups/2025-10-04T02-00-00
```

## Scripts

### `backup-database.ts`

Creates a complete backup of all database tables.

**Features:**

- Exports all tables to JSON format
- Generates metadata file with record counts
- Validates backup completeness
- Human-readable progress output
- Error handling and reporting

**Output:**

- Directory: `backups/YYYY-MM-DDTHH-mm-ss/`
- Files: One JSON file per table + `metadata.json`
- Tracks last backup timestamp in `backups/.last-backup`

### `verify-backup.ts`

Validates backup integrity and completeness.

**Checks:**

- Backup directory exists
- metadata.json is valid
- All critical tables present
- JSON files are parseable
- Record counts match metadata
- Data structure validation

**Usage:**

```bash
npm run backup:verify <backup-path>
```

## Environment Variables

Required environment variables:

```bash
# Supabase project URL
VITE_SUPABASE_URL=https://your-project.supabase.co

# Supabase service role key (has admin access)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

⚠️ **Security Warning:** The service role key has admin privileges. Keep it secure!

## Backup Structure

```
backups/
├── .last-backup                          # Timestamp of last backup
├── 2025-10-04T02-00-00/                 # Backup directory
│   ├── metadata.json                     # Backup metadata
│   ├── profiles.json                     # User profiles
│   ├── teams.json                        # Teams
│   ├── team_members.json                 # Team membership
│   ├── plays.json                        # Playbook plays
│   ├── practice_plans.json               # Practice plans
│   ├── game_plans.json                   # Game plans
│   ├── activities.json                   # Activity feed
│   └── ...                               # Other tables
```

## Metadata Format

```json
{
  "timestamp": "2025-10-04T02:00:00.000Z",
  "tables": ["profiles", "teams", "..."],
  "recordCounts": {
    "profiles": 150,
    "teams": 25,
    "plays": 500
  },
  "version": "1.0.0",
  "duration": 12345,
  "success": true
}
```

## Automated Backups

### GitHub Actions (Planned)

Create `.github/workflows/database-backup.yml`:

```yaml
name: Database Backup

on:
  schedule:
    - cron: "0 2 * * *" # Daily at 2 AM UTC
  workflow_dispatch: # Manual trigger

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
      - run: npm ci
      - run: npm run backup
        env:
          VITE_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
      - name: Upload to S3 (optional)
        # Add AWS S3 sync here
```

### Cron Job (Alternative)

```bash
# Add to crontab (run daily at 2 AM)
0 2 * * * cd /path/to/boxcall && npm run backup >> /var/log/boxcall-backup.log 2>&1
```

## Recovery Procedures

### Restore Specific Table

```bash
# Extract table data
cat backups/2025-10-04T02-00-00/teams.json

# Import back to database (manual process)
# Use Supabase Dashboard or write custom restore script
```

### Full Database Restore

1. Create new Supabase project (if needed)
2. Run schema: `npm run db:schema`
3. Import each table from backup JSON files
4. Verify record counts match metadata
5. Update environment variables
6. Run application tests

## Best Practices

### Before Running Backups

1. ✅ Test backup script in development first
2. ✅ Verify environment variables are set
3. ✅ Ensure sufficient disk space
4. ✅ Check Supabase connection
5. ✅ Review table list in script

### After Running Backups

1. ✅ Verify backup completed successfully
2. ✅ Check record counts are reasonable
3. ✅ Run verification script
4. ✅ Upload to remote storage (S3, etc.)
5. ✅ Test restore procedure periodically

### Security

- 🔒 Never commit `.env.local` with keys
- 🔒 Use service role key only for backups
- 🔒 Encrypt backups at rest
- 🔒 Restrict access to backup storage
- 🔒 Rotate keys regularly

## Troubleshooting

### "Missing environment variables"

- Ensure `VITE_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set
- Check `.env.local` file exists

### "Connection failed"

- Verify Supabase URL is correct
- Check service role key is valid
- Ensure internet connection is stable

### "Table not found"

- Table may not exist in your database
- Update table list in `backup-database.ts`
- Check schema is up to date

### Backup takes too long (>5 minutes)

- Database is large (normal for production)
- Consider incremental backups
- Check network speed

## Monitoring

Track these metrics:

- ✅ Backup success rate
- ✅ Backup duration
- ✅ Backup size over time
- ✅ Record counts per table
- ✅ Verification pass rate

Add to monitoring dashboard:

```typescript
// In src/api/health.ts
const lastBackup = fs.readFileSync("backups/.last-backup");
const hoursSince = (Date.now() - new Date(lastBackup).getTime()) / 3600000;
```

## Future Enhancements

### Short-term

- [ ] Incremental backup script (only changed records)
- [ ] Restore script (automated recovery)
- [ ] S3/Cloud storage integration
- [ ] Backup encryption

### Long-term

- [ ] Point-in-time recovery
- [ ] Backup compression
- [ ] Parallel table backups (faster)
- [ ] Backup diff reporting
- [ ] Automated restore testing

## Related Documentation

- [Database Backup Strategy](/docs/DATABASE_BACKUP_STRATEGY.md) - Complete strategy document
- [Supabase Backups](https://supabase.com/docs/guides/platform/backups) - Official docs
- [Disaster Recovery Plan](/docs/DISASTER_RECOVERY.md) - (To be created)

## Support

**Questions or Issues?**

- Check script output for error messages
- Review environment variables
- Verify Supabase dashboard for connection issues
- Contact: @justindepierro

---

**Last Updated:** 2025-10-04  
**Version:** 1.0.0
