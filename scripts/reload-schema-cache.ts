#!/usr/bin/env tsx
/**
 * Reload PostgREST Schema Cache
 * 
 * This script reloads the PostgREST schema cache in Supabase.
 * Run this when you get "Could not find column in schema cache" errors.
 * 
 * Usage:
 *   npm run db:reload-cache
 *   or
 *   tsx scripts/reload-schema-cache.ts
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   VITE_SUPABASE_URL:', SUPABASE_URL ? '✓' : '✗');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_KEY ? '✓' : '✗');
  console.error('\nMake sure these are set in your .env file');
  process.exit(1);
}

async function reloadSchemaCache() {
  console.log('🔄 Reloading PostgREST schema cache...\n');

  try {
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!);

    // Method 1: Use the rpc function (preferred if it exists)
    try {
      const { error: rpcError } = await supabase.rpc('pgrst_watch');
      if (!rpcError) {
        console.log('✅ Schema cache reloaded via RPC function');
        return;
      }
    } catch {
      // RPC function might not exist, continue to HTTP method
    }

    // Method 2: Direct HTTP request to PostgREST admin endpoint
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Prefer': 'schema=public',
      },
    });

    if (response.ok || response.status === 404) {
      console.log('✅ Schema cache reload signal sent');
      console.log('\n💡 Note: The cache should be reloaded within a few seconds.');
      console.log('   If errors persist, try restarting your Supabase project:');
      console.log('   → Go to Supabase Dashboard → Project Settings → API');
      console.log('   → Click "Restart Server" under PostgREST Settings\n');
    } else {
      console.warn('⚠️  Received status:', response.status);
      console.log('\n💡 Alternative: Reload the schema cache manually:');
      console.log('   1. Go to your Supabase Dashboard');
      console.log('   2. SQL Editor → New Query');
      console.log('   3. Run: NOTIFY pgrst, \'reload schema\';');
      console.log('   4. Or restart the PostgREST server\n');
    }
  } catch (error) {
    console.error('❌ Error reloading schema cache:', error);
    console.log('\n💡 Manual reload options:');
    console.log('   1. Supabase Dashboard → SQL Editor');
    console.log('      Run: NOTIFY pgrst, \'reload schema\';');
    console.log('   2. Supabase Dashboard → Project Settings → API');
    console.log('      Click "Restart Server"\n');
    process.exit(1);
  }
}

// Run the script
reloadSchemaCache();
