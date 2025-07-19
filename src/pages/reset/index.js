// src/pages/reset/index.js
import { supabase } from '@auth/supabaseClient.js';
import { showToast } from '@utils/toast.js';
import { initAuthState } from '@state/userState.js';
import { navigateTo } from '@routes/router.js';
import { qsInput } from '@utils/domHelper.js';
import { validatePassword, resetErrors, handleAuthSubmit } from '@utils/authForms.js';
import { createAuthPage } from '@components/AuthFormPage.js';

export default function renderResetPage(container) {
  const params = new URLSearchParams(window.location.hash.split('?')[1]);
  if (params.get('type') !== 'recovery') {
    container.innerHTML = `<p class="text-red-500 text-center">Invalid or expired reset link.</p>`;
    return;
  }

  container.innerHTML = '';
  container.appendChild(
    createAuthPage({
      title: 'Reset Password',
      fields: [
        { id: 'new-password', label: 'New Password', type: 'password' },
        { id: 'confirm-password', label: 'Confirm Password', type: 'password' },
      ],
      button: { label: 'Update Password', variant: 'success', fullWidth: true },
      onSubmit: handleResetSubmit,
      errorId: 'reset-message',
    })
  );

  qsInput('#new-password')?.focus();
}

async function handleResetSubmit(e, form, resetBtn, msgEl) {
  e.preventDefault();
  if (!(form instanceof HTMLFormElement) || !(resetBtn instanceof HTMLButtonElement)) return;

  const newPassword = qsInput('#new-password', form).value;
  const confirmPassword = qsInput('#confirm-password', form).value;
  resetErrors(form);

  await handleAuthSubmit(
    form,
    resetBtn,
    async () => {
      const { valid, errors } = validatePassword(newPassword);
      if (!valid) throw new Error(errors.join(', '));
      if (newPassword !== confirmPassword) throw new Error('Passwords do not match');
      return supabase.auth.updateUser({ password: newPassword });
    },
    {
      loadingText: 'Updating...',
      withOverlay: true,
      overlayMessage: 'Updating password...',
      onSuccess: async () => {
        await initAuthState();
        msgEl.textContent = '✅ Password updated! Redirecting...';
        showToast('Password successfully reset.', 'success');
        setTimeout(() => navigateTo('dashboard'), 2500);
      },
      onError: (err) => {
        msgEl.textContent = `⚠️ ${err.message}`;
        showToast(`❌ Reset failed: ${err.message}`, 'error');
      },
    }
  );
}
