// src/utils/dropDownInteractions.js

/**
 * Closes all dropdown menus by hiding them and resetting `aria-expanded`.
 */
function closeAllDropdowns() {
  const allMenus = document.querySelectorAll('[data-dropdown-menu]');
  allMenus.forEach((menu) => {
    if (menu instanceof HTMLElement) {
      menu.classList.add('hidden');
      const parentDropdown = menu.closest('[data-dropdown]');
      if (parentDropdown instanceof HTMLElement) {
        const toggle = parentDropdown.querySelector('[data-dropdown-toggle]');
        if (toggle instanceof HTMLElement) {
          toggle.setAttribute('aria-expanded', 'false');
        }
      }
    }
  });
}

/**
 * Handles clicks outside any dropdown to close all open menus.
 * @param {MouseEvent} event
 */
function handleDocumentClick(event) {
  const target = event.target;
  if (!(target instanceof Node)) return;

  const clickedInside = target instanceof HTMLElement && target.closest('[data-dropdown]');
  if (!clickedInside) {
    closeAllDropdowns();
  }
}

/**
 * Handles keyboard navigation for dropdown menu items.
 * @param {KeyboardEvent} event
 * @param {HTMLElement[]} items
 */
function handleMenuKeydown(event, items) {
  if (!(event instanceof KeyboardEvent)) return;

  const { key } = event;
  const activeElement =
    document.activeElement instanceof HTMLElement ? document.activeElement : null;

  // Safely find the current index
  const currentIndex = activeElement ? items.indexOf(activeElement) : -1;

  if (key === 'ArrowDown') {
    event.preventDefault();
    const nextItem = items[(currentIndex + 1) % items.length];
    if (nextItem) nextItem.focus();
  } else if (key === 'ArrowUp') {
    event.preventDefault();
    const prevItem = items[(currentIndex - 1 + items.length) % items.length];
    if (prevItem) prevItem.focus();
  } else if (key === 'Escape') {
    closeAllDropdowns();
  }
}

/**
 * Initializes a single dropdown.
 * @param {HTMLElement} dropdown
 */
function initializeDropdown(dropdown) {
  const toggle = dropdown.querySelector('[data-dropdown-toggle]');
  const menu = dropdown.querySelector('[data-dropdown-menu]');
  if (!(toggle instanceof HTMLElement) || !(menu instanceof HTMLElement)) return;

  const menuItems = Array.from(menu.querySelectorAll('[role="menuitem"]')).filter(
    (el) => el instanceof HTMLElement
  );

  // Toggle button click
  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = !menu.classList.contains('hidden');
    closeAllDropdowns();
    if (!isOpen) {
      menu.classList.remove('hidden');
      toggle.setAttribute('aria-expanded', 'true');
      if (menuItems[0]) menuItems[0].focus();
    }
  });

  // Keyboard navigation
  menuItems.forEach((item) => {
    item.addEventListener('keydown', (e) => handleMenuKeydown(e, menuItems));
  });
}

/**
 * Initializes all dropdown menus on the page.
 */
export function initDropdowns() {
  const dropdowns = document.querySelectorAll('[data-dropdown]');
  dropdowns.forEach((dropdown) => {
    if (dropdown instanceof HTMLElement) {
      initializeDropdown(dropdown);
    }
  });

  // Attach global click handler
  document.addEventListener('click', handleDocumentClick);
}

/**
 * Auto-initialize when DOM is ready.
 */
document.addEventListener('DOMContentLoaded', initDropdowns);
