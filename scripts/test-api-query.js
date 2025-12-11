import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Use service role key to bypass RLS
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function test() {
  console.log('=== Testing Supabase Query with Nested Select ===');
  
  const teamId = 'e2b03ad6-1660-487a-aa35-5de132f641b8'; // Burke Catholic
  
  const { data, error } = await supabase
    .from('practice_scripts')
    .select(`
      *,
      practice_script_plays (
        *,
        plays (*)
      )
    `)
    .eq('team_id', teamId)
    .order('updated_at', { ascending: false });
  
  if (error) {
    console.log('Error:', error);
    return;
  }
  
  console.log('Scripts found:', data?.length || 0);
  
  if (data && data.length > 0) {
    const script = data[0];
    console.log('First script:', {
      id: script.id,
      title: script.title,
      practice_script_plays: script.practice_script_plays,
      playCount: script.practice_script_plays?.length || 0,
    });
    
    if (script.practice_script_plays && script.practice_script_plays.length > 0) {
      console.log('First play in script:', script.practice_script_plays[0]);
    }
  }
}

test();
