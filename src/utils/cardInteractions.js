// src/utils/cardInteractions.js

/**
 * Initializes collapse behavior for all cards with `data-collapsible="true"`.
 */
export function initCollapsibleCards() {
  const cards = document.querySelectorAll('[data-collapsible="true"]');
  cards.forEach((card) => {
    const toggleBtn = card.querySelector('.collapse-btn');
    const content = card.querySelector('.card-content');

    if (!toggleBtn || !content) return;

    toggleBtn.addEventListener('click', () => {
      content.classList.toggle('hidden');
      toggleBtn.textContent = content.classList.contains('hidden') ? 'Expand' : 'Collapse';
    });
  });
}
