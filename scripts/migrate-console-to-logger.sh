#!/bin/bash
# Console to Logger Migration Script

# Files to process - services first
FILES=$(grep -rln "console\." --include="*.ts" src/services/ 2>/dev/null | grep -v ".test.")

for file in $FILES; do
  # Check if file already has logger import
  if grep -q "from.*utils/logger" "$file"; then
    echo "✓ $file already has logger import"
  else
    # Need to add import
    # Check if there are imports
    if grep -q "^import" "$file"; then
      # Add after last import
      sed -i '' '/^import/!b;:a;n;/^import/ba;i\
import { logError, debug, warn, info } from "../utils/logger";
' "$file"
      echo "➕ Added logger import to $file"
    fi
  fi
  
  # Replace console.error with logError
  sed -i '' 's/console\.error(/logError(/g' "$file"
  
  # Replace console.warn with warn
  sed -i '' 's/console\.warn(/warn(/g' "$file"
  
  # Replace console.log with debug (for non-UI code)
  sed -i '' 's/console\.log(/debug(/g' "$file"
  
  # Replace console.info with info
  sed -i '' 's/console\.info(/info(/g' "$file"
  
  echo "✅ Migrated: $file"
done

echo ""
echo "Migration complete!"
