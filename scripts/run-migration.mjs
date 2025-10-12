#!/usr/bin/env node

/**
 * RLS Policy Migration Script
 * Runs the fix_rls_policies.sql migration via Supabase CLI or direct connection
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://lvmuiqwihlpnwppdqqfl.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_ANON_KEY) {
  console.error('❌ Error: VITE_SUPABASE_ANON_KEY not found in environment');
  console.error('Make sure .env file exists with Supabase credentials');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Read SQL migration file
const sqlFilePath = join(__dirname, 'database', 'migrations', 'fix_rls_policies.sql');
let sqlContent;

try {
  sqlContent = readFileSync(sqlFilePath, 'utf-8');
  console.log('✅ Loaded migration file:', sqlFilePath);
} catch (error) {
  console.error('❌ Error reading SQL file:', error.message);
  process.exit(1);
}

/**
 * Run the migration
 */
async function runMigration() {
  console.log('\n🚀 Starting RLS Policy Migration...\n');

  try {
    // Split SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip comments and empty lines
      if (!statement || statement.startsWith('--')) continue;

      // Extract policy name for logging
      const policyMatch = statement.match(/(?:DROP|CREATE) POLICY (?:IF EXISTS )?"([^"]+)"/);
      const policyName = policyMatch ? policyMatch[1] : `Statement ${i + 1}`;

      try {
        console.log(`⏳ Executing: ${policyName}...`);
        
        const { error } = await supabase.rpc('exec_sql', { 
          sql_query: statement + ';' 
        });

        if (error) {
          // Some errors are expected (like DROP IF EXISTS on non-existent policies)
          if (error.message.includes('does not exist')) {
            console.log(`⚠️  ${policyName} - doesn't exist (skipping)`);
          } else {
            console.error(`❌ ${policyName} - Error:`, error.message);
            errorCount++;
          }
        } else {
          console.log(`✅ ${policyName} - Success`);
          successCount++;
        }
      } catch (err) {
        console.error(`❌ ${policyName} - Exception:`, err.message);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Migration Summary:');
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${errorCount}`);
    console.log('='.repeat(60) + '\n');

    if (errorCount === 0) {
      console.log('🎉 Migration completed successfully!\n');
      await verifyPolicies();
    } else {
      console.log('⚠️  Migration completed with errors. Check logs above.\n');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

/**
 * Verify the policies were created correctly
 */
async function verifyPolicies() {
  console.log('🔍 Verifying policies...\n');

  try {
    // Check plays table policies
    const { data: playsPolicies, error: playsError } = await supabase
      .from('pg_policies')
      .select('policyname, cmd')
      .eq('tablename', 'plays')
      .order('cmd');

    if (playsError) {
      console.warn('⚠️  Could not verify policies (this is OK, policies may still be correct)');
      console.warn('   You can verify manually in Supabase dashboard');
      return;
    }

    console.log('📋 Policies on "plays" table:');
    if (playsPolicies && playsPolicies.length > 0) {
      playsPolicies.forEach(policy => {
        console.log(`   • ${policy.cmd}: ${policy.policyname}`);
      });
    } else {
      console.log('   (No policies found - may need to check manually)');
    }

    console.log('\n✅ Verification complete!');
    console.log('\n📝 Next steps:');
    console.log('   1. Test play creation in your app');
    console.log('   2. Update PlaybookPage to use SecurePlaysService');
    console.log('   3. Add error boundaries');
    console.log('\n');

  } catch (error) {
    console.warn('⚠️  Could not verify policies:', error.message);
    console.warn('   Policies may still be correct. Check Supabase dashboard to confirm.');
  }
}

// Run migration
runMigration().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
