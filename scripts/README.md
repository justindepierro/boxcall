# BoxCall Maintenance Scripts

This directory contains comprehensive maintenance and diagnostic tools for the BoxCall workspace.

## 🚀 Quick Start

For most situations, just run the master maintenance script:

```bash
./scripts/boxcall-maintenance.sh
```

This will show you a menu of options and guide you through fixing any issues.

## 📋 Available Scripts

### 🔧 Main Tools

| Script                   | Purpose                                     | When to Use                      |
| ------------------------ | ------------------------------------------- | -------------------------------- |
| `boxcall-maintenance.sh` | **Master script** - Menu-driven maintenance | Start here for any issues        |
| `daily-checklist.sh`     | Quick health check for daily development    | Beginning of each coding session |
| `workspace-doctor.sh`    | Comprehensive diagnostic tool               | When something seems wrong       |

### 🛠️ Specialized Tools

| Script                  | Purpose                                 | When to Use               |
| ----------------------- | --------------------------------------- | ------------------------- |
| `dependency-manager.sh` | Package and dependency management       | npm/package issues        |
| `emergency-reset.sh`    | Nuclear option - reset to working state | When everything is broken |
| `health-check.sh`       | Quick file integrity check              | After git operations      |

## 🎯 Common Scenarios

### "Something is broken, I don't know what"

```bash
./scripts/boxcall-maintenance.sh
# Choose option 1 (Full Health Check)
```

### "My dependencies are messed up"

```bash
./scripts/dependency-manager.sh fix
# Or use the master script option 2
```

### "I want to start coding, is everything ready?"

```bash
./scripts/daily-checklist.sh
```

### "Everything is broken, I need to start over"

```bash
./scripts/emergency-reset.sh
# This will guide you through a safe reset
```

### "I just did a git operation and want to check files"

```bash
./scripts/health-check.sh
```

## 🛡️ Safety Features

All scripts include:

- **Automatic backups** before making changes
- **Confirmation prompts** for destructive operations
- **Detailed logging** of what they're doing
- **Recovery information** if something goes wrong

## 🔍 Script Details

### boxcall-maintenance.sh

Master maintenance script with interactive menu. Coordinates all other scripts.

**Options:**

- Full health check
- Dependency fixes
- Quick auto-fixes
- Emergency reset
- Daily checklist
- Complete maintenance cycle

### workspace-doctor.sh

Comprehensive diagnostic tool that checks:

- Critical file integrity
- Dependencies and packages
- TypeScript configuration
- Git repository health
- Development environment

**Usage:**

```bash
./scripts/workspace-doctor.sh          # Diagnosis only
./scripts/workspace-doctor.sh --fix    # Diagnosis + auto-fixes
```

### dependency-manager.sh

Specialized tool for package management issues.

**Commands:**

```bash
./scripts/dependency-manager.sh health      # Show dependency report
./scripts/dependency-manager.sh clean       # Clean reinstall
./scripts/dependency-manager.sh fix         # Fix common issues
./scripts/dependency-manager.sh emergency   # Reset to known good packages
```

### daily-checklist.sh

Quick health check designed to run at the start of each development session.

Checks:

- Critical files exist and have content
- Git repository status
- Dependencies are installed
- TypeScript compiles
- Build system is ready

### emergency-reset.sh

Nuclear option for when the workspace is completely broken.

Features:

- Creates automatic backups
- Resets to known good commits
- Reinstalls dependencies
- Verifies reset success
- Provides recovery information

## 🚨 Emergency Procedures

### If scripts themselves are broken:

```bash
# Restore from git
git checkout HEAD -- scripts/
chmod +x scripts/*.sh
```

### If you need to start completely over:

```bash
# This is the nuclear option
git stash                    # Save current work
git reset --hard 500e83f     # Reset to known good state
npm install                  # Reinstall dependencies
./scripts/daily-checklist.sh # Verify everything works
```

### If you lost important changes:

```bash
git stash list               # See saved changes
git stash pop                # Restore latest stash
git branch -a                # See backup branches
```

## 💡 Best Practices

1. **Run daily checklist** at the start of each coding session
2. **Use the master script** when you're not sure which tool to use
3. **Always read the output** - scripts tell you what they're doing
4. **Don't ignore TypeScript/ESLint errors** - they often indicate bigger issues
5. **Create backups** before major operations (scripts do this automatically)

## 🆘 Getting Help

If you're still having issues after using these scripts:

1. Check the git history for when things last worked
2. Look at the backup branches created by emergency-reset.sh
3. Check the `.emergency-backup/` directory for saved files
4. Consider asking for help with the specific error messages

Remember: These scripts are designed to be safe and provide recovery options. Don't hesitate to use them!
