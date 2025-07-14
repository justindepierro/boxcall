// /config/themes/sidebarTheme.js

// Accepts a theme string like "classic", "modern", "athletic"
export function getSidebarClasses(theme = 'classic') {
  switch (theme) {
    case 'modern':
      return {
        bg: 'bg-gray-900',
        text: 'text-white',
        hover: 'hover:bg-gray-800',
        active: 'bg-gray-800 text-white',
        border: 'border-gray-700',
      };
    case 'athletic':
      return {
        bg: 'bg-blue-900',
        text: 'text-white',
        hover: 'hover:bg-blue-800',
        active: 'bg-blue-800 text-white',
        border: 'border-blue-700',
      };
    default:
      return {
        bg: 'bg-slate-900',
        text: 'text-white',
        hover: 'hover:bg-slate-800',
        active: 'bg-slate-800 text-white',
        border: 'border-slate-700',
      };
  }
}
