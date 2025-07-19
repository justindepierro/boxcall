/**
 * Evaluates the strength of a password.
 * @param {string} password
 * @returns {{ text: string, class: string, score: number }}
 */
export function evaluatePasswordStrength(password) {
  let score = 0;

  // Basic scoring rules
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  let result = { text: '', class: '', score };

  if (score <= 2) {
    result.text = 'Weak';
    result.class = 'text-red-500';
  } else if (score === 3) {
    result.text = 'Medium';
    result.class = 'text-yellow-500';
  } else {
    result.text = 'Strong';
    result.class = 'text-green-500';
  }

  return result;
}
