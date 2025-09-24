#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '../.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 CHECKING SUPABASE CONFIGURATION');
console.log('==================================\n');

console.log('Environment Variables:');
console.log(`  - URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`);
console.log(`  - Service Key: ${serviceRoleKey ? '✅ Set' : '❌ Missing'}`);
console.log(`  - Anon Key: ${anonKey ? '✅ Set' : '❌ Missing'}`);

if (!supabaseUrl || !serviceRoleKey || !anonKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

// Test with service role key (what the app uses)
console.log('\n🔧 Testing Service Role Key:');
const serviceClient = createClient(supabaseUrl, serviceRoleKey);

try {
  const { data: _serviceData, error: serviceError } = await serviceClient
    .from('profiles')
    .select('id, full_name, email, is_active')
    .limit(1);

  if (serviceError) {
    console.log('❌ Service key query failed:', serviceError.message);
  } else {
    console.log('✅ Service key query successful');
  }
} catch (err) {
  console.log('❌ Service key error:', (err as Error).message);
}

// Test with anon key (what browser might be using)
console.log('\n🔧 Testing Anon Key:');
const anonClient = createClient(supabaseUrl, anonKey);

try {
  const { data: _anonData, error: anonError } = await anonClient
    .from('profiles')
    .select('id, full_name, email, is_active')
    .limit(1);

  if (anonError) {
    console.log('❌ Anon key query failed:', anonError.message);
  } else {
    console.log('✅ Anon key query successful');
  }
} catch (err) {
  console.log('❌ Anon key error:', (err as Error).message);
}

console.log('\n💡 The app should be using the service role key, which bypasses RLS.');