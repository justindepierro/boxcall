// src/pages/signup/index.js
import { signUp } from '@auth/auth.js';
import { showToast } from '@utils/toast.js';
import { qsInput } from '@utils/domHelper.js';
import { evaluatePasswordStrength } from '@utils/passwordStrength';
import { delayedRedirect } from '@utils/navigation';
import { resetErrors, handleAuthSubmit, validatePassword } from '@utils/authForms.js';
import { createAuthPage } from '@components/AuthFormPage.js';
import { createBackToLoginLink } from '@components/ui/backToLogin.js'; // Shared link component

export default function renderSignupPage(container) {
  container.innerHTML = '';

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
      extraElements: [createBackToLoginLink()],
      onSubmit: handleSignupSubmit,
      errorId: 'signup-error',
    })
  );

  qsInput('#signup-email')?.focus();
  attachPasswordStrengthUI();
}

/**
 * Handle sign-up submission.
 */
async function handleSignupSubmit(e, form, signupBtn, errorEl) {
  e.preventDefault();
  if (!(form instanceof HTMLFormElement) || !(signupBtn instanceof HTMLButtonElement)) return;

  const email = qsInput('#signup-email', form).value.trim();
  const password = qsInput('#signup-password', form).value;
  const confirmPassword = qsInput('#signup-confirm', form).value;

  resetErrors(form);

  // Validate password
  const { valid, errors } = validatePassword(password);
  if (!valid) return displayError(errors.join(', '), errorEl);

  if (password !== confirmPassword) return displayError('Passwords do not match.', errorEl);

  await handleAuthSubmit(form, signupBtn, () => signUp(email, password), {
    loadingText: 'Creating...',
    withOverlay: true,
    overlayMessage: 'Creating account...',
    onSuccess: () => {
      showToast('✅ Check your email to confirm your account.', 'success');
      if (errorEl) errorEl.textContent = '📧 Confirmation email sent. Redirecting...';
      delayedRedirect('login', 3500);
    },
    onError: (err) => displayError(err?.message || 'Signup failed.', errorEl),
  });
}

/**
 * Display error both inline and as a toast.
 */
function displayError(message, errorEl) {
  if (errorEl) errorEl.textContent = `⚠️ ${message}`;
  showToast(`❌ ${message}`, 'error');
}

/**
 * Adds a password strength meter under the password input.
 */
function attachPasswordStrengthUI() {
  const passwordField = document.querySelector('#signup-password');
  if (!(passwordField instanceof HTMLInputElement)) return;

  const strengthEl = createStrengthMessage();
  const strengthBar = createStrengthBar();

  passwordField.insertAdjacentElement('afterend', strengthBar);
  passwordField.insertAdjacentElement('afterend', strengthEl);

  const strengthFill = strengthBar.querySelector('div');

  passwordField.addEventListener('input', (e) => {
    if (!(e.target instanceof HTMLInputElement)) return;
    const { text, score } = evaluatePasswordStrength(e.target.value);
    strengthEl.textContent = text;
    strengthFill.style.width = `${Math.min(score * 20, 100)}%`;
    strengthFill.className = getStrengthColor(score);
  });
}

function createStrengthMessage() {
  const el = document.createElement('p');
  el.id = 'password-strength';
  el.className = 'text-xs text-gray-500 mt-1';
  el.textContent = 'Enter a password';
  return el;
}

function createStrengthBar() {
  const bar = document.createElement('div');
  bar.className = 'h-2 w-full bg-gray-200 rounded overflow-hidden mt-1';
  const fill = document.createElement('div');
  fill.className = 'h-full w-0 bg-red-500 transition-all duration-300';
  bar.appendChild(fill);
  return bar;
}

function getStrengthColor(score) {
  return `h-full transition-all duration-300 ${
    score <= 2 ? 'bg-red-500' : score === 3 ? 'bg-yellow-500' : 'bg-green-500'
  }`;
}
