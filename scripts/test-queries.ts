import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
)

async function testQueries() {
  console.log('Testing various queries with anon key...')

  // Test playbooks
  const { data: playbooks, error: playbooksError } = await supabase
    .from('playbooks')
    .select('*')
    .order('created_at', { ascending: false })

  if (playbooksError) {
    console.error('Playbooks query error:', playbooksError)
  } else {
    console.log('Playbooks:', playbooks?.length || 0, 'found')
  }

  // Test plays
  const { data: plays, error: playsError } = await supabase
    .from('plays')
    .select('*')
    .limit(5)

  if (playsError) {
    console.error('Plays query error:', playsError)
  } else {
    console.log('Plays:', plays?.length || 0, 'found')
  }

  // Test team_posts
  const { data: posts, error: postsError } = await supabase
    .from('team_posts')
    .select('*')
    .limit(5)

  if (postsError) {
    console.error('Team posts query error:', postsError)
  } else {
    console.log('Team posts:', posts?.length || 0, 'found')
  }
}

testQueries().catch(console.error)