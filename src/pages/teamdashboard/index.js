/**
 * Team Dashboard Component
 */
function TeamDashboardComponent() {
  const wrapper = document.createElement('div');
  wrapper.className = 'font-body text-[var(--color-text)]';

  wrapper.innerHTML = `
    <h1 class="text-3xl font-header mb-4 text-[var(--color-accent)]">Team Dashboard</h1>
    <p>Welcome to your team’s control center. More features coming soon!</p>
  `;

  return wrapper;
}

/**
 * Render Team Dashboard Page
 * @param {HTMLElement} container - The DOM container where the page will be rendered
 */
export default function renderTeamDashboard(container) {
  container.innerHTML = ''; // Clear old content
  container.appendChild(TeamDashboardComponent());
}
