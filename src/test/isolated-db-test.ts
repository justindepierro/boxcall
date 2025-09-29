import { createClient } from '@supabase/supabase-js';

// Test function that creates a completely isolated Supabase client
export async function testIsolatedDatabaseConnection() {
  console.log('🧪 Testing isolated database connection...');
  
  try {
    // Create a completely fresh client with no shared state
    const testClient = createClient(
      'https://lvmuiqwihlpnwppdqqfl.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2bXVpcXdpaGxwbndwcGRxcWZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwMjIzNDgsImV4cCI6MjA2NzU5ODM0OH0.3SreGdPAJ2J5XcQVbNIbzK378j15ZJnwQqscBE2HkII',
      {
        auth: {
          persistSession: false, // Don't persist session
          detectSessionInUrl: false, // Don't detect session from URL
          autoRefreshToken: false, // Don't auto refresh
        }
      }
    );
    
    console.log('✅ Test client created');
    
    // Test 1: Simple count with timeout
    console.log('🔍 Test 1: Simple count query...');
    const countPromise = testClient
      .from('teams')
      .select('*', { count: 'exact', head: true });
      
    const countTimeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Count timeout')), 5000)
    );
    
    const countResult = await Promise.race([countPromise, countTimeout]);
    console.log('✅ Count result:', countResult);
    
    // Test 2: Simple insert with timeout
    console.log('🔍 Test 2: Simple insert...');
    const insertData = {
      name: `Isolation Test ${Date.now()}`,
      school_name: 'Test School',
      mascot: 'Test Mascot',
      season_year: 2025
    };
    
    const insertPromise = testClient
      .from('teams')
      .insert(insertData)
      .select('id')
      .single();
      
    const insertTimeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Insert timeout')), 10000)
    );
    
    const insertResult = await Promise.race([insertPromise, insertTimeout]);
    console.log('✅ Insert result:', insertResult);
    
    // Clean up
    if (insertResult.data?.id) {
      await testClient.from('teams').delete().eq('id', insertResult.data.id);
      console.log('✅ Cleanup completed');
    }
    
    return { success: true, message: 'All tests passed' };
    
  } catch (error) {
    console.error('❌ Isolation test failed:', error);
    return { success: false, error: error.message };
  }
}