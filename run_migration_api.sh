#!/bin/bash
# Execute SQL migration using Supabase REST API
# This completely bypasses the buggy UI

PROJECT_REF="lvmuiqwihlpnwppdqqfl"
SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2bXVpcXdpaGxwbndwcGRxcWZsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjAyMjM0OCwiZXhwIjoyMDY3NTk4MzQ4fQ.cCLvqoIWqHHMN_PQoSoST5Jh1PtECbFirGpr-L46Oic"

echo "🚀 Executing migration via Supabase API..."
echo ""

# Read the SQL file
SQL_CONTENT=$(cat database/migrations/step2_activities_minimal.sql)

# Execute via REST API
curl -X POST \
  "https://${PROJECT_REF}.supabase.co/rest/v1/rpc/exec" \
  -H "apikey: ${SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"query\": $(echo "$SQL_CONTENT" | jq -Rs .)}" \
  -w "\n\nHTTP Status: %{http_code}\n"

echo ""
echo "✅ Migration completed!"
