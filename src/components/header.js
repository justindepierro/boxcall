/**
 * Header Component
 * ----------------
 * Renders the global app header using theme tokens.
 *
 * @param {Object} [options={}]
 * @param {string} [options.title='BoxCall'] - Title text displayed in the header
 * @param {string} [options.version='v0.1 Beta'] - Version text displayed below the title
 * @param {string} [options.icon='📦'] - Emoji or icon to display next to the title
 * @returns {HTMLElement} The header element
 */
export function Header({ title = 'BoxCall', version = 'v0.1 Beta', icon = '📦' } = {}) {
  const container = document.createElement('header');

  container.className = `
    w-full px-6 py-3 flex items-center justify-between
    border-b font-header
    text-lg md:text-xl
    bg-[var(--color-header)] text-[var(--color-header-text)]
    transition-colors duration-300
    h-16
  `;

  container.innerHTML = `
    <div class="flex items-center gap-3">
      <span class="text-3xl">${icon}</span>
      <h1 class="tracking-tight font-semibold">${title}</h1>
    </div>

    <div class="text-sm font-body text-right hidden sm:block">
      <div>Powered by Coaches</div>
      <div class="text-xs opacity-80">${version}</div>
    </div>
  `;

  return container;
}
