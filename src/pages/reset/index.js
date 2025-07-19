// src/pages/reset/index.js
import { supabase } from '@auth/supabaseClient.js';
import { authCard } from '@components/AuthCard.js';
import { showToast } from '@utils/toast.js';
import { initAuthState } from '@state/userState.js';
import { navigateTo } from '@routes/router.js';
import { qsInput, qsButton } from '@utils/domHelper.js';
import { BaseButton } from '@components/ui/baseButton.js';
import { createTextInput } from '@components/dev/devUI.js';

/**
 * Renders the Reset Password page.
 * @param {HTMLElement} container
 */
export default function renderResetPage(container) {
  const hash = window.location.hash;
  const params = new URLSearchParams(hash.split('?')[1]);
  const type = params.get('type');

  // Check if the reset link is valid
  if (type !== 'recovery') {
    container.innerHTML = `<p class="text-red-500">Invalid or expired reset link.</p>`;
    return;
  }

  container.innerHTML = '';
  container.appendChild(ResetComponent());
}

/**
 * Builds the Reset Password component.
 * @returns {HTMLDivElement}
 */
function ResetComponent() {
  const wrapper = document.createElement('div');

  // Create form
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
    variant: 'success', // Define green style in BaseButton
    size: 'md',
    fullWidth: true,
    onClick: () => form.requestSubmit(),
  });
  resetBtn.id = 'reset-btn';
  form.appendChild(resetBtn);

  // Message element
  const msg = document.createElement('p');
  msg.id = 'reset-message';
  msg.className = 'text-sm mt-2 text-blue-500';
  form.appendChild(msg);

  // Wrap form in authCard
  wrapper.appendChild(
    authCard(
      'Reset Password',
      form,
      'Enter and confirm your new password below to complete your reset. You’ll be redirected once successful.'
    )
  );

  // Submit event listener
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleResetSubmit(form);
  });

  return wrapper;
}

/**
 * Handles password reset submission.
 * @param {HTMLFormElement} form
 */
async function handleResetSubmit(form) {
  const newPasswordInput = qsInput('#new-password', form);
  const confirmPasswordInput = qsInput('#confirm-password', form);
  const btn = qsButton('#reset-btn', form);
  const msg = form.querySelector('#reset-message');

  const newPassword = newPasswordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  msg.textContent = '';
  btn.disabled = true;
  btn.textContent = 'Updating...';

  // Basic validation
  if (newPassword.length < 6) {
    msg.textContent = '⚠️ Password must be at least 6 characters.';
    resetButton(btn);
    return;
  }
  if (newPassword !== confirmPassword) {
    msg.textContent = '⚠️ Passwords do not match.';
    resetButton(btn);
    return;
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    msg.textContent = `⚠️ ${error.message}`;
    showToast('Reset failed: ' + error.message, 'error');
  } else {
    await initAuthState(); // Load new session
    msg.textContent = '✅ Password updated! Redirecting...';
    showToast('Password successfully reset.', 'success');
    setTimeout(() => navigateTo('dashboard'), 2500);
  }

  resetButton(btn);
}

/**
 * Resets the button state back to default.
 * @param {HTMLButtonElement} btn
 */
function resetButton(btn) {
  btn.disabled = false;
  btn.textContent = 'Update Password';
}
