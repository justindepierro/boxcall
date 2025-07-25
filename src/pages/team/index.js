import { getCurrentUser } from '@state/userState.js';
import { getUserSettings } from '@lib/teams/user/getUserSettings.js';
import { devError, devWarn } from '@utils/devLogger.js';

import renderJoinOnlyTeamPage from './joinTeam.js';
import renderJoinOrCreateTeamPage from './joinOrCreate.js';
import renderCreateTeamPage from './create.js';
import renderTeamInfoPage from './teamInfo.js';
import renderTeamSettingsPage from './teamSettings.js';

/**
 * Main router/controller for /team route
 * @param {HTMLElement} [container=document.getElementById('main-content')]
 */
export default async function renderTeamPage(container = document.getElementById('main-content')) {
  if (!(container instanceof HTMLElement)) {
    devError('❌ renderTeamPage: Container is not a valid HTMLElement.');
    return;
  }

  const user = getCurrentUser();
  if (!user) {
    devWarn('🚫 Not logged in');
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
