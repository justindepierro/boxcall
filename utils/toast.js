// src/utils/toast.js

let toastContainer;

export function showToast(message, type = 'info', duration = 4000) {
  if (!toastContainer) createToastContainer();

  const toast = document.createElement('div');
  toast.className = `toast ${getToastStyle(type)} shadow-md p-4 rounded-md mb-2 text-sm transition-transform duration-300 transform`;
  toast.textContent = message;

  toastContainer.appendChild(toast);

  // Auto-remove after timeout
  setTimeout(() => {
    toast.classList.add('opacity-0', '-translate-y-4');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

function createToastContainer() {
  toastContainer = document.createElement('div');
  toastContainer.id = 'toast-container';
  toastContainer.className = 'fixed top-4 right-4 z-[9999] flex flex-col items-end space-y-2';
  document.body.appendChild(toastContainer);
}

function getToastStyle(type) {
  switch (type) {
    case 'success':
      return 'bg-green-600 text-white';
    case 'error':
      return 'bg-red-600 text-white';
    case 'warning':
      return 'bg-yellow-500 text-white';
    case 'info':
    default:
      return 'bg-blue-600 text-white';
  }
}
