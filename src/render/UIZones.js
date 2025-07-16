// src/render/uiZones.js

/**
 * 🧼 Clears all UI overlay zones: modals, zoom, toast
 */
export function clearAllUIZones() {
  ['modal-root', 'zoom-root', 'toast-root'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = '';
  });
}

/**
 * 🪟 Renders a full-screen modal into #modal-root
 * @param {string} contentHTML - Inner modal HTML content
 */
export function renderModal(contentHTML = '') {
  const root = document.getElementById('modal-root');
  if (!root) {
    console.warn('❌ renderModal(): #modal-root not found');
    return;
  }

  root.innerHTML = `
    <div class="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center">
      <div class="bg-white p-6 rounded shadow-lg max-w-lg w-full text-black">
        ${contentHTML}
      </div>
    </div>
  `;
}

/**
 * 🔍 Shows a zoomed-in image overlay (click to dismiss)
 * @param {string} src - Image URL
 * @param {string} caption - Optional image caption
 */
export function renderZoomImage(src, caption = '') {
  const root = document.getElementById('zoom-root');
  if (!root) {
    console.warn('❌ renderZoomImage(): #zoom-root not found');
    return;
  }

  root.innerHTML = `
    <div
      class="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center"
      onclick="this.innerHTML=''"
    >
      <figure class="max-w-3xl">
        <img src="${src}" alt="Zoomed Image" class="rounded shadow-lg max-h-[80vh] object-contain" />
        ${caption ? `<figcaption class="text-center mt-2 text-white text-sm">${caption}</figcaption>` : ''}
      </figure>
    </div>
  `;
}

/**
 * 🔔 Displays a toast notification
 * @param {string} message - Text to display
 * @param {string} type - One of 'info', 'success', 'error'
 */
export function showToast(message, type = 'info') {
  const root = document.getElementById('toast-root');
  if (!root) {
    console.warn('❌ showToast(): #toast-root not found');
    return;
  }

  const color =
    {
      info: 'bg-blue-500',
      success: 'bg-green-600',
      error: 'bg-red-600',
    }[type] || 'bg-gray-700';

  const toast = document.createElement('div');
  toast.className = `
    ${color} text-white px-4 py-2 rounded shadow transition-opacity duration-300 opacity-0
  `.trim();
  toast.textContent = message;

  root.appendChild(toast);

  // Trigger fade-in
  requestAnimationFrame(() => {
    toast.classList.add('opacity-100');
  });

  // Remove after timeout
  setTimeout(() => {
    toast.classList.remove('opacity-100');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
