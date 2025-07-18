import { field } from '../../utils/fbMath.js'; // Football field math utilities

/**
 * @param {{ ranges?: Array<{ start: number, end: number, include: boolean }>, onChange?: Function }} options
 */
export function FieldMultiRangeSlider({ ranges = [], onChange = () => {} } = {}) {
  const wrapper = document.createElement('div');
  wrapper.className = 'space-y-4';

  console.log('🟢 Initial Ranges:', JSON.stringify(ranges));

  // === TITLE ===
  const title = document.createElement('h3');
  title.className = 'text-lg font-bold text-[var(--color-text)]';
  title.textContent = '🏟️ Field Range Selector';
  wrapper.appendChild(title);

  // === YARDLINE MARKERS ===
  const yardLabels = [0, -10, -20, -30, -40, 50, 40, 30, 20, 10, 0];
  const numberLine = document.createElement('div');
  numberLine.className = 'flex justify-between text-xs text-gray-700 font-mono px-1';

  yardLabels.forEach((num) => {
    const tick = document.createElement('div');
    tick.textContent = String(num); // Convert number to string
    tick.className = 'w-[8.5%] text-center';
    numberLine.appendChild(tick);
  });

  // === SLIDER TRACK ===
  const sliderTrack = document.createElement('div');
  sliderTrack.className = 'relative h-10 w-full bg-gray-200 rounded overflow-hidden';
  sliderTrack.style.backgroundImage =
    'repeating-linear-gradient(to right, transparent, transparent 9%, #ccc 9%, #ccc 10%)';

  const trackWrapper = document.createElement('div');
  trackWrapper.className = 'space-y-1';
  trackWrapper.append(numberLine, sliderTrack);
  wrapper.appendChild(trackWrapper);

  // === CONTROLS PANEL ===
  const controlsWrapper = document.createElement('div');
  controlsWrapper.className = 'space-y-3';
  wrapper.appendChild(controlsWrapper);

  // ==========================================================
  // RENDER RANGES
  // ==========================================================
  function renderRanges() {
    sliderTrack.innerHTML = '';
    console.log('🔄 Re-rendering Ranges:', JSON.stringify(ranges));

    ranges.forEach(({ start, end, include }, i) => {
      const [leftVal, rightVal] = field.normalizeRange(start, end);
      const { left, width } = field.mapRangeToPercent(leftVal, rightVal);

      const rangeDiv = document.createElement('div');
      rangeDiv.className =
        'absolute top-0 bottom-0 z-10 rounded transition-all duration-200 cursor-grab';
      rangeDiv.style.left = `${left}%`;
      rangeDiv.style.width = `${width}%`;
      rangeDiv.style.backgroundColor = include
        ? 'rgba(59, 130, 246, 0.5)'
        : 'rgba(239, 68, 68, 0.5)';
      rangeDiv.dataset.index = String(i);

      const label = document.createElement('div');
      label.textContent = field.describeRange(start, end);
      label.className =
        'absolute text-[10px] font-bold text-white text-center left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 px-1 rounded';
      rangeDiv.appendChild(label);

      sliderTrack.appendChild(rangeDiv);
    });
  }

  // ==========================================================
  // RENDER CONTROLS
  // ==========================================================
  function renderControls() {
    // Clear existing control rows
    controlsWrapper.innerHTML = '';

    ranges.forEach(({ start, end, include }, i) => {
      // Row wrapper for all controls
      const row = document.createElement('div');
      row.className = 'flex items-center gap-2';

      // ==========================================================
      // Include/Exclude Toggle Button
      // ==========================================================
      const toggle = document.createElement('button');
      toggle.textContent = include ? 'Include' : 'Exclude';
      toggle.className = `px-2 py-1 rounded text-sm font-mono ${
        include ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
      }`;
      toggle.addEventListener('click', () => {
        ranges[i].include = !ranges[i].include;
        update();
      });

      // ==========================================================
      // Start Yard Input
      // ==========================================================
      const from = document.createElement('input');
      from.type = 'number';
      from.value = String(start);
      from.className = 'w-16 border text-sm px-1 py-0.5 rounded';
      from.addEventListener('change', (e) => {
        const target = e.target;
        if (target instanceof HTMLInputElement) {
          const newVal = field.clamp(parseInt(target.value, 10));
          ranges[i].start = newVal;
          update();
        }
      });

      // ==========================================================
      // End Yard Input
      // ==========================================================
      const to = document.createElement('input');
      to.type = 'number';
      to.value = String(end);
      to.className = 'w-16 border text-sm px-1 py-0.5 rounded';
      to.addEventListener('change', (e) => {
        const target = e.target;
        if (target instanceof HTMLInputElement) {
          const newVal = field.clamp(parseInt(target.value, 10));
          ranges[i].end = newVal;
          update();
        }
      });

      // ==========================================================
      // Remove Button
      // ==========================================================
      const remove = document.createElement('button');
      remove.textContent = '✖';
      remove.className = 'text-red-500 hover:underline text-sm';
      remove.addEventListener('click', () => {
        ranges.splice(i, 1);
        update();
      });

      // Append all controls to row
      row.append(toggle, from, to, remove);
      controlsWrapper.appendChild(row);
    });
  }

  // ==========================================================
  // ADD RANGE BUTTON
  // ==========================================================
  const addBtn = document.createElement('button');
  addBtn.textContent = '+ Add Range';
  addBtn.className =
    'bg-[var(--color-accent)] text-white text-sm px-3 py-1 rounded hover:brightness-110';
  addBtn.addEventListener('click', () => {
    ranges.push({ start: -20, end: -10, include: true });
    update();
  });
  wrapper.appendChild(addBtn);

  // ==========================================================
  // UPDATE FUNCTION
  // ==========================================================
  function update() {
    renderRanges();
    renderControls();
    if (onChange) onChange([...ranges]);
  }

  // Initial render
  update();
  return wrapper;
}
