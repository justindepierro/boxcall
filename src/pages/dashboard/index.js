export default function DashboardPage() {
  const el = document.createElement('div');
  el.innerHTML = `
    <h1 class="text-3xl font-bold text-[var(--color-text)]">📊 Dashboard</h1>
    <p class="text-base text-[var(--color-muted)]">Welcome to BoxCall. This is your home screen.</p>
  `;
  return el;
}
