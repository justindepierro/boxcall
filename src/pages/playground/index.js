import { createButton } from '@components/ui/Button.js';
import { createToggle } from '@components/ui/Toggle.js';
import { createSlider } from '@components/ui/Slider.js';
import { createFormField } from '@components/ui/FormField.js';

export default function PlaygroundPage() {
  const wrapper = document.createElement('div');
  wrapper.className = 'space-y-6';

  wrapper.appendChild(createButton({}));
  wrapper.appendChild(createToggle({}));
  wrapper.appendChild(createSlider({}));
  wrapper.appendChild(createFormField({}));

  return wrapper;
}
