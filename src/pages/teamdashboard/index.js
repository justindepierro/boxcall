import { renderPage } from '@core/renderEngine.js';

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
 */
export default function renderTeamDashboard(container) {
  renderPage({
    component: TeamDashboardComponent,
    containerId: container.id,
  });
}
