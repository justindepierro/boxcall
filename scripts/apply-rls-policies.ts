import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function applyRLSPolicies() {
  try {
    console.log('🔧 Applying proper RLS policies...');

    // Read the SQL file
    const sqlContent = readFileSync('database/proper-rls-policies.sql', 'utf8');

    // Split into individual statements (basic approach)
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📄 Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
          if (error) {
            console.error(`❌ Error in statement ${i + 1}:`, error.message);
            // Continue with other statements
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`);
          }
        } catch (err) {
          console.error(`❌ Failed to execute statement ${i + 1}:`, err);
        }
      }
    }

    console.log('🎉 RLS policy application complete!');
    console.log('🔍 Testing policies...');

    // Test the policies
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*')
      .limit(1);

    if (teamsError) {
      console.error('❌ Teams query failed:', teamsError.message);
    } else {
      console.log(`✅ Teams accessible: ${teams?.length || 0} records`);
    }

    const { data: posts, error: postsError } = await supabase
      .from('team_posts')
      .select('*')
      .limit(1);

    if (postsError) {
      console.error('❌ Team posts query failed:', postsError.message);
    } else {
      console.log(`✅ Team posts accessible: ${posts?.length || 0} records`);
    }

  } catch (error) {
    console.error('❌ Failed to apply RLS policies:', error);
  }
}

applyRLSPolicies();