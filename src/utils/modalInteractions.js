// src/utils/modalInteractions.js

/**
 * Initializes all elements that toggle modals with [data-modal-target].
 */
export function initModals() {
  const modalTriggers = document.querySelectorAll('[data-modal-target]');
  modalTriggers.forEach((trigger) => {
    const targetId = trigger.getAttribute('data-modal-target');
    const modal = document.querySelector(targetId);
    if (!modal) return;

    trigger.addEventListener('click', () => modal.classList.remove('hidden'));

    modal.querySelectorAll('[data-modal-close]').forEach((closeBtn) => {
      closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
    });
  });
}
