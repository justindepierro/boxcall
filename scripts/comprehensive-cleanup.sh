#!/bin/bash

echo "🧹 BoxCall Comprehensive Cleanup Script"
echo "========================================"

# Create backup before cleanup
echo "📦 Creating backup..."
timestamp=$(date +%Y%m%d_%H%M%S)
backup_dir="cleanup_backup_$timestamp"
mkdir -p "$backup_dir"

# Backup important files that we might delete
cp -r docs "$backup_dir/"
cp -r scripts "$backup_dir/"
cp *.md "$backup_dir/" 2>/dev/null || true
cp test-*.{js,cjs} "$backup_dir/" 2>/dev/null || true

echo "✅ Backup created in $backup_dir"

# Phase 1: Remove temporary test files
echo ""
echo "Phase 1: Removing temporary test files..."
rm -f test-csv-*.{js,cjs}
rm -f create-test-csvs.js
echo "✅ Removed temporary test files"

# Phase 2: Clean up markdown documentation (keep essential ones)
echo ""
echo "Phase 2: Cleaning up excessive documentation..."

# Keep only essential markdown files in root
essential_root_md=(
    "README.md"
    "TODO.md"
)

# Remove non-essential root markdown files
for file in *.md; do
    if [[ -f "$file" ]]; then
        keep=false
        for essential in "${essential_root_md[@]}"; do
            if [[ "$file" == "$essential" ]]; then
                keep=true
                break
            fi
        done
        
        if [[ "$keep" == false ]]; then
            echo "🗑️  Removing $file"
            rm -f "$file"
        fi
    fi
done

# Clean up docs subdirectories (keep only current/essential docs)
echo "🗑️  Cleaning up docs subdirectories..."
rm -rf docs/archives/
rm -rf docs/cleanup/
rm -rf docs/phases/
rm -rf docs/milestones/
rm -rf docs/development/
rm -rf docs/testing/
rm -rf docs/setup/

# Keep only essential docs
essential_docs=(
    "docs/README.md"
    "docs/API.md"
    "docs/ARCHITECTURE.md"
    "docs/SETUP.md"
    "docs/SUPABASE_SETUP.md"
    "docs/CSV_IMPORT_ENHANCEMENT.md"
    "docs/COMPLETE_SCHEMA_REFERENCE.md"
)

# Remove non-essential docs
cd docs
for file in *.md; do
    if [[ -f "$file" ]]; then
        keep=false
        full_path="docs/$file"
        for essential in "${essential_docs[@]}"; do
            if [[ "$full_path" == "$essential" ]]; then
                keep=true
                break
            fi
        done
        
        if [[ "$keep" == false ]]; then
            echo "🗑️  Removing docs/$file"
            rm -f "$file"
        fi
    fi
done
cd ..

echo "✅ Documentation cleanup complete"

# Phase 3: Clean up scripts directory
echo ""
echo "Phase 3: Cleaning up scripts directory..."

# Keep only essential scripts
essential_scripts=(
    "scripts/README.md"
    "scripts/predev-check.ts"
    "scripts/setup-database.sh"
    "scripts/health-check.sh"
    "scripts/validate-error-fixes.sh"
)

cd scripts
for file in *; do
    if [[ -f "$file" ]]; then
        keep=false
        full_path="scripts/$file"
        for essential in "${essential_scripts[@]}"; do
            if [[ "$full_path" == "$essential" ]]; then
                keep=true
                break
            fi
        done
        
        if [[ "$keep" == false ]]; then
            echo "🗑️  Removing scripts/$file"
            rm -f "$file"
        fi
    fi
done
cd ..

echo "✅ Scripts cleanup complete"

# Phase 4: Clean up database directory
echo ""
echo "Phase 4: Cleaning up database directory..."
# Keep schema.sql and migrations, remove seeds if not needed
if [[ -d "database/seeds" ]]; then
    echo "🗑️  Removing database/seeds"
    rm -rf database/seeds/
fi

# Phase 5: Remove mobile development directory if not actively used
echo ""
echo "Phase 5: Mobile directory cleanup..."
if [[ -d "mobile" ]]; then
    echo "❓ Mobile directory found. Remove? (y/n)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        echo "🗑️  Removing mobile directory"
        rm -rf mobile/
    else
        echo "✅ Keeping mobile directory"
    fi
fi

# Phase 6: Clean up stories directory if Storybook not actively used
echo ""
echo "Phase 6: Storybook cleanup..."
if [[ -d "stories" ]]; then
    echo "❓ Stories directory found. Remove Storybook? (y/n)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        echo "🗑️  Removing stories and .storybook directories"
        rm -rf stories/
        rm -rf .storybook/
    else
        echo "✅ Keeping Storybook setup"
    fi
fi

# Phase 7: Clean up performance reports
echo ""
echo "Phase 7: Cleaning up performance reports..."
rm -f performance-report.json
rm -f production-performance-report.json
echo "✅ Removed performance reports"

# Phase 8: Clean up shared directory if unused
echo ""
echo "Phase 8: Shared directory cleanup..."
if [[ -d "shared" ]]; then
    # Check if shared directory has meaningful content
    if [[ -z "$(find shared -name '*.ts' -o -name '*.tsx' | head -1)" ]]; then
        echo "🗑️  Removing empty shared directory"
        rm -rf shared/
    else
        echo "✅ Keeping shared directory (contains TypeScript files)"
    fi
fi

# Phase 9: Clean up husky if not using git hooks
echo ""
echo "Phase 9: Git hooks cleanup..."
if [[ -d ".husky" ]]; then
    echo "❓ Husky git hooks found. Remove? (y/n)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        echo "🗑️  Removing .husky directory"
        rm -rf .husky/
        # Also remove husky from package.json dependencies
        npm uninstall husky @commitlint/cli @commitlint/config-conventional 2>/dev/null || true
        rm -f .commitlintrc.json
    else
        echo "✅ Keeping git hooks setup"
    fi
fi

echo ""
echo "🎉 Cleanup Summary:"
echo "==================="
echo "✅ Removed temporary test files"
echo "✅ Cleaned up excessive documentation"
echo "✅ Streamlined scripts directory"
echo "✅ Cleaned up database directory"
echo "✅ Removed performance reports"
echo "✅ Cleaned up optional directories based on user input"
echo ""
echo "📦 Backup available in: $backup_dir"
echo "🔍 Run 'npm run type-check' and 'npm run lint' to verify nothing broke"
