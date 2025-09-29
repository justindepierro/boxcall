// Direct HTTP API approach to bypass Supabase client issues
export async function createTeamDirectly(teamData: {
  name: string;
  school_name: string;
  mascot: string;
  season_year: number;
}) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  console.log('🌐 Using direct HTTP approach to bypass Supabase client');
  
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/teams`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(teamData)
    });
    
    console.log('📡 Direct HTTP response status:', response.status);
    console.log('📡 Direct HTTP response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Direct HTTP error response:', errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    console.log('✅ Direct HTTP success:', result);
    return { data: result[0], error: null };
    
  } catch (error) {
    console.error('❌ Direct HTTP failed:', error);
    return { data: null, error };
  }
}