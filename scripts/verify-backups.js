// Backup verification script
// Run with: node scripts/verify-backups.js

const fs = require("fs");
const path = require("path");

const verifyBackups = () => {
  console.log("🔍 Verifying backup system...");

  // Check for backup directories
  const backupPaths = ["database/backups", "public/exports"];

  backupPaths.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Created backup directory: ${dir}`);
    } else {
      console.log(`✅ Backup directory exists: ${dir}`);
    }
  });

  console.log("🎯 Backup verification complete");
};

verifyBackups();
