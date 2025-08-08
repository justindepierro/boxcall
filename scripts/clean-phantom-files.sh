#!/bin/bash

# Clean Phantom Files - Remove empty files VS Code auto-creates
# Usage: ./scripts/clean-phantom-files.sh

echo "🧹 Cleaning phantom files..."

# Define phantom file patterns
PHANTOM_FILES=(
  "src/components/dev/DevToolsPanel.tsx"
  "src/components/dev/SimpleDevTools.tsx" 
  "src/components/dev/ProfessionalDevTools.tsx"
  "src/pages/DashboardPageV4.tsx"
  "src/pages/Playground.tsx"
  "src/services/DashboardServiceV4.ts"
)

PHANTOM_DIRS=(
  "src/tests"
  "src/examples"
  "src/components/rsvp/AdvancedRSVPInterface"
  "src/components/ui/Icon/examples"
)

# Count files removed
removed_count=0

# Remove phantom files (only if they're empty)
for file in "${PHANTOM_FILES[@]}"; do
  if [[ -f "$file" ]]; then
    # Check if file is empty (0 bytes)
    if [[ ! -s "$file" ]]; then
      echo "  🗑️  Removing empty file: $file"
      rm -f "$file"
      ((removed_count++))
    else
      echo "  ⚠️   Skipping non-empty file: $file"
    fi
  fi
done

# Remove phantom directories (only if they're empty)
for dir in "${PHANTOM_DIRS[@]}"; do
  if [[ -d "$dir" ]]; then
    if [[ -z "$(ls -A "$dir")" ]]; then
      echo "  🗑️  Removing empty directory: $dir"
      rm -rf "$dir"
      ((removed_count++))
    else
      echo "  ⚠️   Skipping non-empty directory: $dir"
    fi
  fi
done

# Remove any 0-byte TypeScript files in src/
echo "🔍 Scanning for empty TypeScript files..."
while IFS= read -r -d '' file; do
  if [[ ! -s "$file" ]]; then
    echo "  🗑️  Removing empty file: $file"
    rm -f "$file"
    ((removed_count++))
  fi
done < <(find src/ -name "*.ts" -o -name "*.tsx" -print0 2>/dev/null)

# Summary
if [[ $removed_count -eq 0 ]]; then
  echo "✅ No phantom files found - workspace is clean!"
else
  echo "✅ Removed $removed_count phantom files/directories"
fi

# Restart TypeScript server hint
echo "💡 Tip: Run 'Cmd+Shift+P → TypeScript: Restart TS Server' to clear VS Code cache"
