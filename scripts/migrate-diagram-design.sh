#!/bin/bash

# Diagram Editor Design System Migration Script
# Converts dark slate theme to Aurora design system with proper color tokens

echo "🎨 Starting Diagram Editor Design System Migration..."

EDITOR_DIR="src/components/playbook/diagram-editor"

# Backup files first
echo "📦 Creating backups..."
mkdir -p .design-migration-backup
cp -r $EDITOR_DIR .design-migration-backup/

echo "🔄 Applying color token replacements..."

# Main backgrounds
find $EDITOR_DIR -type f -name "*.tsx" -exec sed -i '' \
  -e 's/bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950/bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900/g' \
  {} \;

# Secondary backgrounds  
find $EDITOR_DIR -type f -name "*.tsx" -exec sed -i '' \
  -e 's/bg-slate-900\/50/bg-surface-primary\/80/g' \
  -e 's/bg-slate-900\/60/surface-muted/g' \
  -e 's/bg-slate-900\/70/surface-card/g' \
  -e 's/bg-slate-900\/95/surface-card-elevated/g' \
  -e 's/bg-slate-900\/40/bg-surface-secondary\/50/g' \
  -e 's/bg-slate-800\/40/surface-card/g' \
  -e 's/bg-slate-800\/60/bg-surface-secondary/g' \
  -e 's/bg-slate-700/bg-surface-secondary/g' \
  {} \;

# Borders
find $EDITOR_DIR -type f -name "*.tsx" -exec sed -i '' \
  -e 's/border-slate-800\/60/border-border/g' \
  -e 's/border-slate-800/border-border-medium/g' \
  -e 's/border-slate-700\/50/border-subtle/g' \
  -e 's/border-slate-700/border-border-medium/g' \
  -e 's/border-slate-600/border-border/g' \
  {} \;

# Text colors
find $EDITOR_DIR -type f -name "*.tsx" -exec sed -i '' \
  -e 's/text-slate-100/text-text-primary/g' \
  -e 's/text-slate-200/text-text-primary/g' \
  -e 's/text-slate-300/text-text-secondary/g' \
  -e 's/text-slate-400/text-text-muted/g' \
  {} \;

# Hover states
find $EDITOR_DIR -type f -name "*.tsx" -exec sed -i '' \
  -e 's/hover:text-slate-100/hover:text-text-primary/g' \
  -e 's/hover:bg-slate-800\/80/hover:bg-surface-secondary/g' \
  {} \;

# Focus states
find $EDITOR_DIR -type f -name "*.tsx" -exec sed -i '' \
  -e 's/focus:ring-offset-slate-900/focus:ring-offset-surface-primary/g' \
  {} \;

# Top bar gradients
find $EDITOR_DIR -type f -name "*.tsx" -exec sed -i '' \
  -e 's/bg-gradient-to-r from-slate-900\/95 via-slate-900\/90 to-slate-900\/95/surface-card border-b border-border/g' \
  {} \;

echo "✅ Color token migration complete!"
echo "📝 Please review changes and run: npm run type-check"
echo "💾 Backups saved to: .design-migration-backup/"
