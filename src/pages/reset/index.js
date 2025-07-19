// src/pages/reset/index.js
import { supabase } from '@auth/supabaseClient.js';
import { authCard } from '@components/AuthCard.js';
import { showToast } from '@utils/toast.js';
import { initAuthState } from '@state/userState.js';
import { navigateTo } from '@routes/router.js';
import { qsInputSafe } from '@utils/domHelper.js';
import { BaseButton } from '@components/ui/baseButton.js';
import { createTextInput } from '@components/dev/devUI.js';
import { resetErrors, validatePassword, handleAuthSubmit } from '@utils/authForms.js';
import { showLoadingOverlay, hideLoadingOverlay } from '@components/ui/loadingOverlay.js';

/**
 * Renders the Reset Password page.
 * @param {HTMLElement} container
 */
export default function renderResetPage(container) {
  const hash = window.location.hash;
  const params = new URLSearchParams(hash.split('?')[1]);
  const type = params.get('type');

  // Validate reset link
  if (type !== 'recovery') {
    container.innerHTML = `<p class="text-red-500 text-center">Invalid or expired reset link.</p>`;
    return;
  }

  container.innerHTML = '';
  container.appendChild(ResetComponent());

  // Auto-focus new password field
  const newPasswordField = container.querySelector('#new-password');
  if (newPasswordField instanceof HTMLInputElement) newPasswordField.focus();
}

/**
 * Builds the Reset Password component UI.
 */
function ResetComponent() {
  const wrapper = document.createElement('div');
  const form = document.createElement('form');
  form.id = 'reset-form';
  form.className = 'space-y-4';

  // New password input
  const newPasswordInput = createTextInput('new-password', 'New Password');
  newPasswordInput.type = 'password';
  form.appendChild(newPasswordInput);

  // Confirm password input
  const confirmPasswordInput = createTextInput('confirm-password', 'Confirm Password');
  confirmPasswordInput.type = 'password';
  form.appendChild(confirmPasswordInput);

  // Submit button
  const resetBtn = BaseButton({
    label: 'Update Password',
    variant: 'success',
    size: 'md',
    fullWidth: true,
    onClick: () => form.requestSubmit(),
  });
  resetBtn.id = 'reset-btn';
  form.appendChild(resetBtn);

  // Feedback message
  const msg = document.createElement('p');
  msg.id = 'reset-message';
  msg.className = 'text-sm mt-2 text-blue-500 error-message';
  form.appendChild(msg);

  wrapper.appendChild(
    authCard(
      'Reset Password',
      form,
      'Enter and confirm your new password below. You will be redirected once successful.'
    )
  );

  form.addEventListener('submit', (e) => handleResetSubmit(e, form, resetBtn, msg));
  return wrapper;
}

/**
 * Handles the Reset Password submission.
 */
async function handleResetSubmit(e, form, resetBtn, msg) {
  e.preventDefault();
  if (!(form instanceof HTMLFormElement) || !(resetBtn instanceof HTMLButtonElement)) return;

  const newPassword = qsInputSafe('#new-password', form).value;
  const confirmPassword = qsInputSafe('#confirm-password', form).value;
  resetErrors(form);

  showLoadingOverlay('Updating password...');

  await handleAuthSubmit(
    form,
    resetBtn,
    async () => {
      const { valid, errors } = validatePassword(newPassword);
      if (!valid) {
        msg.textContent = `⚠️ ${errors.join(', ')}`;
        throw new Error(errors.join(', '));
      }
      if (newPassword !== confirmPassword) {
        msg.textContent = '⚠️ Passwords do not match.';
        throw new Error('Passwords do not match');
      }
      return supabase.auth.updateUser({ password: newPassword });
    },
    {
      loadingText: 'Updating...',
      onSuccess: async () => {
        await initAuthState();
        msg.textContent = '✅ Password updated! Redirecting...';
        showToast('Password successfully reset.', 'success');
        setTimeout(() => navigateTo('dashboard'), 2500);
      },
      onError: (err) => {
        const message = err?.message || 'Reset failed.';
        msg.textContent = `⚠️ ${message}`;
        showToast(`❌ ${message}`, 'error');
      },
    }
  );

  hideLoadingOverlay();
}
