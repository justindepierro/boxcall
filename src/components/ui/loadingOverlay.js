/**
 * LoadingOverlay.js
 * A global loading overlay with spinner and optional message.
 */

let overlayEl = null;
let messageEl = null;

/**
 * Creates and appends the overlay to the DOM (only if it doesn't exist yet).
 */
function createOverlay() {
  if (overlayEl) return;

  overlayEl = document.createElement('div');
  overlayEl.id = 'global-loading-overlay';
  overlayEl.className = `
    fixed inset-0 bg-black bg-opacity-40
    flex flex-col items-center justify-center
    opacity-0 pointer-events-none transition-opacity duration-300
    z-50
  `;

  // Spinner
  const spinner = document.createElement('div');
  spinner.className = `
    animate-spin rounded-full h-16 w-16
    border-4 border-white border-t-transparent
  `;
  overlayEl.appendChild(spinner);

  // Message
  messageEl = document.createElement('p');
  messageEl.className = 'mt-4 text-white text-lg font-medium';
  overlayEl.appendChild(messageEl);

  document.body.appendChild(overlayEl);
}

/**
 * Shows the loading overlay with an optional message.
 * @param {string} [message='Loading...'] - Message to display below the spinner.
 */
export function showLoadingOverlay(message = 'Loading...') {
  createOverlay();
  messageEl.textContent = message;

  requestAnimationFrame(() => {
    overlayEl.classList.remove('pointer-events-none', 'opacity-0');
    overlayEl.classList.add('opacity-100');
  });
}

/**
 * Hides the loading overlay.
 */
export function hideLoadingOverlay() {
  if (!overlayEl) return;

  overlayEl.classList.remove('opacity-100');
  overlayEl.classList.add('opacity-0', 'pointer-events-none');

  // Optional: Remove from DOM after transition (refactored with optional chaining)
  setTimeout(() => {
    overlayEl?.parentNode?.removeChild(overlayEl);
    overlayEl = null;
    messageEl = null;
  }, 300);
}
