import './styles/tailwind.css';
import { HomePage } from './pages/home.js';

document.addEventListener('DOMContentLoaded', () => {
  const el = document.querySelector('#some-element');
  if (el) {
    el.innerHTML = 'Tailwind is working!';
  }
});
