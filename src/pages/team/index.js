import { getCurrentUser } from '@state/authState.js';
import { getUserSettings } from '@lib/teams/user/getUserSettings.js';

import renderJoinOnlyTeamPage from './joinTeam.js';
import renderJoinOrCreateTeamPage from './joinOrCreate.js';
import renderCreateTeamPage from './create.js';
import renderTeamInfoPage from './teaminfo.js';
import renderTeamSettingsPage from './teamSettings.js';

/**
 * Main router/controller for /team route
 */
export default async function renderTeamPage(container) {
  const user = getCurrentUser();
  if (!user) {
    console.warn('🚫 Not logged in');
    return;
  }

  const settings = await getUserSettings(user.id);
  const { account_type, role, team_id } = settings || {};

  const hash = location.hash;

  // 🔹 Route override for creating a team: #/team/create
  if (hash.includes('team/create')) {
    if (account_type === 'coach' && !team_id) {
      renderCreateTeamPage(container);
    } else {
      container.innerHTML = `<p class="p-4 text-red-500">🚫 You’re not allowed to create a team.</p>`;
    }
    return;
  }

  // 🔹 User does NOT belong to a team
  if (!team_id) {
    if (account_type === 'coach') {
      renderJoinOrCreateTeamPage(container); // 🧑‍🏫 Coach can join or create
    } else {
      renderJoinOnlyTeamPage(container); // 👤 Regular user can only join
    }
    return;
  }

  // 🔹 User has a team — render general info
  renderTeamInfoPage(container);

  // 🔹 If Head Coach — also show team management section
  if (role === 'head_coach') {
    renderTeamSettingsPage(container);
  }
}
