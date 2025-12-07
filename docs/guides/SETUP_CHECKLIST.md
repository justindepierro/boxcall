# ✅ SuperAdmin Setup Checklist

## Status: COMPLETE ✅

### Database Configuration ✅

- [x] RLS helper functions installed
- [x] Duplicate policies removed
- [x] Team access policies working
- [x] Pooler connection string configured
- [x] All migrations applied

### Environment Files ✅

- [x] `.env` file updated
  - [x] `VITE_SUPER_ADMIN_EMAIL=justindepierro@gmail.com`
  - [x] `VITE_DEFAULT_DEV_MODE=production`
  - [x] `VITE_FORCE_DEV_MODE=none`
  - [x] `VITE_ENVIRONMENT=production`
  - [x] `DATABASE_URL` using pooler

### User Account ✅

- [x] Email: justindepierro@gmail.com
- [x] Role: admin (superadmin)
- [x] Active team memberships: 3
- [x] Permissions verified

### Documentation ✅

- [x] `docs/DOCKER_AND_CLI_SETUP.md` - Complete setup guide
- [x] `docs/SUPERADMIN_QUICK_REFERENCE.md` - Quick reference
- [x] `docs/SETUP_COMPLETE.md` - Setup summary
- [x] `scripts/fix-superadmin.sh` - Automated fix script

### Migrations Applied ✅

- [x] `20251023160001_fix_team_access_policies.sql`
- [x] `20251023160002_cleanup_duplicate_policies.sql`

---

## 🚀 FINAL STEPS BEFORE TESTING

### 1. Clear Browser LocalStorage (REQUIRED!)

- [ ] Open DevTools (F12)
- [ ] Go to Application → Local Storage
- [ ] Delete `boxcall-dev-mode` key
- [ ] Optional: Clear all local storage

### 2. Restart Dev Server

```bash
# Press Ctrl+C to stop current server
# Then run:
npm run dev
```

### 3. Test Login

- [ ] Navigate to http://localhost:5173
- [ ] Login with: justindepierro@gmail.com
- [ ] Verify Production mode badge
- [ ] Verify all 3 teams visible
- [ ] Verify playbooks accessible

---

## Expected Results

### ✅ You SHOULD See:

- "Production" mode badge (top right)
- All 3 teams in sidebar:
  - Burke Catholic High School Eagles
  - Development Team (2x)
- Access to playbooks
- Full CRUD permissions

### ❌ You Should NOT See:

- "Dev Mode" badge
- "Blank Slate" mode
- Empty teams list
- Permission errors

---

## 🆘 Quick Troubleshooting

If something doesn't work:

1. **Run fix script**: `./scripts/fix-superadmin.sh`
2. **Check environment**: `cat .env | grep SUPER_ADMIN`
3. **Verify database**: `psql "$DATABASE_URL" -c "SELECT 1;"`
4. **Clear cache**: Hard refresh browser (Cmd+Shift+R)

---

## 📚 Documentation Reference

- [Setup Complete](./SETUP_COMPLETE.md)
- [Quick Reference](./SUPERADMIN_QUICK_REFERENCE.md)
- [Docker & CLI Setup](./DOCKER_AND_CLI_SETUP.md)

---

**Status**: All backend work complete ✅  
**Next Action**: Clear localStorage + restart dev server + test  
**Expected Time**: 2 minutes
