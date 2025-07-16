// src/utils/renderLayoutPage.js

/**
 * Wraps and mounts a given component inside #page-content.
 * Used to inject individual page UIs inside the standard app shell.
 *
 * @param {Function} component - A function that returns an HTMLElement
 * @param {Object} [props={}] - Optional props to pass to the component
 */
export function renderLayoutPage(component, props = {}) {
  const contentZone = document.getElementById('page-content');

  if (!contentZone) {
    console.error('❌ renderLayoutPage(): Missing #page-content');
    return;
  }

  contentZone.innerHTML = ''; // Clear previous page
  const element = component(props);

  if (!(element instanceof HTMLElement)) {
    console.error('❌ renderLayoutPage(): Component must return an HTMLElement');
    return;
  }

  contentZone.appendChild(element);
}
