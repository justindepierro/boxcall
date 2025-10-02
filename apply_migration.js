#!/usr/bin/env node
/**
 * Apply migration using Supabase Management API
 * Usage: node apply_migration.js
 */

const fs = require("fs");
const https = require("https");

// Read the SQL file
const sqlContent = fs.readFileSync(
  "database/migrations/step2_activities_minimal.sql",
  "utf8"
);

console.log("🚀 Applying activities migration via Supabase API...\n");

// You'll need to provide these
const PROJECT_REF = process.env.SUPABASE_PROJECT_REF || "";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!PROJECT_REF || !SERVICE_ROLE_KEY) {
  console.error("❌ Missing environment variables:");
  console.error("   SUPABASE_PROJECT_REF");
  console.error("   SUPABASE_SERVICE_ROLE_KEY");
  console.error("\nSet them like this:");
  console.error('   export SUPABASE_PROJECT_REF="your-project-ref"');
  console.error('   export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"');
  process.exit(1);
}

// Use Supabase REST API to execute SQL
const url = `https://${PROJECT_REF}.supabase.co/rest/v1/rpc/exec_sql`;

const postData = JSON.stringify({
  query: sqlContent,
});

const options = {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    apikey: SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
  },
};

const req = https.request(url, options, (res) => {
  let data = "";

  res.on("data", (chunk) => {
    data += chunk;
  });

  res.on("end", () => {
    if (res.statusCode === 200) {
      console.log("✅ Migration completed successfully!\n");
      console.log("Response:", data);
    } else {
      console.error("❌ Migration failed\n");
      console.error("Status:", res.statusCode);
      console.error("Response:", data);
    }
  });
});

req.on("error", (error) => {
  console.error("❌ Request failed:", error);
});

req.write(postData);
req.end();
