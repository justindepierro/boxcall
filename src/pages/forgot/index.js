// src/pages/forgot/index.js
import { resetPassword } from '@auth/auth.js';
import { authCard } from '@components/AuthCard.js';
import { showToast } from '@utils/toast.js';
import { qsInputSafe } from '@utils/domHelper.js';
import { BaseButton } from '@components/ui/baseButton.js';
import { createTextInput } from '@components/dev/devUI.js';
import { resetAppToPublic } from '@render/appReset.js';
import { resetErrors, handleAuthSubmit } from '@utils/authForms.js';
import { showLoadingOverlay, hideLoadingOverlay } from '@components/ui/loadingOverlay.js';

/**
 * Renders the Forgot Password page and handles password reset requests.
 * @param {HTMLElement} container
 */
export default function renderForgotPasswordPage(container) {
  container.innerHTML = '';
  container.appendChild(ForgotComponent());

  // Auto-focus email field
  const emailField = container.querySelector('#forgot-email');
  if (emailField instanceof HTMLInputElement) emailField.focus();
}

/**
 * Builds the Forgot Password component.
 * @returns {HTMLDivElement}
 */
function ForgotComponent() {
  const wrapper = document.createElement('div');
  const form = document.createElement('form');
  form.id = 'forgot-form';
  form.className = 'space-y-4';

  // Email input
  form.appendChild(createTextInput('forgot-email', 'Your email'));

  // Submit button
  const forgotBtn = BaseButton({
    label: 'Send Reset Link',
    variant: 'warning',
    size: 'md',
    fullWidth: true,
    onClick: () => form.requestSubmit(),
  });
  forgotBtn.id = 'forgot-btn';
  form.appendChild(forgotBtn);

  // Feedback message
  const errorEl = document.createElement('p');
  errorEl.id = 'forgot-error';
  errorEl.className = 'text-red-500 text-sm mt-2 error-message';
  form.appendChild(errorEl);

  wrapper.appendChild(authCard('Forgot Password', form));

  // Attach submit handler
  form.addEventListener('submit', (e) => handleForgotSubmit(e, form, forgotBtn));
  return wrapper;
}

/**
 * Handles Forgot Password form submission.
 */
async function handleForgotSubmit(e, form, forgotBtn) {
  e.preventDefault();
  if (!(form instanceof HTMLFormElement) || !(forgotBtn instanceof HTMLButtonElement)) return;

  const emailField = qsInputSafe('#forgot-email', form);
  const errorEl = form.querySelector('#forgot-error');
  resetErrors(form);

  showLoadingOverlay('Sending reset link...');

  await handleAuthSubmit(form, forgotBtn, () => resetPassword(emailField.value.trim()), {
    loadingText: 'Sending...',
    onSuccess: () => {
      showToast('📬 Reset link sent. Check your inbox.', 'success');
      if (errorEl) errorEl.textContent = '✅ Email sent successfully.';
      setTimeout(() => resetAppToPublic('login'), 2500);
    },
    onError: (err) => {
      const msg = err?.message || 'Unknown error occurred';
      showToast(`❌ ${msg}`, 'error');
      if (errorEl) errorEl.textContent = `⚠️ ${msg}`;
    },
  });

  hideLoadingOverlay();
}
