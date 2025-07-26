/**
 * Enhanced Loading/Spinner System
 * Provides multiple types of loading indicators with proper Tailwind styling
 */

/**
 * Shows a global page loading spinner
 */
export function showSpinner() {
  const spinner = document.getElementById('route-spinner');
  if (spinner) spinner.classList.remove('hidden');
}

/**
 * Hides the global page loading spinner
 */
export function hideSpinner() {
  const spinner = document.getElementById('route-spinner');
  if (spinner) spinner.classList.add('hidden');
}

/**
 * Creates a loading overlay for a specific element
 * @param {HTMLElement} element - Target element to overlay
 * @param {string} [message='Loading...'] - Loading message
 * @returns {HTMLElement} Overlay element for manual removal
 */
export function createLoadingOverlay(element, message = 'Loading...') {
  const overlay = document.createElement('div');
  overlay.className = [
    'absolute inset-0 bg-white/80 backdrop-blur-sm',
    'flex items-center justify-center',
    'z-50 rounded-md',
  ].join(' ');

  const content = document.createElement('div');
  content.className = 'flex flex-col items-center space-y-3';

  // Spinner
  const spinner = document.createElement('div');
  spinner.className = [
    'animate-spin rounded-full h-8 w-8 border-b-2',
    'border-[var(--color-accent)]',
  ].join(' ');

  // Message
  const messageEl = document.createElement('p');
  messageEl.className = 'text-sm text-[var(--color-text-muted)]';
  messageEl.textContent = message;

  content.appendChild(spinner);
  content.appendChild(messageEl);
  overlay.appendChild(content);

  // Ensure parent is positioned
  if (getComputedStyle(element).position === 'static') {
    element.style.position = 'relative';
  }

  element.appendChild(overlay);
  return overlay;
}

/**
 * Removes loading overlay from element
 * @param {HTMLElement} element - Element with overlay
 */
export function removeLoadingOverlay(element) {
  const overlay = element.querySelector('.absolute.inset-0.bg-white\\/80');
  if (overlay) {
    overlay.remove();
  }
}

/**
 * Creates an inline loading indicator
 * @param {string} [size='md'] - Size: sm, md, lg
 * @param {string} [message=''] - Optional loading message
 * @returns {HTMLElement} Inline loading element
 */
export function createInlineLoader(size = 'md', message = '') {
  const sizeMap = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const wrapper = document.createElement('div');
  wrapper.className = 'inline-flex items-center space-x-2';

  const spinner = document.createElement('div');
  spinner.className = [
    'animate-spin rounded-full border-b-2',
    'border-[var(--color-accent)]',
    sizeMap[size],
  ].join(' ');

  wrapper.appendChild(spinner);

  if (message) {
    const messageEl = document.createElement('span');
    messageEl.className = 'text-sm text-[var(--color-text-muted)]';
    messageEl.textContent = message;
    wrapper.appendChild(messageEl);
  }

  return wrapper;
}

/**
 * Shows loading state on a button
 * @param {HTMLButtonElement} button - Target button
 * @param {string} [loadingText='Loading...'] - Text to show while loading
 * @returns {Function} Function to restore original button state
 */
export function setButtonLoading(button, loadingText = 'Loading...') {
  const originalText = button.textContent;
  const originalDisabled = button.disabled;

  button.disabled = true;
  button.innerHTML = '';

  const loader = createInlineLoader('sm', loadingText);
  button.appendChild(loader);

  // Return restore function
  return () => {
    button.disabled = originalDisabled;
    button.innerHTML = '';
    button.textContent = originalText;
  };
}
