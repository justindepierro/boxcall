#!/bin/bash

echo "🔧 BoxCall Console Statement Fix"
echo "================================"

# Restore from backup and do a proper console cleanup
backup_dir=""
for dir in performance-backup-*; do
    if [ -d "$dir" ]; then
        backup_dir="$dir"
        break
    fi
done

if [ -z "$backup_dir" ]; then
    echo "❌ No backup directory found. Manual fix needed."
    exit 1
fi

echo "📁 Found backup: $backup_dir"
echo "🔄 Restoring files from backup..."

# Restore all files from backup
cp -r "$backup_dir"/* src/

echo "✅ Files restored from backup"

echo ""
echo "🧹 Doing proper console statement cleanup..."

# Function to properly remove console statements
cleanup_console_statements() {
    local file="$1"
    
    # Create a temporary file
    temp_file=$(mktemp)
    
    # Process the file line by line
    while IFS= read -r line; do
        # Check if line contains standalone console statement
        if [[ "$line" =~ ^[[:space:]]*console\.(log|warn|error|debug|info)\( ]]; then
            # Skip standalone console statements
            echo "    🗑️  Removed: $(echo "$line" | xargs)"
            continue
        elif [[ "$line" =~ console\.(log|warn|error|debug|info)\( ]]; then
            # Line contains console statement but might have other code
            # More careful handling needed - just comment these for safety
            echo "// $line" >> "$temp_file"
            echo "    ⚠️  Commented: $(echo "$line" | xargs)"
        else
            # Regular line, keep as-is
            echo "$line" >> "$temp_file"
        fi
    done < "$file"
    
    # Replace original file with cleaned version
    mv "$temp_file" "$file"
}

# Find and clean files with console statements
find src/ -name "*.ts" -o -name "*.tsx" | while read file; do
    if grep -q "console\." "$file"; then
        echo "  🧹 Cleaning: $file"
        cleanup_console_statements "$file"
    fi
done

echo ""
echo "✅ Console cleanup completed safely"
echo "🔍 Running type check..."

npm run type-check
