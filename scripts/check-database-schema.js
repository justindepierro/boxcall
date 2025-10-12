#!/usr/bin/env node
/**
 * Check actual live database schema
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://lvmuiqwihlpnwppdqqfl.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2bXVpcXdpaGxwbndwcGRxcWZsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjAyMjM0OCwiZXhwIjoyMDY3NTk4MzQ4fQ.cCLvqoIWqHHMN_PQoSoST5Jh1PtECbFirGpr-L46Oic'
);

async function checkSchema() {
  console.log('🔍 Checking database schema...\n');

  // Check each table we care about
  const tablesToCheck = [
    'plays',
    'formations', 
    'personnel_configurations',
    'personnel_players',
    'playbooks',
    'teams',
    'team_members'
  ];

  for (const table of tablesToCheck) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`❌ ${table}: DOES NOT EXIST (${error.message})`);
      } else {
        console.log(`✅ ${table}: EXISTS (${count || 0} rows)`);
      }
    } catch (err) {
      console.log(`❌ ${table}: ERROR - ${err.message}`);
    }
  }

  // Check formations columns
  console.log('\n📋 Checking formations table structure...');
  try {
    const { data, error } = await supabase
      .from('formations')
      .select('*')
      .limit(1);

    if (!error && data && data.length > 0) {
      console.log('Columns:', Object.keys(data[0]).join(', '));
    } else if (!error) {
      console.log('Table exists but is empty');
    }
  } catch (err) {
    console.log('Could not read formations structure');
  }

  // Check plays columns
  console.log('\n📋 Checking plays table structure...');
  try {
    const { data, error } = await supabase
      .from('plays')
      .select('*')
      .limit(1);

    if (!error && data && data.length > 0) {
      console.log('Columns:', Object.keys(data[0]).join(', '));
    }
  } catch (err) {
    console.log('Could not read plays structure');
  }

  // Show playbook details
  console.log('\n📚 Checking playbooks details...');
  try {
    const { data, error } = await supabase
      .from('playbooks')
      .select('*');

    if (!error && data) {
      data.forEach(pb => {
        console.log(`\nPlaybook: ${pb.name}`);
        console.log(`  ID: ${pb.id}`);
        console.log(`  Team ID: ${pb.team_id}`);
        console.log(`  Active: ${pb.is_active}`);
        console.log(`  Play Count: ${pb.play_count}`);
      });
    }
  } catch (err) {
    console.log('Could not read playbooks');
  }
}

checkSchema().catch(console.error).finally(() => process.exit(0));
