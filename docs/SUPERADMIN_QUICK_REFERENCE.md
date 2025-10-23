# 🚀 BoxCall SuperAdmin Quick Reference

## ✅ Your Setup is Now Fixed!

### Your SuperAdmin Credentials

- **Email**: `justindepierro@gmail.com`
- **User ID**: `fafcaafd-0154-4f87-9752-95fbfa2372a0`
- **Role**: `admin` (superadmin)
- **Teams**: 3 active teams (Burke Catholic, 2x Development Teams)

### Environment Configuration

All environment variables are correctly set:

- ✅ `VITE_SUPER_ADMIN_EMAIL=justindepierro@gmail.com`
- ✅ `VITE_DEFAULT_DEV_MODE=production`
- ✅ `VITE_FORCE_DEV_MODE=none`
- ✅ `DATABASE_URL` using stable pooler connection

### Database Status

- ✅ RLS helper functions installed and working
- ✅ Duplicate policies cleaned up (2 policies per table)
- ✅ All migrations applied successfully

---

## 🎯 What to Do Next

### 1. Clear Browser Cache (REQUIRED!)

Your browser localStorage may have old dev mode settings.

**Open DevTools (F12) → Application → Local Storage:**

- Delete the key: `boxcall-dev-mode`
- Or clear all local storage for your site

### 2. Restart Dev Server

```bash
npm run dev
```

### 3. Login

- Use email: `justindepierro@gmail.com`
- You should now see:
  - ✅ All 3 teams in sidebar
  - ✅ "Production" mode badge (not "Dev")
  - ✅ Access to all playbooks
  - ✅ Full superadmin permissions

---

## 🔧 Common Commands

### Database Access

```bash
# Connect to database
psql "postgresql://postgres.lvmuiqwihlpnwppdqqfl:N3v3rsayd1e1715@aws-0-us-east-2.pooler.supabase.com:5432/postgres?sslmode=require"

# Quick queries
# Check your user
psql "$DATABASE_URL" -c "SELECT id, email FROM auth.users WHERE email = 'justindepierro@gmail.com';"

# Check teams
psql "$DATABASE_URL" -c "SELECT tm.team_role, t.name FROM team_members tm JOIN teams t ON t.id = tm.team_id WHERE tm.user_id = 'fafcaafd-0154-4f87-9752-95fbfa2372a0';"
```

### Migrations

```bash
# Apply new migration
psql "$DATABASE_URL" -f supabase/migrations/TIMESTAMP_migration_name.sql

# View migration list
ls -la supabase/migrations/

# Check applied migrations
supabase migration list
```

### Troubleshooting

```bash
# Run comprehensive fix script
./scripts/fix-superadmin.sh

# Check if dev server is running
lsof -Pi :5173 -sTCP:LISTEN

# View app logs
npm run dev
# Then check browser console (F12)
```

---

## 📋 Files Changed/Created

### Updated Files

1. **`.env`** - Fixed environment variables
   - Set `VITE_ENVIRONMENT=production`
   - Set `VITE_FORCE_DEV_MODE=none`
   - Set `VITE_DEBUG_PERFORMANCE=false`

### New Files Created

1. **`scripts/fix-superadmin.sh`** - Automated setup verification script
2. **`docs/DOCKER_AND_CLI_SETUP.md`** - Comprehensive setup guide
3. **`supabase/migrations/20251023160002_cleanup_duplicate_policies.sql`** - RLS policy cleanup
4. **`docs/SUPERADMIN_QUICK_REFERENCE.md`** - This file!

### Applied Migrations

1. **`20251023160001_fix_team_access_policies.sql`** - RLS helper functions
2. **`20251023160002_cleanup_duplicate_policies.sql`** - Remove duplicate policies

---

## 🆘 If You Still Have Issues

### Issue: Still seeing "Dev Mode" instead of "Production"

**Solution:**

```bash
# 1. Clear localStorage in browser DevTools
# 2. Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
# 3. Restart dev server
npm run dev
```

### Issue: Can't see teams

**Solution:**

```bash
# Verify team memberships
psql "$DATABASE_URL" -c "SELECT tm.team_role, t.name FROM team_members tm JOIN teams t ON t.id = tm.team_id WHERE tm.user_id = 'fafcaafd-0154-4f87-9752-95fbfa2372a0';"

# Should show 3 teams
```

### Issue: Playbooks not loading

**Solution:**

```bash
# Check playbook permissions
psql "$DATABASE_URL" -c "SELECT p.id, p.name, t.name as team FROM playbooks p JOIN teams t ON t.id = p.team_id WHERE t.id IN (SELECT team_id FROM team_members WHERE user_id = 'fafcaafd-0154-4f87-9752-95fbfa2372a0');"
```

### Issue: Database connection errors

**Solution:**

```bash
# Test connection
psql "$DATABASE_URL" -c "SELECT 1;"

# If fails, check .env has correct DATABASE_URL
cat .env | grep DATABASE_URL
```

---

## 📚 Additional Resources

- [Docker & CLI Setup Guide](./DOCKER_AND_CLI_SETUP.md)
- [Architecture Documentation](./ARCHITECTURE.md)
- [Migration Standards](../supabase/migrations/README.md)

---

## ✨ Summary

Your BoxCall instance is now properly configured as a **Production SuperAdmin Setup**:

1. ✅ **Database**: RLS policies fixed, helper functions working
2. ✅ **Environment**: All variables set correctly for production
3. ✅ **Permissions**: You have full superadmin access
4. ✅ **Teams**: All 3 teams accessible
5. ✅ **Dev Mode**: Set to production (real data, full features)

**Next Step**: Clear browser localStorage and restart dev server!

---

Last Updated: October 23, 2025
