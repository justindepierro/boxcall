import { field } from '../../utils/fbMath.js'; // Our FootballField class instance

/**
 * FieldMultiRangeSlider
 * ----------------------
 * A multi-range slider representing a football field from -50 (own goal line)
 * to +50 (opponent's goal line), mapped to slider percentages 0–100%.
 *
 * Core logic:
 *   - Football yards (-40, 50, 40) → X-axis (-5 to +5) → slider percent (0–100).
 *   - UI displays yardline markers (0, -10, -20, ... 50 ... 20, 10, 0).
 *
 * @param {Object} options
 * @param {Array} options.ranges - [{ start, end, include }] (yardline positions)
 * @param {Function} options.onChange - Callback fired when ranges update.
 * @returns {HTMLDivElement} The constructed slider UI.
 */
export function FieldMultiRangeSlider({ ranges = [], onChange } = {}) {
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
    tick.textContent = num;
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
  trackWrapper.appendChild(numberLine);
  trackWrapper.appendChild(sliderTrack);
  wrapper.appendChild(trackWrapper);

  // === CONTROLS PANEL ===
  const controlsWrapper = document.createElement('div');
  controlsWrapper.className = 'space-y-3';
  wrapper.appendChild(controlsWrapper);

  // ========================================================================
  //  RENDER RANGES
  // ========================================================================
  function renderRanges() {
    sliderTrack.innerHTML = ''; // Clear any old blocks
    console.log('🔄 Re-rendering Ranges:', JSON.stringify(ranges));

    ranges.forEach(({ start, end, include }, i) => {
      console.log(`  ➡️ Range #${i}: start=${start}, end=${end}, include=${include}`);

      // Ensure order from left to right
      const [leftVal, rightVal] = field.normalizeRange(start, end);

      // Map to slider percentages
      const { left, width } = field.mapRangeToPercent(leftVal, rightVal);
      console.log(
        `    • Normalized: [${leftVal}, ${rightVal}] → left=${left.toFixed(
          2
        )}%, width=${width.toFixed(2)}%`
      );

      // Create visual range block
      const rangeDiv = document.createElement('div');
      rangeDiv.className =
        'absolute top-0 bottom-0 z-10 rounded transition-all duration-200 cursor-grab';
      rangeDiv.style.left = `${left}%`;
      rangeDiv.style.width = `${width}%`;
      rangeDiv.style.backgroundColor = include
        ? 'rgba(59, 130, 246, 0.5)' // Blue
        : 'rgba(239, 68, 68, 0.5)'; // Red
      rangeDiv.dataset.index = i;

      // Add label (e.g., "Own 20 yd → Opp 15 yd")
      const label = document.createElement('div');
      label.textContent = field.describeRange(start, end);
      label.className =
        'absolute text-[10px] font-bold text-white text-center left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 px-1 rounded';
      rangeDiv.appendChild(label);

      sliderTrack.appendChild(rangeDiv);
    });
  }

  // ========================================================================
  //  RENDER CONTROLS
  // ========================================================================
  function renderControls() {
    controlsWrapper.innerHTML = '';

    ranges.forEach(({ start, end, include }, i) => {
      console.log(`📝 Control Row #${i}: start=${start}, end=${end}`);

      const row = document.createElement('div');
      row.className = 'flex items-center gap-2';

      // Toggle Include/Exclude
      const toggle = document.createElement('button');
      toggle.textContent = include ? 'Include' : 'Exclude';
      toggle.className = `px-2 py-1 rounded text-sm font-mono ${
        include ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
      }`;
      toggle.addEventListener('click', () => {
        ranges[i].include = !ranges[i].include;
        console.log(`  🔀 Toggled Range #${i}: include=${ranges[i].include}`);
        update();
      });

      // Start Yard Input
      const from = document.createElement('input');
      from.type = 'number';
      from.value = start;
      from.className = 'w-16 border text-sm px-1 py-0.5 rounded';
      from.addEventListener('change', (e) => {
        const newVal = field.clamp(parseInt(e.target.value, 10));
        console.log(`  ✏️ Start Changed #${i}: ${start} → ${newVal}`);
        ranges[i].start = newVal;
        update();
      });

      // End Yard Input
      const to = document.createElement('input');
      to.type = 'number';
      to.value = end;
      to.className = 'w-16 border text-sm px-1 py-0.5 rounded';
      to.addEventListener('change', (e) => {
        const newVal = field.clamp(parseInt(e.target.value, 10));
        console.log(`  ✏️ End Changed #${i}: ${end} → ${newVal}`);
        ranges[i].end = newVal;
        update();
      });

      // Remove Button
      const remove = document.createElement('button');
      remove.textContent = '✖';
      remove.className = 'text-red-500 hover:underline text-sm';
      remove.addEventListener('click', () => {
        console.log(`  🗑️ Removing Range #${i}`);
        ranges.splice(i, 1);
        update();
      });

      row.append(toggle, from, to, remove);
      controlsWrapper.appendChild(row);
    });
  }

  // ========================================================================
  //  ADD RANGE BUTTON
  // ========================================================================
  const addBtn = document.createElement('button');
  addBtn.textContent = '+ Add Range';
  addBtn.className =
    'bg-[var(--color-accent)] text-white text-sm px-3 py-1 rounded hover:brightness-110';
  addBtn.addEventListener('click', () => {
    console.log('➕ Adding default range: -20 → -10');
    ranges.push({ start: -20, end: -10, include: true });
    update();
  });
  wrapper.appendChild(addBtn);

  // ========================================================================
  //  UPDATE FUNCTION
  // ========================================================================
  function update() {
    console.log('🔃 Updating Slider...');
    renderRanges();
    renderControls();
    if (onChange) onChange([...ranges]);
  }

  // Initial Render
  update();
  return wrapper;
}
