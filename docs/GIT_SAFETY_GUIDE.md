# Git Operation Safety Guide

## 🚨 Preventing File Loss During Major Operations

### Before ANY major restructure or operation:

1. **Create a safety branch:**

   ```bash
   git checkout -b safety-backup-$(date +%Y%m%d)
   git push origin safety-backup-$(date +%Y%m%d)
   ```

2. **Test the health check:**

   ```bash
   ./scripts/health-check.sh
   ```

3. **Verify TypeScript compilation:**
   ```bash
   npm run type-check
   ```

### Safe Git Operations:

#### For File Moves/Renames:

```bash
# DON'T: git mv src/ web/src/  (can break with many files)
# DO: Move in stages
mkdir -p web/src
cp -r src/* web/src/
git add web/src/
git commit -m "Add files to new location"
# Then verify everything works before removing old location
```

#### For Major Restructures:

```bash
# 1. Plan the changes
# 2. Create safety branch
# 3. Test each step
# 4. Verify with health-check.sh after each commit
# 5. Only proceed if all checks pass
```

### Recovery from Empty Files:

#### If you notice empty files:

```bash
# Check what happened
git status
git log --oneline -5

# Find the last working commit
git log --oneline --stat | grep -B5 -A5 "App.tsx"

# Restore specific files
git show <commit>:src/App.tsx > src/App.tsx

# Or restore entire working state
git reset --hard <working-commit>
```

#### Emergency recovery commands:

```bash
# Show content of a file from specific commit
git show <commit>:path/to/file

# Restore all files from a commit
git checkout <commit> -- .

# Reset to a working state (DESTRUCTIVE)
git reset --hard <commit>
```

### Daily Safety Habits:

1. **Run health check regularly:**

   ```bash
   ./scripts/health-check.sh
   ```

2. **Commit often with descriptive messages**

3. **Test after any structural changes**

4. **Keep safety branches for major work**

5. **Never ignore TypeScript/ESLint failures**
