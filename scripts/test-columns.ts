import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!
)

async function testColumns() {
  console.log('Testing what columns exist in profiles table...')

  const testData = {
    id: '5090d80a-41aa-452e-b2c9-4c37fe11bf97',
    full_name: 'BoxCall Admin'
  }

  // Test basic insert
  const { error: basicError } = await supabase
    .from('profiles')
    .insert(testData)

  if (basicError) {
    console.error('Basic insert failed:', basicError.message)
  } else {
    console.log('Basic insert succeeded')
    return
  }

  // If basic fails, the table might have different structure
  // Let's try to see what happens with select
  const { data: selectData, error: selectError } = await supabase
    .from('profiles')
    .select('*')

  if (selectError) {
    console.error('Select failed:', selectError)
  } else {
    console.log('Profiles in table:', selectData?.length || 0)
    if (selectData && selectData.length > 0) {
      console.log('Sample profile:', selectData[0])
    }
  }
}

testColumns().catch(console.error)