/**
 * Formation Data Diagnostic Script
 * 
 * Checks current formations in the database and reports:
 * - Total formations count
 * - Formations with directions (left/right)
 * - Formations with opposites linked
 * - Formations needing attention
 * - Priority breakdown (high/medium/low)
 */

import { createClient } from '@supabase/supabase-js';

// Check if we have environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface FormationData {
  id: string;
  name: string;
  direction: 'left' | 'right' | null;
  opposite_formation_id: string | null;
  usage_count: number;
  playbook_id: string;
  creation_source?: string;
  metadata_quality?: string;
}

async function checkFormations() {
  console.log('🔍 Checking formation data...\n');

  try {
    // Get all formations
    const { data: formations, error } = await supabase
      .from('formations')
      .select('id, name, direction, opposite_formation_id, usage_count, playbook_id, creation_source, metadata_quality')
      .order('usage_count', { ascending: false });

    if (error) {
      console.error('❌ Error fetching formations:', error);
      return;
    }

    if (!formations || formations.length === 0) {
      console.log('📭 No formations found in database');
      return;
    }

    console.log(`📊 Total Formations: ${formations.length}\n`);

    // Group by playbook
    const byPlaybook = formations.reduce((acc, f) => {
      if (!acc[f.playbook_id]) {
        acc[f.playbook_id] = [];
      }
      acc[f.playbook_id].push(f as FormationData);
      return acc;
    }, {} as Record<string, FormationData[]>);

    // Analyze each playbook
    for (const [playbookId, pbFormations] of Object.entries(byPlaybook)) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📚 Playbook: ${playbookId.substring(0, 8)}...`);
      console.log(`${'='.repeat(60)}\n`);

      analyzePlaybook(pbFormations);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

function analyzePlaybook(formations: FormationData[]) {
  // Basic stats
  const withDirection = formations.filter(f => f.direction !== null);
  const withOpposites = formations.filter(f => f.opposite_formation_id && f.opposite_formation_id !== f.id);
  const standalone = formations.filter(f => f.opposite_formation_id === f.id);
  const needingAttention = formations.filter(f => 
    f.direction && (!f.opposite_formation_id || f.opposite_formation_id === f.id) === false
  );

  console.log(`📈 Overview:`);
  console.log(`   • Total formations: ${formations.length}`);
  console.log(`   • With direction (left/right): ${withDirection.length}`);
  console.log(`   • With opposite linked: ${withOpposites.length}`);
  console.log(`   • Marked as standalone: ${standalone.length}`);
  console.log(`   • Possibly needing attention: ${needingAttention.length}\n`);

  // Priority breakdown
  const highPriority = formations.filter(f => 
    f.direction && 
    (!f.opposite_formation_id || f.opposite_formation_id === f.id) === false &&
    (f.usage_count || 0) >= 5
  );
  
  const medPriority = formations.filter(f => 
    f.direction && 
    (!f.opposite_formation_id || f.opposite_formation_id === f.id) === false &&
    (f.usage_count || 0) >= 2 && 
    (f.usage_count || 0) < 5
  );
  
  const lowPriority = formations.filter(f => 
    f.direction && 
    (!f.opposite_formation_id || f.opposite_formation_id === f.id) === false &&
    (f.usage_count || 0) < 2
  );

  if (highPriority.length + medPriority.length + lowPriority.length > 0) {
    console.log(`🚨 Formations Needing Opposites:\n`);
    
    if (highPriority.length > 0) {
      console.log(`   🔴 High Priority (5+ uses): ${highPriority.length}`);
      highPriority.slice(0, 5).forEach(f => {
        console.log(`      • ${f.name} (${f.direction}) - ${f.usage_count || 0} uses`);
      });
      if (highPriority.length > 5) {
        console.log(`      ... and ${highPriority.length - 5} more\n`);
      } else {
        console.log('');
      }
    }

    if (medPriority.length > 0) {
      console.log(`   🟡 Medium Priority (2-4 uses): ${medPriority.length}`);
      medPriority.slice(0, 5).forEach(f => {
        console.log(`      • ${f.name} (${f.direction}) - ${f.usage_count || 0} uses`);
      });
      if (medPriority.length > 5) {
        console.log(`      ... and ${medPriority.length - 5} more\n`);
      } else {
        console.log('');
      }
    }

    if (lowPriority.length > 0) {
      console.log(`   🟢 Low Priority (0-1 uses): ${lowPriority.length}`);
      lowPriority.slice(0, 5).forEach(f => {
        console.log(`      • ${f.name} (${f.direction || 'no direction'}) - ${f.usage_count || 0} uses`);
      });
      if (lowPriority.length > 5) {
        console.log(`      ... and ${lowPriority.length - 5} more\n`);
      } else {
        console.log('');
      }
    }
  } else {
    console.log(`✅ All formations are properly configured!\n`);
  }

  // Direction breakdown
  const leftFormations = formations.filter(f => f.direction === 'left');
  const rightFormations = formations.filter(f => f.direction === 'right');
  const noDirection = formations.filter(f => !f.direction);

  console.log(`📍 Direction Breakdown:`);
  console.log(`   • Left: ${leftFormations.length}`);
  console.log(`   • Right: ${rightFormations.length}`);
  console.log(`   • No direction: ${noDirection.length}\n`);

  // Sample formations
  console.log(`📋 Sample Formations (top 10 by usage):\n`);
  const topFormations = [...formations]
    .sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0))
    .slice(0, 10);

  topFormations.forEach((f, i) => {
    const hasOpposite = f.opposite_formation_id && f.opposite_formation_id !== f.id;
    const isStandalone = f.opposite_formation_id === f.id;
    const status = hasOpposite ? '✅ Has opposite' : isStandalone ? '🔷 Standalone' : '⚠️  Needs opposite';
    
    console.log(`   ${i + 1}. ${f.name}`);
    console.log(`      Direction: ${f.direction || 'none'} | Uses: ${f.usage_count || 0} | ${status}`);
    if (f.creation_source) {
      console.log(`      Source: ${f.creation_source}`);
    }
    console.log('');
  });

  // Creation source breakdown
  if (formations.some(f => f.creation_source)) {
    const bySources = formations.reduce((acc, f) => {
      const source = f.creation_source || 'unknown';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log(`🏗️  Creation Sources:`);
    Object.entries(bySources).forEach(([source, count]) => {
      console.log(`   • ${source}: ${count}`);
    });
    console.log('');
  }

  // Metadata quality breakdown
  if (formations.some(f => f.metadata_quality)) {
    const byQuality = formations.reduce((acc, f) => {
      const quality = f.metadata_quality || 'unknown';
      acc[quality] = (acc[quality] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log(`📊 Metadata Quality:`);
    Object.entries(byQuality).forEach(([quality, count]) => {
      console.log(`   • ${quality}: ${count}`);
    });
    console.log('');
  }
}

// Run the check
checkFormations()
  .then(() => {
    console.log('\n✨ Analysis complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Analysis failed:', error);
    process.exit(1);
  });
