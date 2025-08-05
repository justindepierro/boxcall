#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

console.log(
  "🔄 FORCING FILE REFRESH: Rewriting CleanDevPanel.tsx to trigger VS Code sync..."
);
console.log(
  "===============================================================================\n"
);

const filePath = path.join(
  process.cwd(),
  "src/components/dev/CleanDevPanel.tsx"
);

// Read the current content
const content = fs.readFileSync(filePath, "utf8");

// Write it back to force a file change event
fs.writeFileSync(filePath, content);

console.log(
  "✅ File refresh complete! This should trigger VS Code to re-parse the file."
);
console.log(
  "💡 If you still see errors, try restarting the TypeScript language server:"
);
console.log('   Cmd+Shift+P → "TypeScript: Restart TS Server"');
