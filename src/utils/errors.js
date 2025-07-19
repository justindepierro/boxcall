// utils/errors.js
export function formatError(error) {
  if (!error || !error.message) return 'Unknown error';
  if (error.message.includes('invalid login')) return 'Incorrect email or password.';
  return error.message;
}
