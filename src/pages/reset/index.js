// src/pages/reset/index.js
import { supabase } from '@auth/supabaseClient.js';
import { showToast } from '@utils/toast.js';
import { initAuthState } from '@state/userState.js';
import { navigateTo } from '@routes/router.js';
import { qsInput } from '@utils/domHelper.js';
import { resetErrors, validatePassword, handleAuthSubmit } from '@utils/authForms.js';
import { createAuthPage } from '@components/AuthFormPage.js';
import { createBackToLoginLink } from '@components/ui/backToLogin.js';

export default function renderResetPage(container) {
  const hash = window.location.hash;
  const params = new URLSearchParams(hash.split('?')[1]);
  const type = params.get('type');

  if (type !== 'recovery') {
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
      extraElements: [createBackToLoginLink()],
      onSubmit: (e, form, resetBtn, msg) => handleResetSubmit(e, form, resetBtn, msg),
      errorId: 'reset-message',
    })
  );

  qsInput('#new-password')?.focus();
}

async function handleResetSubmit(e, form, resetBtn, msg) {
  e.preventDefault();
  const newPassword = qsInput('#new-password', form).value;
  const confirmPassword = qsInput('#confirm-password', form).value;

  resetErrors(form);

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
      withOverlay: true,
      onSuccess: async () => {
        await initAuthState();
        msg.textContent = '✅ Password updated! Redirecting...';
        showToast('Password successfully reset.', 'success');
        setTimeout(() => navigateTo('dashboard'), 2500);
      },
      onError: (err) => {
        msg.textContent = `⚠️ ${err.message}`;
        showToast(`❌ Reset failed: ${err.message}`, 'error');
      },
    }
  );
}
