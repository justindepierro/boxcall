export function showSpinner() {
  const spinner = document.getElementById('route-spinner');
  if (spinner) spinner.classList.remove('hidden');
}

export function hideSpinner() {
  const spinner = document.getElementById('route-spinner');
  if (spinner) spinner.classList.add('hidden');
}
