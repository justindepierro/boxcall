// src/components/ui/MultiRangeSlider.js

/**
 * Renders a multi-range slider with add/remove/invert capabilities.
 * Designed for football fields (0–100 yards, 50 as midfield).
 *
 * @param {Object} options
 * @param {Array} options.ranges - Array of ranges: [{ start, end, include }]
 * @param {Function} options.onChange - Callback with updated ranges
 * @returns {HTMLDivElement}
 */
export function MultiRangeSlider({ ranges = [], onChange }) {
  const wrapper = document.createElement('div');
  wrapper.className = 'space-y-4';

  let internalRanges = [...ranges];

  // 🔁 Renders all current range controls
  function renderRanges() {
    wrapper.innerHTML = '';

    internalRanges.forEach((range, idx) => {
      const group = document.createElement('div');
      group.className = 'flex items-center gap-2';

      const startInput = document.createElement('input');
      startInput.type = 'number';
      startInput.min = 0;
      startInput.max = 100;
      startInput.step = 5;
      startInput.value = range.start;
      startInput.className = 'w-20 px-2 py-1 border rounded';

      const endInput = document.createElement('input');
      endInput.type = 'number';
      endInput.min = 0;
      endInput.max = 100;
      endInput.step = 5;
      endInput.value = range.end;
      endInput.className = 'w-20 px-2 py-1 border rounded';

      const toggleBtn = document.createElement('button');
      toggleBtn.textContent = range.include ? 'Include ✅' : 'Exclude 🚫';
      toggleBtn.className = `text-sm px-2 py-1 rounded ${range.include ? 'bg-blue-600 text-white' : 'bg-gray-300 text-black'}`;

      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = '❌';
      deleteBtn.className = 'text-red-600 text-lg';

      startInput.addEventListener('input', () => updateRange(idx, 'start', +startInput.value));
      endInput.addEventListener('input', () => updateRange(idx, 'end', +endInput.value));
      toggleBtn.addEventListener('click', () => toggleInclude(idx));
      deleteBtn.addEventListener('click', () => removeRange(idx));

      group.append(startInput, endInput, toggleBtn, deleteBtn);
      wrapper.appendChild(group);
    });

    const addBtn = document.createElement('button');
    addBtn.textContent = '➕ Add Range';
    addBtn.className = 'mt-2 text-sm text-blue-600 underline';
    addBtn.addEventListener('click', addRange);
    wrapper.appendChild(addBtn);
  }

  // 🧠 Update logic
  function updateRange(idx, key, value) {
    internalRanges[idx][key] = value;
    emit();
  }

  function toggleInclude(idx) {
    internalRanges[idx].include = !internalRanges[idx].include;
    renderRanges();
    emit();
  }

  function removeRange(idx) {
    internalRanges.splice(idx, 1);
    renderRanges();
    emit();
  }

  function addRange() {
    internalRanges.push({ start: 0, end: 10, include: true });
    renderRanges();
    emit();
  }

  function emit() {
    if (onChange) onChange([...internalRanges]);
  }

  // 🚀 Initial render
  renderRanges();
  return wrapper;
}
