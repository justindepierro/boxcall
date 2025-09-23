#!/usr/bin/env npx tsx

/**
 * Inspect database table structure
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://lvmuiqwihlpnwppdqqfl.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2bXVpcXdpaGxwbndwcGRxcWZsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjAyMjM0OCwiZXhwIjoyMDY3NTk4MzQ4fQ.cCLvqoIWqHHMN_PQoSoST5Jh1PtECbFirGpr-L46Oic';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function inspectTables() {
  console.log('🔍 Inspecting database table structure...');

  try {
    // Check teams table structure
    console.log('\n📋 Teams table:');
    const { data: teamsData, error: teamsError } = await supabase
      .from('teams')
      .select('*')
      .limit(1);

    if (teamsError) {
      console.log('❌ Error:', teamsError.message);
    } else {
      console.log('✅ Can query teams table');
      if (teamsData && teamsData.length > 0) {
        console.log('Sample row:', JSON.stringify(teamsData[0], null, 2));
      }
    }

    // Try to get column info via information_schema
    console.log('\n📋 Column information:');
    const { data: columns, error: columnsError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns
          WHERE table_name = 'teams'
          ORDER BY ordinal_position;
        `
      });

    if (columnsError) {
      console.log('❌ Could not get column info via RPC');
    } else {
      console.log('Teams table columns:');
      console.table(columns);
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

inspectTables();