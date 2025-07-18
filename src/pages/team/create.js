// src/pages/team/create.js
import { getCurrentUser } from '@state/userState.js';
import { createTeam } from '@lib/teams/createTeams.js';
import { updateUserSettings } from '@lib/teams/user/updateUserSettings.js';
import { navigateTo } from '@routes/router.js';

/**
 * Renders the Create Team page and handles team creation.
 * @param {HTMLElement} [container=document.getElementById('main-content')] - Container to render the page into.
 */
export default function renderCreateTeamPage(container = document.getElementById('main-content')) {
  if (!container) {
    console.error('❌ renderCreateTeamPage: No container found.');
    return;
  }

  // Render the form
  container.innerHTML = `
    <section class="p-6 max-w-xl mx-auto text-white">
      <h1 class="text-2xl font-bold mb-4">Create a New Team</h1>
      <form id="create-team-form" class="space-y-4">
        <div>
          <label for="team-name" class="block mb-1 text-sm font-medium">Team Name</label>
          <input 
            type="text" 
            id="team-name" 
            class="w-full px-3 py-2 text-black rounded" 
            required 
          />
        </div>
        <button 
          type="submit" 
          class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
        >
          🚀 Create Team
        </button>
      </form>
      <div id="create-team-error" class="text-red-400 mt-2"></div>
    </section>
  `;

  /** @type {HTMLFormElement | null} */
  const form = container.querySelector('#create-team-form');
  /** @type {HTMLDivElement | null} */
  const errorDiv = container.querySelector('#create-team-error');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    /** @type {HTMLInputElement | null} */
    const teamNameInput = container.querySelector('#team-name');
    const teamName = teamNameInput?.value.trim();
    const user = getCurrentUser();

    if (!teamName || !user) return;

    try {
      const teamId = await createTeam(teamName, user.id);

      await updateUserSettings(user.id, {
        team_id: teamId,
        role: 'head_coach',
      });

      navigateTo('team');
    } catch (err) {
      console.error('❌ Error creating team:', err);
      if (errorDiv) errorDiv.textContent = 'Something went wrong. Please try again.';
    }
  });
}
