/**
 * Applies fade-in transition to the container.
 * @param {HTMLElement} container
 */
export function fadeIn(container) {
  if (!(container instanceof HTMLElement)) return;
  container.classList.add('opacity-0', 'transition-opacity', 'duration-300');

  // Trigger fade-in after a single frame
  requestAnimationFrame(() => container.classList.remove('opacity-0'));
}

/**
 * Applies fade-out transition to the container before a route change.
 * @param {HTMLElement} container
 * @param {number} duration
 * @returns {Promise<void>}
 */
export function fadeOut(container, duration = 300) {
  return new Promise((resolve) => {
    if (!(container instanceof HTMLElement)) return resolve();
    container.classList.add('transition-opacity', 'duration-300');
    container.classList.add('opacity-0');

    setTimeout(() => resolve(), duration);
  });
}
