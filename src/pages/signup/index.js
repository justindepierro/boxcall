import { signUp } from '@auth/auth.js';
import { showToast } from '@utils/toast.js';
import { qsInput } from '@utils/domHelper.js';
import { evaluatePasswordStrength } from '@utils/passwordStrength';
import { delayedRedirect } from '@utils/navigation';
import { resetErrors, handleAuthSubmit, validatePassword } from '@utils/authForms.js';
import { createAuthPage } from '@components/AuthFormPage.js';

/**
 * Renders the Sign Up page into the container.
 * @param {HTMLElement} container
 */
export default function renderSignupPage(container) {
  container.innerHTML = '';

  // Create the Sign Up form using our shared page builder
  container.appendChild(
    createAuthPage({
      title: 'Sign Up',
      fields: [
        { id: 'signup-email', label: 'Email', type: 'email' },
        { id: 'signup-password', label: 'Password', type: 'password' },
        { id: 'signup-confirm', label: 'Confirm Password', type: 'password' },
      ],
      button: {
        id: 'signup-btn',
        label: 'Create Account',
        variant: 'primary',
        size: 'md',
        fullWidth: true,
      },
      onSubmit: handleSignupSubmit,
      errorId: 'signup-error',
    })
  );

  // Auto-focus email
  qsInput('#signup-email')?.focus();

  // Attach password strength UI
  attachPasswordStrengthUI();
}

/**
 * Handles Sign Up form submission.
 */
async function handleSignupSubmit(e, form, signupBtn, errorEl) {
  e.preventDefault();
  if (!(form instanceof HTMLFormElement) || !(signupBtn instanceof HTMLButtonElement)) return;

  const emailInput = qsInput('#signup-email', form);
  const passwordInput = qsInput('#signup-password', form);
  const confirmInput = qsInput('#signup-confirm', form);

  resetErrors(form);

  // Password validation
  const { valid, errors } = validatePassword(passwordInput.value);
  if (!valid) {
    const msg = errors.join(', ');
    if (errorEl) errorEl.textContent = `⚠️ ${msg}`;
    showToast(`❌ ${msg}`, 'error');
    return;
  }

  if (passwordInput.value !== confirmInput.value) {
    const msg = 'Passwords do not match.';
    if (errorEl) errorEl.textContent = `⚠️ ${msg}`;
    showToast(`❌ ${msg}`, 'error');
    return;
  }

  await handleAuthSubmit(
    form,
    signupBtn,
    () => signUp(emailInput.value.trim(), passwordInput.value),
    {
      loadingText: 'Creating...',
      withOverlay: true,
      overlayMessage: 'Creating account...',
      onSuccess: () => {
        showToast('✅ Check your email to confirm your account.', 'success');
        if (errorEl) errorEl.textContent = '📧 Confirmation email sent. Redirecting...';
        delayedRedirect('login', 3500);
      },
      onError: (err) => {
        const msg = err?.message || 'Signup failed.';
        showToast(`❌ ${msg}`, 'error');
        if (errorEl) errorEl.textContent = `⚠️ ${msg}`;
      },
    }
  );
}

/**
 * Adds a password strength meter under the password input field.
 */
function attachPasswordStrengthUI() {
  const passwordField = document.querySelector('#signup-password');
  if (!(passwordField instanceof HTMLInputElement)) return;

  // Create strength elements
  const strengthEl = document.createElement('p');
  strengthEl.id = 'password-strength';
  strengthEl.className = 'text-xs text-gray-500 mt-1';
  strengthEl.textContent = 'Enter a password';

  const strengthBar = document.createElement('div');
  strengthBar.className = 'h-2 w-full bg-gray-200 rounded overflow-hidden mt-1';
  const strengthFill = document.createElement('div');
  strengthFill.className = 'h-full w-0 bg-red-500 transition-all duration-300';
  strengthBar.appendChild(strengthFill);

  passwordField.insertAdjacentElement('afterend', strengthBar);
  passwordField.insertAdjacentElement('afterend', strengthEl);

  // Update strength on input
  passwordField.addEventListener('input', (e) => {
    if (!(e.target instanceof HTMLInputElement)) return;
    const { text, score } = evaluatePasswordStrength(e.target.value);
    strengthEl.textContent = text;
    strengthFill.style.width = `${Math.min(score * 20, 100)}%`;

    // Color changes based on strength
    strengthFill.className = `h-full transition-all duration-300 ${
      score <= 2 ? 'bg-red-500' : score === 3 ? 'bg-yellow-500' : 'bg-green-500'
    }`;
  });
}
