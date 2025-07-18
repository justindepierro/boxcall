// src/pages/team/teamSettings.js
export default function renderTeamSettingsPage(
  container = document.getElementById('main-content')
) {
  if (!(container instanceof HTMLElement)) return;

  container.innerHTML = `
    <section class="p-6">
      <h1 class="text-2xl font-bold mb-4">Team Settings (Head Coach)</h1>
      <p>Edit team name, theme, and permissions here.</p>
    </section>
  `;
}
