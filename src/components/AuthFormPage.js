import { authCard } from '@components/AuthCard.js';
import { BaseButton } from '@components/ui/baseButton.js';
import { createTextInput } from '@components/dev/devUI.js';

/**
 * Creates a reusable authentication form page wrapped in an authCard.
 * @param {Object} config
 * @param {string} config.title - Title of the auth page (e.g., "Login", "Sign Up").
 * @param {Array<{ id: string, label: string, type?: string }>} config.fields - Input fields.
 * @param {Object} config.button - Config for the BaseButton (label, variant, size, etc.).
 * @param {Function} config.onSubmit - Callback for form submission.
 * @param {Array<HTMLElement>} [config.extraElements] - Optional extra elements (e.g., links).
 * @param {string} [config.errorId='auth-error'] - ID for the error message element.
 * @returns {HTMLDivElement} Auth form wrapped in an authCard.
 */
export function createAuthPage({
  title,
  fields,
  button,
  onSubmit,
  extraElements = [],
  errorId = 'auth-error',
}) {
  const wrapper = document.createElement('div');
  const form = document.createElement('form');
  form.className = 'space-y-4';

  // Generate form fields
  fields.forEach(({ id, label, type = 'text' }) => {
    const input = createTextInput(id, label);
    input.type = type;
    form.appendChild(input);
  });

  // Create submit button
  const submitBtn = BaseButton({
    ...button,
    onClick: () => form.requestSubmit(),
  });
  submitBtn.id = button.id || `${title.toLowerCase().replace(/\s+/g, '-')}-btn`;
  form.appendChild(submitBtn);

  // Error message element
  const errorEl = document.createElement('p');
  errorEl.id = errorId;
  errorEl.className = 'text-red-500 text-sm mt-2 error-message';
  form.appendChild(errorEl);

  // Add extra elements (e.g., links)
  extraElements.forEach((el) => form.appendChild(el));

  // Attach submit callback
  form.addEventListener('submit', (e) => onSubmit(e, form, submitBtn, errorEl));

  // Wrap everything in authCard
  wrapper.appendChild(authCard(title, form));
  return wrapper;
}
