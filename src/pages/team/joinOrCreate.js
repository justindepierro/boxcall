// src/pages/team/joinOrCreate.js

export default function renderJoinOrCreateTeamPage(
  container = document.getElementById('main-content')
) {
  if (!(container instanceof HTMLElement)) return;

  container.innerHTML = `
    <section class="p-6 max-w-xl mx-auto text-white">
      <h1 class="text-2xl font-bold mb-4">You're not on a team yet</h1>
      <p class="mb-6">As a coach, you can either join an existing team or create your own.</p>

      <div class="flex flex-col gap-4">
        <button id="join-team-btn" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">🔗 Join Existing Team</button>
        <button id="create-team-btn" class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded">🆕 Create New Team</button>
      </div>
    </section>
  `;

  document.getElementById('join-team-btn')?.addEventListener('click', () => {
    location.hash = '#/team/join';
  });

  document.getElementById('create-team-btn')?.addEventListener('click', () => {
    location.hash = '#/team/create';
  });
}
