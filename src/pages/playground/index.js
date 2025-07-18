// /src/pages/playground/index.js
import { BaseButton } from '@components/ui/BaseButton.js';
import { BaseToggle } from '@components/ui/BaseToggle.js';
import { BaseSlider } from '@components/ui/BaseSlider.js';
//import { MultiRangeSlider } from '../../components/ui/multiRangeSlider';
import { FieldMultiRangeSlider } from '../../components/ui/fieldMultiRangeSlider';

export default function PlaygroundPage() {
  const wrapper = document.createElement('div');
  wrapper.className = 'p-6 space-y-6';

  const heading = document.createElement('h1');
  heading.className = 'text-xl font-bold';
  heading.innerHTML = '🧪 Button Test Lab';
  wrapper.appendChild(heading);

  const buttonGroup = document.createElement('div');
  buttonGroup.className = 'space-y-4';

  buttonGroup.appendChild(BaseButton({ label: 'Primary' }));
  buttonGroup.appendChild(
    BaseButton({ label: 'Full Width Secondary', fullWidth: true, variant: 'secondary' })
  );
  buttonGroup.appendChild(BaseButton({ icon: 'settings', iconOnly: true, ariaLabel: 'Settings' }));
  buttonGroup.appendChild(BaseButton({ label: 'Delete', icon: 'trash', variant: 'danger' }));
  buttonGroup.appendChild(
    BaseButton({ label: 'Export', icon: 'arrow-down-to-line', variant: 'outline' })
  );
  buttonGroup.appendChild(BaseButton({ label: 'Loading...', loading: true }));
  buttonGroup.appendChild(BaseButton({ label: 'Join Now', rounded: 'pill' }));
  buttonGroup.appendChild(
    BaseButton({
      slotMain: `<span class="inline-flex items-center gap-1">🧬 <strong>Custom</strong> Slot</span>`,
    })
  );
  buttonGroup.appendChild(BaseButton({ label: 'Click Me', icon: 'mouse-pointer-click' }));

  wrapper.appendChild(buttonGroup);

  // ⏱️ Toggle Group
  const toggleGroup = document.createElement('div');
  toggleGroup.className = 'space-y-4 pt-8';

  toggleGroup.appendChild(BaseToggle({ label: 'Primary Toggle', checked: true }));
  toggleGroup.appendChild(BaseToggle({ label: 'Danger Toggle', variant: 'danger' }));
  toggleGroup.appendChild(BaseToggle({ label: 'Disabled Toggle', disabled: true, checked: true }));
  toggleGroup.appendChild(BaseToggle({ label: 'Small Toggle', size: 'sm' }));
  toggleGroup.appendChild(BaseToggle({ label: 'Large Toggle', size: 'lg' }));
  toggleGroup.appendChild(
    BaseToggle({
      label: 'Basic Toggle',
      checked: true,
      onChange: (val) => console.log('🔘 Basic Toggle:', val),
    })
  );

  toggleGroup.appendChild(
    BaseToggle({
      label: 'Danger Variant',
      variant: 'danger',
      size: 'lg',
      onChange: (val) => console.log('⚠️ Danger:', val),
    })
  );

  toggleGroup.appendChild(
    BaseToggle({
      label: 'Selected + Focused',
      selected: true,
      focused: true,
      tooltip: 'This toggle is selected and focused',
      onChange: (val) => console.log('✨ Selected:', val),
    })
  );

  wrapper.appendChild(toggleGroup);

  const sliders = document.createElement('div');
  sliders.className = 'space-y-4 pt-8';

  sliders.appendChild(
    BaseSlider({
      label: 'Volume',
      value: 50,
      min: 0,
      max: 100,
      onChange: (val) => console.log('🎚️ Volume set to:', val),
    })
  );

  wrapper.appendChild(sliders);

  const fieldMultiSlider = FieldMultiRangeSlider({
    ranges: [
      { start: -40, end: -20, include: true },
      { start: 20, end: 35, include: false },
    ],
    onChange: (fieldMultiSlider) => {
      console.log('🔍 Playground Initial Ranges:', fieldMultiSlider);
    },
  });

  wrapper.appendChild(fieldMultiSlider);

  return wrapper;
}
