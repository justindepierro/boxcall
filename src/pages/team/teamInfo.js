// src/pages/team/teaminfo.js

import { supabase } from '@auth/supabaseClient.js';
import { getCurrentUser } from '@state/authState.js';
import { getUserSettings } from '@lib/teams/user/getUserSettings.js';
import { showSpinner, hideSpinner } from '@utils/spinner.js';

/**
 * Renders the read-only team info panel.
 */
export default async function renderTeamInfoPage() {
  const container = document.getElementById('page-view');
  const user = getCurrentUser();

  if (!user) {
    container.innerHTML = `<p>❌ Not logged in</p>`;
    return;
  }

  showSpinner();

  // Get user's team settings
  const settings = await getUserSettings(user.id);
  const teamId = settings?.team_id;

  if (!teamId) {
    hideSpinner();
    container.innerHTML = `<p>❌ No team assigned</p>`;
    return;
  }

  console.log('🔍 Fetching team with ID:', teamId);

  // Check the Supabase auth state
  const {
    data: { user: currentUser },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.error('🚨 Error getting user:', userError.message);
  } else {
    console.log('🔐 Current user ID:', currentUser.id);
  }

  // Optional debug: RPC function to confirm Supabase identity from RLS perspective
  const { data: whoamiData, error: whoamiError } = await supabase.rpc('whoami');
  if (whoamiError) {
    console.error('❌ Supabase RLS check failed (whoami):', whoamiError.message);
  } else {
    console.log('✅ Supabase sees user as:', whoamiData);
  }

  // Query team info using maybeSingle to avoid 500 on RLS denial
  const { data: team, error: teamError } = await supabase
    .from('team_settings')
    .select('*')
    .eq('id', teamId)
    .maybeSingle(); // 👈 Prevents crash if RLS blocks access

  hideSpinner();

  if (teamError) {
    console.error('❌ Team fetch error:', teamError.message);
    container.innerHTML = `<p>❌ Failed to load team info</p>`;
    return;
  }

  if (!team) {
    container.innerHTML = `<p>🚫 You do not have access to this team or it doesn’t exist.</p>`;
    return;
  }

  // Render the team info
  container.innerHTML = `
    <div class="space-y-4">
      <h2 class="text-2xl font-semibold">👥 Team Info</h2>
      <div><strong>Name:</strong> ${team.name}</div>
      <div><strong>Location:</strong> ${team.location || 'N/A'}</div>
      <div><strong>Created By:</strong> ${team.created_by}</div>
    </div>
  `;
}
