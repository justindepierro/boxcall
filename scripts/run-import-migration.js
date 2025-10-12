#!/usr/bin/env node
/**
 * Run import migration: Create formations from existing plays
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://lvmuiqwihlpnwppdqqfl.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2bXVpcXdpaGxwbndwcGRxcWZsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjAyMjM0OCwiZXhwIjoyMDY3NTk4MzQ4fQ.cCLvqoIWqHHMN_PQoSoST5Jh1PtECbFirGpr-L46Oic'
);

async function runImportMigration() {
  console.log('🚀 Running import migration: formations from plays\n');

  try {
    // Step 1: Check current state
    console.log('📊 BEFORE Import:');
    const { count: beforeCount } = await supabase
      .from('formations')
      .select('*', { count: 'exact', head: true });
    console.log(`   Formations: ${beforeCount || 0} rows\n`);

    // Step 2: Get plays to import
    console.log('🔍 Analyzing plays...');
    const { data: plays, error: playsError } = await supabase
      .from('plays')
      .select('playbook_id, formation, created_by')
      .not('formation', 'is', null)
      .neq('formation', '');

    if (playsError) {
      throw new Error(`Failed to fetch plays: ${playsError.message}`);
    }

    console.log(`   Found ${plays?.length || 0} plays with formations`);
    
    if (plays && plays.length > 0) {
      // Get unique formations per playbook
      const uniqueFormations = new Map();
      plays.forEach(play => {
        const key = `${play.playbook_id}:${play.formation}`;
        if (!uniqueFormations.has(key)) {
          uniqueFormations.set(key, {
            playbook_id: play.playbook_id,
            name: play.formation,
            created_by: play.created_by
          });
        }
      });

      console.log(`   Unique formations to import: ${uniqueFormations.size}\n`);

      // Step 3: Import formations
      console.log('📝 Importing formations...');
      
      for (const [key, formationData] of uniqueFormations) {
        // Check if formation already exists
        const { data: existing } = await supabase
          .from('formations')
          .select('id')
          .eq('playbook_id', formationData.playbook_id)
          .eq('name', formationData.name)
          .maybeSingle();

        if (existing) {
          console.log(`   ⏭️  Skipping "${formationData.name}" (already exists)`);
          continue;
        }

        // Insert new formation
        const { error: insertError } = await supabase
          .from('formations')
          .insert({
            playbook_id: formationData.playbook_id,
            name: formationData.name,
            description: 'Imported from plays',
            category: 'spread',
            personnel_packages: [],
            direction: 'base',
            is_custom: true,
            created_by: formationData.created_by
          });

        if (insertError) {
          console.error(`   ❌ Failed to import "${formationData.name}": ${insertError.message}`);
        } else {
          console.log(`   ✅ Imported "${formationData.name}"`);
        }
      }
    } else {
      console.log('   ⚠️  No plays with formations found\n');
    }

    // Step 4: Check final state
    console.log('\n📊 AFTER Import:');
    const { count: afterCount } = await supabase
      .from('formations')
      .select('*', { count: 'exact', head: true });
    console.log(`   Formations: ${afterCount || 0} rows`);
    console.log(`   Added: ${(afterCount || 0) - (beforeCount || 0)} new formations\n`);

    // Step 5: Show formations by playbook
    const { data: formations, error: formationsError } = await supabase
      .from('formations')
      .select('playbook_id, name, direction')
      .order('playbook_id')
      .order('name');

    if (!formationsError && formations && formations.length > 0) {
      console.log('📋 All Formations:');
      const byPlaybook = formations.reduce((acc, f) => {
        if (!acc[f.playbook_id]) acc[f.playbook_id] = [];
        acc[f.playbook_id].push(f);
        return acc;
      }, {});

      Object.entries(byPlaybook).forEach(([playbookId, forms]) => {
        console.log(`\n   Playbook: ${playbookId.substring(0, 8)}...`);
        forms.forEach(f => {
          console.log(`      - ${f.name} (${f.direction})`);
        });
      });
    }

    console.log('\n✅ Import migration complete!');
    console.log('\n💡 Next steps:');
    console.log('   1. Refresh your browser');
    console.log('   2. Open Formation Manager → Edit Details tab');
    console.log('   3. You should see formations in the dropdown\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runImportMigration().catch(console.error).finally(() => process.exit(0));
