#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const client = createClient(
  'https://lvmuiqwihlpnwppdqqfl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2bXVpcXdpaGxwbndwcGRxcWZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwMjIzNDgsImV4cCI6MjA2NzU5ODM0OH0.3SreGdPAJ2J5XcQVbNIbzK378j15ZJnwQqscBE2HkII'
);

async function testDatabaseOperations() {
  console.log('🧪 Testing database operations...');
  
  try {
    // Test 1: Simple select count
    console.log('1. Testing count query...');
    const countResult = await client
      .from('teams')
      .select('*', { count: 'exact', head: true });
    console.log('✅ Count result:', countResult.count);
    
    // Test 2: Insert operation
    console.log('2. Testing insert operation...');
    const teamData = {
      name: `Test Team ${Date.now()}`,
      school_name: 'Test School',
      mascot: 'Eagles',
      season_year: 2025
    };
    
    const insertResult = await client
      .from('teams')
      .insert(teamData)
      .select('id')
      .single();
      
    console.log('✅ Insert result:', insertResult);
    
    if (insertResult.error) {
      console.error('❌ Insert error:', insertResult.error);
    } else {
      console.log('✅ Successfully inserted team with ID:', insertResult.data.id);
      
      // Test 3: Clean up - delete the test team
      console.log('3. Cleaning up test team...');
      const deleteResult = await client
        .from('teams')
        .delete()
        .eq('id', insertResult.data.id);
      console.log('✅ Cleanup result:', deleteResult);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run with a timeout
const timeout = setTimeout(() => {
  console.error('❌ Test timed out after 30 seconds');
  process.exit(1);
}, 30000);

testDatabaseOperations()
  .then(() => {
    clearTimeout(timeout);
    console.log('✅ All tests completed');
    process.exit(0);
  })
  .catch((error) => {
    clearTimeout(timeout);
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  });