import { Toast } from '@components/ui/toast.js';
import { devWarn } from '@utils/devLogger.js';

import { Modal } from '../components/ui/modal.js';
/**
 * Clears all UI overlay zones: modals, zoom, toast.
 */
export function clearAllUIZones() {
  ['modal-root', 'zoom-root', 'toast-root'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = '';
  });
}

/**
 * Render a full-screen modal using the Modal component.
 * @param {string} contentHTML - Inner modal HTML content.
 */
export function renderModal(contentHTML = '') {
  const root = document.getElementById('modal-root');
  if (!root) {
    devWarn('❌ renderModal(): #modal-root not found');
    return;
  }

  root.innerHTML = '';
  root.appendChild(Modal({ content: contentHTML })); // Pass as object
}

/**
 * Display a toast notification using the Toast component.
 * @param {string} message - Message text.
 * @param {'info' | 'success' | 'error'} type - Type of toast.
 * @param {number} duration - Auto dismiss delay in ms.
 * @param {Function} [onClose] - Optional callback when toast is dismissed.
 */
export function showToast(message, type = 'info', duration = 3000, onClose = () => {}) {
  const root = document.getElementById('toast-root');
  if (!root) {
    console.warn('❌ showToast(): #toast-root not found');
    return;
  }

  const toast = Toast(message, type, () => {
    removeToast(toast);
    onClose();
  });

  root.appendChild(toast);

  // Trigger fade-in
  requestAnimationFrame(() => {
    toast.classList.add('opacity-100');
  });

  // Remove after timeout
  setTimeout(() => {
    removeToast(toast);
    onClose();
  }, duration);
}

/**
 * Renders a zoomed-in image overlay (click or ESC to dismiss).
 */
export function renderZoomImage(src, caption = '') {
  const root = document.getElementById('zoom-root');
  if (!root) {
    console.warn('❌ renderZoomImage(): #zoom-root not found');
    return;
  }

  root.innerHTML = `
    <div class="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center"
         id="zoom-overlay">
      <figure class="max-w-3xl">
        <img src="${src}" alt="Zoomed Image" class="rounded shadow-lg max-h-[80vh] object-contain" />
        ${caption ? `<figcaption class="text-center mt-2 text-white text-sm">${caption}</figcaption>` : ''}
      </figure>
    </div>
  `;

  // Close on click or ESC
  document.getElementById('zoom-overlay')?.addEventListener('click', () => (root.innerHTML = ''));
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      root.innerHTML = '';
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}

/**
 * Helper to remove a toast with fade-out transition.
 * @param {HTMLDivElement} toast
 */
function removeToast(toast) {
  toast.classList.remove('opacity-100');
  setTimeout(() => toast.remove(), 300);
}
