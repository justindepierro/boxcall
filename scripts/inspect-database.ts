/**
 * Database Schema Inspector
 * 
 * Gets intimate knowledge of what's actually in your Supabase database
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspectDatabase() {
  console.log('🔍 INSPECTING DATABASE SCHEMA\n');
  console.log('='.repeat(70));
  
  // Check what tables exist by trying to query them
  const tablesToCheck = [
    'plays',
    'formations', 
    'playbooks',
    'teams',
    'team_members',
    'personnel_configurations'
  ];

  for (const table of tablesToCheck) {
    console.log(`\n📋 TABLE: ${table}`);
    console.log('-'.repeat(70));
    
    try {
      // Try to get first row to see structure
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`   ❌ Table doesn't exist or no access: ${error.message}`);
        continue;
      }

      if (!data || data.length === 0) {
        console.log(`   📭 Table exists but is empty`);
        continue;
      }

      // Show columns
      const columns = Object.keys(data[0]);
      console.log(`   ✅ Table exists with ${columns.length} columns:`);
      columns.forEach(col => {
        const value = data[0][col];
        const type = typeof value;
        const sample = value === null ? 'null' : 
                      type === 'object' ? JSON.stringify(value).substring(0, 50) :
                      String(value).substring(0, 50);
        console.log(`      • ${col} (${type}): ${sample}`);
      });

      // Get row count
      const { count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      console.log(`   📊 Total rows: ${count || 0}`);

    } catch (err) {
      console.log(`   ❌ Error: ${err}`);
    }
  }

  // Now let's specifically check your plays to understand formation data
  console.log('\n\n' + '='.repeat(70));
  console.log('🎯 DETAILED PLAYS ANALYSIS');
  console.log('='.repeat(70));

  try {
    const { data: plays, error } = await supabase
      .from('plays')
      .select('id, formation, f_dir, f_type, play_name, p_type')
      .limit(20);

    if (error) {
      console.log('❌ Could not fetch plays:', error.message);
    } else if (plays && plays.length > 0) {
      console.log(`\n✅ Found ${plays.length} plays (showing first 20):\n`);
      
      // Group by formation to see patterns
      const formationGroups = plays.reduce((acc, play) => {
        const key = `${play.formation}|${play.f_dir || 'null'}`;
        if (!acc[key]) {
          acc[key] = {
            formation: play.formation,
            f_dir: play.f_dir,
            f_type: play.f_type,
            count: 0,
            playNames: []
          };
        }
        acc[key].count++;
        acc[key].playNames.push(play.play_name);
        return acc;
      }, {} as Record<string, any>);

      console.log('📊 Formation Breakdown:');
      console.log('-'.repeat(70));
      Object.values(formationGroups).forEach((group: any) => {
        console.log(`\n   Formation: "${group.formation}"`);
        console.log(`   f_dir: "${group.f_dir || 'null'}"`);
        console.log(`   f_type: "${group.f_type || 'null'}"`);
        console.log(`   Used in ${group.count} play(s):`);
        group.playNames.forEach((name: string) => {
          console.log(`      • ${name}`);
        });
      });

      // Check for direction patterns
      console.log('\n\n📍 Direction Analysis:');
      console.log('-'.repeat(70));
      const withDirection = plays.filter(p => p.f_dir);
      const withoutDirection = plays.filter(p => !p.f_dir);
      
      console.log(`   Plays with f_dir set: ${withDirection.length}`);
      console.log(`   Plays without f_dir: ${withoutDirection.length}`);
      
      if (withDirection.length > 0) {
        console.log('\n   Unique f_dir values:');
        const uniqueDirs = [...new Set(withDirection.map(p => p.f_dir))];
        uniqueDirs.forEach(dir => {
          const count = withDirection.filter(p => p.f_dir === dir).length;
          console.log(`      • "${dir}": ${count} plays`);
        });
      }
    }
  } catch (err) {
    console.log('❌ Error analyzing plays:', err);
  }

  // Check if formations table exists with data
  console.log('\n\n' + '='.repeat(70));
  console.log('🔍 FORMATIONS TABLE CHECK');
  console.log('='.repeat(70));

  try {
    const { data: formations, error } = await supabase
      .from('formations')
      .select('*')
      .limit(5);

    if (error) {
      console.log('❌ Formations table does not exist or no access');
      console.log(`   Error: ${error.message}`);
    } else if (!formations || formations.length === 0) {
      console.log('⚠️  Formations table exists but is EMPTY');
      console.log('   This explains why the diagnostic showed 0 formations!');
    } else {
      console.log(`✅ Formations table has data! (${formations.length} rows found)`);
      console.log('\n   Sample formation structure:');
      const sample = formations[0];
      Object.keys(sample).forEach(key => {
        console.log(`      • ${key}: ${JSON.stringify(sample[key]).substring(0, 50)}`);
      });
    }
  } catch (err) {
    console.log('❌ Error checking formations:', err);
  }

  console.log('\n\n' + '='.repeat(70));
  console.log('✅ INSPECTION COMPLETE');
  console.log('='.repeat(70));
}

// Run inspection
inspectDatabase()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Inspection failed:', error);
    process.exit(1);
  });
