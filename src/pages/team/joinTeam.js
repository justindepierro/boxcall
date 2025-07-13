// src/pages/team/joinTeam.js

import { supabase } from '@auth/supabaseClient.js';
import { getCurrentUser } from '@state/authState.js';
import { navigateTo } from '@routes/router.js';
import { showToast } from '@utils/toast.js';
import { showSpinner, hideSpinner } from '@utils/spinner.js';

export default function renderJoinOnlyTeamPage() {
  const container = document.getElementById('page-view');
  container.innerHTML = `
    <h2>Join a Team</h2>
    <form id="join-team-form">
      <input type="text" id="team-id" placeholder="Enter Team ID" required />
      <button type="submit">Join</button>
    </form>
  `;

  const form = document.getElementById('join-team-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const teamId = document.getElementById('team-id').value.trim();
    if (!teamId) return;

    await handleJoinTeam(teamId);
  });
}

async function handleJoinTeam(teamId) {
  showSpinner();

  const user = getCurrentUser();

  const { error } = await supabase
    .from('team_members')
    .insert({ user_id: user.id, team_id: teamId, role: 'player' });

  hideSpinner();

  if (error) {
    showToast('❌ Failed to join team');
    console.error(error);
  } else {
    showToast('✅ Joined team!');
    navigateTo('team'); // ✅ Auto-navigate to team info
  }
}
