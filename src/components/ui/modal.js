import { BaseButton } from '@components/ui/baseButton.js';

/**
 * Modal Component
 * -------------------
 * Creates a styled, accessible modal with an overlay and a close button.
 *
 * @param {Object} [options={}]
 * @param {string} [options.title='Untitled Modal'] - Modal title text
 * @param {HTMLElement|string} [options.content='<div></div>'] - Modal content
 * @param {Function} [options.onClose=()=>{}] - Callback when modal is closed
 * @returns {HTMLDivElement} The modal element
 */
export function Modal(options = {}) {
  const {
    title = 'Untitled Modal',
    content = document.createElement('div'),
    onClose = () => {},
  } = options;

  // === Overlay ===
  const overlay = document.createElement('div');
  overlay.className =
    'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50';

  // === Modal Container ===
  const modal = document.createElement('div');
  modal.className = 'relative bg-white rounded-lg shadow-lg max-w-lg w-full p-5 space-y-4';

  // === Header ===
  const header = document.createElement('div');
  header.className = 'flex justify-between items-center border-b pb-2';

  const titleEl = document.createElement('h3');
  titleEl.className = 'text-lg font-semibold text-gray-800';
  titleEl.textContent = title;

  const closeBtn = BaseButton({
    label: '×',
    variant: 'secondary',
    size: 'sm',
    onClick: () => {
      overlay.remove(); // Remove overlay from DOM
      onClose(); // Trigger onClose callback
    },
  });

  header.append(titleEl, closeBtn);

  // === Content Section ===
  const contentEl =
    typeof content === 'string'
      ? Object.assign(document.createElement('div'), { innerHTML: content })
      : content;

  modal.append(header, contentEl);
  overlay.appendChild(modal);

  return overlay; // DO NOT append to document.body here
}
