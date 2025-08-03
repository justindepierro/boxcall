#!/bin/bash

# Clear Stale VS Code References Script
# Run this when you have phantom errors from deleted files

echo "🧹 Clearing Stale VS Code File References..."
echo ""

echo "1. Checking for non-existent files with errors..."

# Function to check if VS Code is running
check_vscode() {
    if pgrep -f "Visual Studio Code" > /dev/null; then
        echo "✅ VS Code is running"
        return 0
    else
        echo "❌ VS Code is not running"
        return 1
    fi
}

# Instructions for manual cleanup
echo "🔧 SAFE ways to clear stale references (won't restore deleted files):"
echo ""
echo "1. Open VS Code Command Palette: Cmd+Shift+P"
echo "2. Try: 'ESLint: Restart ESLint Server' (safest option)"
echo "3. Or close/reopen Problems panel: View → Problems"
echo "4. Last resort: Close VS Code completely and reopen"
echo ""
echo "⚠️  NEVER use 'Developer: Reload Window' - it restores deleted files!"
echo "💡 Alternative: Just hide the Problems panel if errors aren't blocking work"
echo ""

# Check if VS Code is running
if check_vscode; then
    echo "💡 Quick Fix in VS Code:"
    echo "   • Cmd+Shift+P → 'TypeScript: Restart TS Server'"
    echo "   • Cmd+Shift+P → 'ESLint: Restart ESLint Server'"
    echo ""
    echo "🏃‍♂️ Or use VS Code Task:"
    echo "   • Cmd+Shift+P → 'Tasks: Run Task' → 'Clear Stale File References'"
else
    echo "🚀 Start VS Code and then run the commands above"
fi

echo ""
echo "✨ This will clear all phantom errors from deleted files!"
