#!/bin/bash

# Keep only essential scripts
KEEP_SCRIPTS=(
    "README.md"
    "analyze-unused-code.sh"
    "final-cleanup.sh"
    "health-check.sh"
    "predev-check.ts"
    "setup-database.sh"
    "update-database.sh"
    "validate-error-fixes.sh"
)

echo "🧹 Cleaning scripts directory..."

cd scripts

# Remove all scripts except the ones we want to keep
for file in *; do
    keep=false
    for essential in "${KEEP_SCRIPTS[@]}"; do
        if [[ "$file" == "$essential" ]]; then
            keep=true
            break
        fi
    done
    
    if [[ "$keep" == false ]]; then
        echo "🗑️  Removing scripts/$file"
        rm -f "$file"
    else
        echo "✅ Keeping scripts/$file"
    fi
done

cd ..

echo "✅ Scripts directory cleaned!"
