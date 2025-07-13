// src/lib/teams/createTeam.js
import { supabase } from '@auth/supabaseClient.js';

export async function createTeam(name, userId) {
  // 1. Create the team
  const { data: team, error: teamError } = await supabase
    .from('team_settings')
    .insert({
      name,
      created_by: userId,
    })
    .select()
    .single();

  if (teamError) throw teamError;

  // 2. Add creator as head coach
  const { error: memberError } = await supabase.from('team_members').insert({
    user_id: userId,
    team_id: team.id,
    role: 'head_coach',
  });

  if (memberError) throw memberError;

  return team.id;
}
