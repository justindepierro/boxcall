#!/usr/bin/env tsx
/**
 * Debug Development Data Script
 * 
 * This script checks what data was actually created in the database
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugDevelopmentData() {
  console.log('🔍 Debugging development data...');
  
  try {
    const userId = 'fafcaafd-0154-4f87-9752-95fbfa2372a0';
    
    // Check user profile
    console.log('\n👤 Checking user profile...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId);
      
    if (profileError) {
      console.log('❌ Profile error:', profileError);
    } else {
      console.log('✅ Profile query result:', profile);
      console.log(`📊 Found ${profile?.length || 0} profiles`);
    }
    
    // Check teams
    console.log('\n🏈 Checking teams...');
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*');
      
    if (teamsError) {
      console.log('❌ Teams error:', teamsError);
    } else {
      console.log('✅ Teams found:', teams?.length || 0);
      teams?.forEach(team => {
        console.log(`  - ${team.name} (${team.id})`);
      });
    }
    
    // Check team memberships for our user
    console.log('\n👥 Checking team memberships...');
    const { data: memberships, error: membershipError } = await supabase
      .from('team_members')
      .select('*')
      .eq('user_id', userId);
      
    if (membershipError) {
      console.log('❌ Membership error:', membershipError);
    } else {
      console.log('✅ Memberships found:', memberships?.length || 0);
      memberships?.forEach(membership => {
        console.log(`  - Team: ${membership.team_id}, Role: ${membership.team_role}, Status: ${membership.status}`);
      });
    }
    
    // Check all team memberships (not just for our user)
    console.log('\n👥 Checking all team memberships...');
    const { data: allMemberships, error: allMembershipError } = await supabase
      .from('team_members')
      .select('*');
      
    if (allMembershipError) {
      console.log('❌ All memberships error:', allMembershipError);
    } else {
      console.log('✅ Total memberships found:', allMemberships?.length || 0);
      allMemberships?.forEach(membership => {
        console.log(`  - User: ${membership.user_id}, Team: ${membership.team_id}, Role: ${membership.team_role}`);
      });
    }
    
    // Test the exact same query that roleService uses
    console.log('\n🔍 Testing roleService query...');
    const { data: roleServiceQuery, error: roleServiceError } = await supabase
      .from('team_members')
      .select(`
        team_id,
        team_role,
        capabilities,
        role_notes,
        assigned_at,
        status
      `)
      .eq('user_id', userId)
      .eq('status', 'active');
      
    if (roleServiceError) {
      console.log('❌ RoleService query error:', roleServiceError);
    } else {
      console.log('✅ RoleService query result:', roleServiceQuery);
      console.log(`📊 Found ${roleServiceQuery?.length || 0} active memberships`);
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

// Run the debug
debugDevelopmentData().then(() => {
  console.log('\n🏁 Debug script finished');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Debug script error:', error);
  process.exit(1);
});