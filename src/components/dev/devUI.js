export function createCheckbox(id, label, checked = false, onChange = () => {}) {
  const wrapper = document.createElement('label');
  wrapper.className = 'flex items-center gap-2 text-xs';

  const box = document.createElement('input');
  box.type = 'checkbox';
  box.id = id;
  box.checked = checked;
  box.className = 'form-checkbox';

  box.addEventListener('change', () => onChange(box.checked));

  const text = document.createElement('span');
  text.textContent = label;

  wrapper.appendChild(box);
  wrapper.appendChild(text);

  return wrapper;
}

export function createButton(label, onClick, className = '') {
  const btn = document.createElement('button');
  btn.textContent = label;
  btn.className = `px-2 py-1 rounded text-xs ${className}`;
  btn.addEventListener('click', onClick);
  return btn;
}

export function createTextInput(id, placeholder = '', onInput = () => {}) {
  const input = document.createElement('input');
  input.type = 'text';
  input.id = id;
  input.placeholder = placeholder;
  input.className = 'text-black text-xs p-1 rounded w-full';

  input.addEventListener('input', () => onInput(input.value));
  return input;
}
