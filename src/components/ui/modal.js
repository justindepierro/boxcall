import { BaseButton } from '@components/ui/baseButton.js';

/**
 * Modal Component
 * ----------------
 * Creates a styled, accessible modal with an overlay and a close button.
 *
 * @param {Object} options
 * @param {string} options.title - Modal title
 * @param {HTMLElement} options.content - Content inside modal
 * @param {Function} [options.onClose] - Callback when modal closes
 * @returns {HTMLDivElement} The modal overlay element
 */
export function Modal({ title, content, onClose } = {}) {
  // Overlay
  const overlay = document.createElement('div');
  overlay.className =
    'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50';

  // Modal container
  const modal = document.createElement('div');
  modal.className = 'relative bg-white rounded-lg shadow-lg max-w-lg w-full p-5 space-y-4';

  // Header
  const header = document.createElement('div');
  header.className = 'flex justify-between items-center';

  const titleEl = document.createElement('h2');
  titleEl.className = 'text-lg font-bold text-gray-800';
  titleEl.textContent = title;

  // Close button using BaseButton (iconOnly)
  const closeBtn = BaseButton({
    icon: 'x',
    iconOnly: true,
    ariaLabel: 'Close modal',
    variant: 'outline',
    onClick: () => {
      overlay.remove();
      if (onClose) onClose();
    },
  });

  header.append(titleEl, closeBtn);

  // Append all parts
  modal.append(header, content);
  overlay.appendChild(modal);

  // Add to DOM
  document.body.appendChild(overlay);

  return overlay;
}
