# Dead Code Detection - Quick Reference

## 🚀 Quick Commands

```bash
# Basic scan
npm run deadcode:scan

# Generate report file
npm run deadcode:report

# Find unused CSS classes
grep -r "className.*unused-class" src/

# Find imports of specific file
grep -r "import.*ComponentName" src/

# Count total files by type
find src -name "*.css" | wc -l
find src -name "*.tsx" | wc -l

# Find large unused files
find src -name "*.tsx" -size +10k -exec grep -L "import.*{}" {} \;
```

## 📊 Detection Patterns

### CSS Files

```bash
# Find all CSS files
find src -name "*.css"

# Check if CSS is imported
grep -r "import.*filename.css" src/
```

### Components

```bash
# Find potential orphans
grep -L "import" src/components/**/*.tsx

# Check component usage
grep -r "ComponentName" src/
```

### Pages

```bash
# Check if page is in routes
grep -r "PageName" src/App.tsx src/components/lazy/
```

## ⚠️ Before Deleting

1. ✅ Search entire codebase
2. ✅ Check Storybook stories
3. ✅ Run full test suite
4. ✅ Create backup branch
5. ✅ Move to archive first

## 🎯 Safe Deletion

```bash
# Create cleanup branch
git checkout -b cleanup/dead-code

# Archive instead of delete
mkdir -p archive/$(date +%Y-%m-%d)
git mv src/path/to/file.tsx archive/$(date +%Y-%m-%d)/

# Test
npm run validate
npm run build

# Commit
git commit -m "chore: archive unused files"
```

## 📈 Quick Stats

Current Codebase:

- Total CSS files: 22
- Total Components: 382
- Total Pages: 40
- Potentially Orphaned: 13 files

## 🔗 Full Documentation

See [DEAD_CODE_DETECTION_GUIDE.md](./DEAD_CODE_DETECTION_GUIDE.md)
