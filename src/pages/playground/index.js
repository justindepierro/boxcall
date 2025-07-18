// /src/pages/playground/index.js
import { BaseButton } from '@components/ui/baseButton.js';
import { BaseToggle } from '@components/ui/baseToggle.js';
import { BaseSlider } from '@components/ui/baseSlider.js';
import { FieldMultiRangeSlider } from '../../components/ui/fieldMultiRangeSlider.js';
import { Modal } from '@components/ui/modal.js';
import { FieldForm } from '@components/ui/formField.js';

export default function PlaygroundPage() {
  // Wrapper container
  const wrapper = document.createElement('div');
  wrapper.className = 'p-6 space-y-6';

  // =========================================================================
  //  HEADING
  // =========================================================================
  const heading = document.createElement('h1');
  heading.className = 'text-xl font-bold';
  heading.innerHTML = '🧪 Button Test Lab';
  wrapper.appendChild(heading);

  // =========================================================================
  //  BUTTON GROUP
  // =========================================================================
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

  // =========================================================================
  //  TOGGLE GROUP
  // =========================================================================
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

  // =========================================================================
  //  SLIDER GROUP
  // =========================================================================
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

  // =========================================================================
  //  FIELD MULTI-RANGE SLIDER
  // =========================================================================
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

  // =========================================================================
  //  OPEN FIELD EDITOR BUTTON
  // =========================================================================
  const fieldEditorBtn = BaseButton({
    label: 'Open Field Editor',
    icon: 'edit',
    variant: 'primary',
    onClick: () => {
      const form = FieldForm({
        initialRanges: [{ start: -20, end: 10, include: true }],
        onSave: (ranges) => {
          console.log('💾 Saved Ranges:', ranges);
        },
        onCancel: () => {
          console.log('❌ Field editor cancelled.');
        },
      });

      Modal({ title: 'Field Range Editor', content: form });
    },
  });

  wrapper.appendChild(fieldEditorBtn);

  return wrapper;
}
