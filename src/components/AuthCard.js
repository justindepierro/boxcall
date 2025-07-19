// src/lib/authCard.js
/**
 * Renders a styled card UI shell with a title + slot for form content.
 * @param {string} title
 * @param {HTMLElement|string} content - Content can be a string or an element.
 * @param {string} [subtitle] - Optional subtitle
 * @returns {HTMLElement} card element
 */
export function authCard(title = '', content = '', subtitle = '') {
  const card = document.createElement('div');
  card.className = 'max-w-md mx-auto mt-10 p-6 bg-white shadow-lg rounded-xl';

  const heading = document.createElement('h2');
  heading.className = 'text-xl font-bold mb-2';
  heading.textContent = title;
  card.appendChild(heading);

  if (subtitle) {
    const sub = document.createElement('p');
    sub.className = 'text-gray-600 text-sm mb-4';
    sub.textContent = subtitle;
    card.appendChild(sub);
  }

  if (typeof content === 'string') {
    card.insertAdjacentHTML('beforeend', content);
  } else if (content instanceof HTMLElement) {
    card.appendChild(content);
  }

  return card;
}
