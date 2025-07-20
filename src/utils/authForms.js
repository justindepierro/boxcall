import { hideLoadingOverlay, showLoadingOverlay } from '@components/ui/loadingOverlay.js';

import { showToast } from './toast';

/**
 * Disables or enables all inputs and buttons within a form.
 */
export function disableForm(form, state = true) {
  if (!(form instanceof HTMLFormElement)) return;
  form.querySelectorAll('input, button, select, textarea').forEach((el) => {
    if (
      el instanceof HTMLInputElement ||
      el instanceof HTMLButtonElement ||
      el instanceof HTMLSelectElement ||
      el instanceof HTMLTextAreaElement
    ) {
      el.disabled = state;
    }
  });
}

/**
 * Displays an inline error message within the form.
 */
export function showInlineError(form, selector, message) {
  if (!(form instanceof HTMLFormElement)) return;
  const el = form.querySelector(selector);
  if (el) el.textContent = message;
}

/**
 * Clears all error messages within a form.
 */
export function resetErrors(form) {
  if (!(form instanceof HTMLFormElement)) return;
  form.querySelectorAll('.error-message').forEach((el) => (el.textContent = ''));
}

/**
 * Sets a loading state on a button, storing the original label.
 */
export function setLoadingState(button, label = 'Loading...') {
  if (!(button instanceof HTMLButtonElement)) return;
  button.dataset.originalText = button.textContent || '';
  button.textContent = label;
  button.disabled = true;
}

/**
 * Restores a button’s original label or uses a custom one.
 */
export function resetLoadingState(button, label) {
  if (!(button instanceof HTMLButtonElement)) return;
  button.textContent = label || button.dataset.originalText || 'Submit';
  delete button.dataset.originalText;
  button.disabled = false;
}

/**
 * Validates email format.
 */
export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validates password strength.
 */
/**
 * Validates password strength.
 */
export function validatePassword(password) {
  const errors = [];
  if (password.length < 8) errors.push('Must be at least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('Must contain an uppercase letter');
  if (!/\d/.test(password)) errors.push('Must include a number'); // replaced [0-9] with \d
  if (!/[^A-Za-z0-9]/.test(password)) errors.push('Must include a special symbol');
  return { valid: errors.length === 0, errors };
}

/**
 * Wrapper for standardized form submission with loading state and error handling.
 * @param {HTMLFormElement} form - The form element being submitted.
 * @param {HTMLButtonElement} btn - The button to show loading state.
 * @param {Function} asyncAction - The async function to call (e.g., signIn or signUp).
 * @param {Object} [options] - { loadingText, onSuccess, onError, withOverlay, overlayMessage }
 */
export async function handleAuthSubmit(form, btn, asyncAction, options = {}) {
  if (!(form instanceof HTMLFormElement)) return;
  if (!(btn instanceof HTMLButtonElement)) return;

  const {
    loadingText = 'Loading...',
    onSuccess,
    onError,
    withOverlay = false,
    overlayMessage = '',
  } = options;

  disableForm(form, true);
  setLoadingState(btn, loadingText);

  if (withOverlay) showLoadingOverlay(overlayMessage || loadingText);

  try {
    const result = await asyncAction();
    if (result?.error) throw result.error;

    if (onSuccess) await onSuccess(result);
  } catch (err) {
    const msg = err?.message || String(err) || 'An error occurred.';
    if (onError) {
      onError(err);
    } else {
      showToast(`❌ ${msg}`, 'error');
    }
  } finally {
    disableForm(form, false);
    resetLoadingState(btn);
    if (withOverlay) hideLoadingOverlay();
  }
}
