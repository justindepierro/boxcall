// src/pages/team/create.js

import { getCurrentUser } from '@state/userState.js';
import { createTeam } from '@lib/teams/createTeams.js'; // You’ll build this next
import { updateUserSettings } from '@lib/teams/user/updateUserSettings.js';
import { navigateTo } from '@routes/router.js';

export default function renderCreateTeamPage() {
  const root = document.getElementById('main-content');
  if (!root) return;

  root.innerHTML = `
    <section class="p-6 max-w-xl mx-auto text-white">
      <h1 class="text-2xl font-bold mb-4">Create a New Team</h1>
      <form id="create-team-form" class="space-y-4">
        <div>
          <label class="block mb-1 text-sm font-medium">Team Name</label>
          <input type="text" id="team-name" class="w-full px-3 py-2 text-black rounded" required />
        </div>
        <button type="submit" class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded">🚀 Create Team</button>
      </form>
      <div id="create-team-error" class="text-red-400 mt-2"></div>
    </section>
  `;

  const form = document.getElementById('create-team-form');
  const errorDiv = document.getElementById('create-team-error');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const teamName = document.getElementById('team-name').value.trim();
    const user = getCurrentUser();

    if (!teamName || !user) return;

    try {
      // 1. Create team
      const teamId = await createTeam(teamName, user.id);

      // 2. Update user_settings
      await updateUserSettings(user.id, {
        team_id: teamId,
        role: 'head_coach',
      });

      // 3. Redirect
      navigateTo('team');
    } catch (err) {
      console.error('❌ Error creating team:', err);
      errorDiv.textContent = 'Something went wrong. Please try again.';
    }
  });
}
