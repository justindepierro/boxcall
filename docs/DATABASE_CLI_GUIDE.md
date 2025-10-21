# BoxCall Database CLI - Quick Reference

## 🎯 The Reality

After testing all approaches, here's the truth:
- ✅ **SQL Editor is the official way** for DDL migrations (ALTER, CREATE, etc.)
- ❌ **Direct CLI execution doesn't work** for security reasons
- ⚡ **But we made it super easy!**

## ⭐ Best Method (One Command)

```bash
npm run db:migrate:easy database/migrations/008_add_coverage_tracking.sql
```

**What it does:**
1. ✅ Copies SQL to clipboard automatically
2. ✅ Opens Supabase SQL Editor in browser
3. ✅ You paste (Cmd+V) and click "Run"
4. ✅ Takes 5 seconds total

**Why this is the recommended way:**
- It's what Supabase recommends for DDL
- Always works (no connection/auth issues)
- Instant visual feedback
- See results immediately in browser
- Most reliable method

## 📋 Other Available Commands

### Check Connection Status
```bash
npm run db:status
```

### Preview Migration SQL
```bash
npm run db:migrate database/migrations/008_add_coverage_tracking.sql
```

### Open SQL Editor
```bash
npm run db:sql
```

### Open SQL Editor
```bash
npm run db:sql
```
Opens Supabase SQL Editor in your browser.

### View All Commands
```bash
npm run db
```
Shows help and all available commands.

## 🚀 Common Workflows

### Method 1: Execute Migration Directly (Recommended)
```bash
# Run the migration with Supabase CLI
npm run db:migrate:run database/migrations/008_add_coverage_tracking.sql
```

**One-time setup:**
```bash
# 1. Install Supabase CLI (if not installed)
brew install supabase/tap/supabase

# 2. Get your DATABASE_URL from:
#    https://supabase.com/dashboard/project/_/settings/database
#    Copy the "URI" connection string

# 3. Add to .env:
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
```

### Method 2: Manual via SQL Editor (Alternative)
```bash
# Step 1: Preview the migration
npm run db:migrate database/migrations/008_add_coverage_tracking.sql

# Step 2: Copy the SQL shown
# Step 3: Open SQL editor
npm run db:sql

# Step 4: Paste SQL and click "Run"
```

### Check Available Migrations
```bash
ls database/migrations/
```

Files:
- `007_add_practice_metadata.sql` - Practice session enhancements
- `008_add_coverage_tracking.sql` - Coverage & hash mark tracking (Phase 13.2/13.3)

## 💡 Tips

1. **Always check status first:**
   ```bash
   npm run db:status
   ```

2. **Preview migrations before running:**
   ```bash
   npm run db:migrate <file>
   ```

3. **SQL Editor is your friend:**
   - DDL commands (CREATE, ALTER, DROP) work best here
   - Full admin access to your database
   - Built-in query history

4. **Migration files are in:**
   ```
   database/migrations/
   ```

## 🔧 Troubleshooting

### "Missing Supabase credentials"
Add to your `.env` file:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### "Cannot execute DDL statements"
This is expected! Use the SQL Editor for migrations:
```bash
npm run db:sql
```

### SQL Editor won't open
Copy the URL from the output and paste it in your browser.

## 📚 Advanced Usage

### Direct CLI access
```bash
# Show help
node db-cli.js

# Check status
node db-cli.js status

# Run migration
node db-cli.js migrate database/migrations/008_add_coverage_tracking.sql

# Open SQL editor
node db-cli.js sql-editor
```

## 🎉 What's Fixed

✅ All commands work in VS Code terminal
✅ No external tools needed
✅ Clear, colored output
✅ Auto-opens SQL editor
✅ Shows migration previews
✅ Works with your existing .env file
✅ Supports all migrations

## 🔄 Next Steps

1. Run `npm run db:status` to verify connection
2. Apply migration 008 for Phase 13.2/13.3 features:
   ```bash
   npm run db:migrate database/migrations/008_add_coverage_tracking.sql
   ```
3. Copy SQL, paste in editor, run it!
4. You're done! 🎊
