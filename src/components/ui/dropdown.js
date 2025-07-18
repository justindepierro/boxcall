// components/ui/dropdown.js

/**
 * Creates a dropdown menu component.
 * @param {Object} options
 * @param {string} [options.label='Options'] - The text for the dropdown button.
 * @param {string[]} [options.items=[]] - List of dropdown items.
 * @param {Function} [options.onSelect=()=>{}] - Callback when an item is clicked.
 * @returns {HTMLDivElement} The dropdown wrapper element.
 */
export function createDropdown({ label = 'Options', items = [], onSelect = () => {} }) {
  const wrapper = document.createElement('div');
  wrapper.className = 'relative inline-block text-left';

  wrapper.innerHTML = `
    <button id="dropdown-toggle" class="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring">
      ${label}
      <svg class="ml-2 -mr-1 h-5 w-5 text-gray-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    <div id="dropdown-menu" class="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 hidden z-50">
      <div class="py-1" role="menu" aria-orientation="vertical" tabindex="-1">
        ${items
          .map(
            (item, i) => `
          <button class="dropdown-item block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left" role="menuitem" data-index="${i}">
            ${item}
          </button>`
          )
          .join('')}
      </div>
    </div>
  `;

  const toggle = /** @type {HTMLButtonElement} */ (wrapper.querySelector('#dropdown-toggle'));
  const menu = /** @type {HTMLDivElement} */ (wrapper.querySelector('#dropdown-menu'));
  const itemEls = /** @type {NodeListOf<HTMLButtonElement>} */ (
    wrapper.querySelectorAll('.dropdown-item')
  );

  // Toggle menu
  toggle.addEventListener('click', () => {
    menu.classList.toggle('hidden');
  });

  // Handle item selection
  itemEls.forEach((el) => {
    el.addEventListener('click', (e) => {
      const target = /** @type {HTMLButtonElement} */ (e.currentTarget);
      const index = parseInt(target.dataset.index, 10);
      onSelect(items[index]);
      menu.classList.add('hidden');
    });
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    const target = /** @type {Node} */ (e.target);
    if (!wrapper.contains(target)) {
      menu.classList.add('hidden');
    }
  });

  return wrapper;
}
