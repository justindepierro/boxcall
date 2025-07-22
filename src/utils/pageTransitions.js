export function fadeIn(element, duration = 300) {
  return new Promise((resolve) => {
    element.style.opacity = 0;
    element.style.transition = `opacity ${duration}ms`;
    requestAnimationFrame(() => {
      element.style.opacity = 1;
    });
    setTimeout(resolve, duration);
  });
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
