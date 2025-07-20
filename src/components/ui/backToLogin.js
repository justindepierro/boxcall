// src/components/ui/backToLogin.js
export function createBackToLoginLink() {
  const link = document.createElement('a');
  link.href = '#/login';
  link.className = 'text-sm text-blue-500 hover:underline block mt-2';
  link.textContent = 'Back to Login';
  return link;
}
