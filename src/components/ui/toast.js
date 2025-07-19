import { BaseButton } from '@components/ui/baseButton.js';

/**
 * Creates a styled toast notification element.
 * @param {string} message - The message to display.
 * @param {'info' | 'success' | 'error'} type - Type of toast.
 * @param {Function} [onClose] - Optional callback when the toast is closed.
 * @returns {HTMLDivElement} Toast element.
 */
export function Toast(message, type = 'info', onClose = () => {}) {
  const color =
    {
      info: 'bg-blue-500',
      success: 'bg-green-600',
      error: 'bg-red-600',
    }[type] || 'bg-gray-700';

  // Toast container
  const toast = document.createElement('div');
  toast.className = `
    flex items-center justify-between space-x-2
    ${color} text-white px-4 py-2 rounded shadow
    transition-opacity duration-300 opacity-0
  `.trim();

  // Message
  const msgEl = document.createElement('span');
  msgEl.className = 'text-sm font-medium';
  msgEl.textContent = message;

  // Close Button
  const closeBtn = BaseButton({
    label: '×',
    variant: 'secondary',
    size: 'sm',
    onClick: () => {
      toast.remove();
      onClose();
    },
  });

  toast.append(msgEl, closeBtn);
  return toast;
}
