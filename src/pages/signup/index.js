// src/pages/signup/index.js
import { signUp } from '@auth/auth.js';
import { authCard } from '@components/AuthCard.js';
import { showToast } from '@utils/toast.js';
import { formatError } from '@utils/errors.js';
import { qsInputSafe } from '@utils/domHelper.js';
import { BaseButton } from '@components/ui/baseButton.js';
import { createTextInput } from '@components/dev/devUI.js';
import { evaluatePasswordStrength } from '@utils/passwordStrength';
import { delayedRedirect } from '@utils/navigation';
import { resetErrors, handleAuthSubmit } from '@utils/authForms.js';
import { showLoadingOverlay, hideLoadingOverlay } from '@components/ui/loadingOverlay.js';

/**
 * Renders the signup page.
 * @param {HTMLElement} container
 */
export default function renderSignupPage(container) {
  container.innerHTML = '';
  container.appendChild(SignupComponent());

  // Auto-focus email field
  const emailField = container.querySelector('#signup-email');
  if (emailField instanceof HTMLInputElement) emailField.focus();
}

/**
 * Creates the signup form component.
 * @returns {HTMLDivElement}
 */
function SignupComponent() {
  const wrapper = document.createElement('div');
  const form = document.createElement('form');
  form.id = 'signup-form';
  form.className = 'space-y-4';

  // Email input
  form.appendChild(createTextInput('signup-email', 'Email'));

  // Password input
  const passwordInput = createTextInput('signup-password', 'Password');
  passwordInput.type = 'password';
  form.appendChild(passwordInput);

  // Password strength indicator
  const passwordStrengthEl = document.createElement('p');
  passwordStrengthEl.id = 'password-strength';
  passwordStrengthEl.className = 'text-xs text-gray-500';
  passwordStrengthEl.textContent = 'Enter a password';
  form.appendChild(passwordStrengthEl);

  const passwordStrengthBar = document.createElement('div');
  passwordStrengthBar.className = 'h-2 w-full bg-gray-200 rounded overflow-hidden';

  const passwordStrengthFill = document.createElement('div');
  passwordStrengthFill.className = 'h-full w-0 bg-red-500 transition-all duration-300';
  passwordStrengthBar.appendChild(passwordStrengthFill);
  form.appendChild(passwordStrengthBar);

  const passwordSuggestion = document.createElement('p');
  passwordSuggestion.id = 'password-suggestion';
  passwordSuggestion.className = 'text-xs text-gray-400 italic';
  form.appendChild(passwordSuggestion);

  // Submit button
  const signupBtn = BaseButton({
    label: 'Create Account',
    variant: 'primary',
    size: 'md',
    fullWidth: true,
    onClick: () => form.requestSubmit(),
  });
  signupBtn.id = 'signup-btn';
  form.appendChild(signupBtn);

  // Error message
  const errorEl = document.createElement('p');
  errorEl.id = 'signup-error';
  errorEl.className = 'text-red-500 text-sm mt-2 error-message';
  form.appendChild(errorEl);

  wrapper.appendChild(authCard('Sign Up', form));

  // Password strength listener
  passwordInput.addEventListener('input', (e) => {
    if (!(e.target instanceof HTMLInputElement)) return;
    const value = e.target.value;
    const strength = evaluatePasswordStrength(value);
    passwordStrengthEl.textContent = strength.text;
    passwordStrengthFill.style.width = `${Math.min(strength.score * 20, 100)}%`;
    passwordSuggestion.textContent = getPasswordSuggestions(value, strength.score);
  });

  form.addEventListener('submit', (e) => handleSignupSubmit(e, form, signupBtn));
  return wrapper;
}

/**
 * Suggests password improvements.
 */
function getPasswordSuggestions(password, score) {
  if (!password) return '';
  const tips = [];
  if (password.length < 8) tips.push('Use at least 8 characters');
  if (!/[A-Z]/.test(password)) tips.push('Add an uppercase letter');
  if (!/[0-9]/.test(password)) tips.push('Add a number');
  if (!/[^A-Za-z0-9]/.test(password)) tips.push('Include a special symbol');
  return score < 4 ? `Tips: ${tips.join(', ')}` : 'Great password!';
}

/**
 * Handles signup submission.
 */
async function handleSignupSubmit(e, form, signupBtn) {
  e.preventDefault();
  if (!(form instanceof HTMLFormElement) || !(signupBtn instanceof HTMLButtonElement)) return;

  const email = qsInputSafe('#signup-email', form).value.trim();
  const password = qsInputSafe('#signup-password', form).value;
  const errorEl = form.querySelector('#signup-error');

  resetErrors(form);
  showLoadingOverlay('Creating account...');

  await handleAuthSubmit(form, signupBtn, () => signUp(email, password), {
    loadingText: 'Creating...',
    onSuccess: () => {
      showToast('✅ Check your email to confirm your account.', 'success');
      if (errorEl) errorEl.textContent = '📧 Confirmation email sent. Redirecting...';
      delayedRedirect('login', 3500);
    },
    onError: (err) => {
      const msg = formatError(err);
      showToast(`❌ ${msg}`, 'error');
      if (errorEl) errorEl.textContent = `⚠️ ${msg}`;
    },
  });

  hideLoadingOverlay();
}
