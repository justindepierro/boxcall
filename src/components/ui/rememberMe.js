// src/components/ui/RememberMe.js
export function createRememberMe() {
  const wrapper = document.createElement('div');
  wrapper.className = 'flex items-center space-x-2';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = 'remember-me';
  checkbox.className = 'h-4 w-4 text-green-600 border-gray-300 rounded';

  const label = document.createElement('label');
  label.htmlFor = 'remember-me';
  label.textContent = 'Remember me';
  label.className = 'text-sm text-gray-700';

  wrapper.append(checkbox, label);
  return wrapper;
}
