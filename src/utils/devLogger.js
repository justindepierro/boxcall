import { getUserSettings } from '@state/userState';

const logQueue = [];

export function devLog(msg) {
  const formatted = `[${new Date().toLocaleTimeString()}] ${msg}`;
  logQueue.push(formatted);

  if (!ensureLogPanelExists()) return;

  const panel = document.getElementById('dev-log-console');
  const entry = document.createElement('div');
  entry.textContent = formatted;

  // 🎨 Apply color based on content
  entry.className = getLogClass(msg);

  panel.appendChild(entry);
  panel.scrollTop = panel.scrollHeight;

  console.log(formatted);
}
function getContextHTML() {
  const settings = getUserSettings() || {};
  return `
    <div class="space-y-[2px] font-mono text-[11px] leading-snug text-white/90">
      <div><span class="text-white/60">Page:</span> <code>${location.hash || '(none)'}</code></div>
      <div><span class="text-white/60">Role:</span> <code>${settings.role || 'unknown'}</code></div>
      <div><span class="text-white/60">Team ID:</span> <code>${settings.team_id || 'none'}</code></div>
      <div><span class="text-white/60">Font:</span> <code>${settings.font_theme || 'default'}</code></div>
      <div><span class="text-white/60">Color:</span> <code>${settings.color_theme || 'default'}</code></div>
    </div>
  `;
}

export function getDevLogs() {
  return logQueue.slice(); // Clone
}

export function clearDevLogs() {
  logQueue.length = 0;
  const panel = document.getElementById('dev-log-console');
  if (panel) panel.innerHTML = '';
}

// In devLogger.js
export function saveLogsToSession() {
  sessionStorage.setItem('dev.logs', JSON.stringify(logQueue));
}

export function restoreLogsFromSession() {
  const saved = sessionStorage.getItem('dev.logs');
  if (saved) {
    const logs = JSON.parse(saved);
    logs.forEach(devLog); // replay logs
  }
}

function ensureLogPanelExists() {
  const el = document.getElementById('dev-log-console');
  if (!el) {
    console.warn('⚠️ dev-log-console not found — devLog() ignored.');
    return false;
  }
  return true;
}

export function refreshDevContext() {
  const context = document.getElementById('log-context');
  if (context) {
    context.innerHTML = getContextHTML(); // or however you're generating the context
  }
}

function getLogClass(msg) {
  if (msg.includes('✅') || msg.includes('done') || msg.includes('success')) {
    return 'text-green-400';
  }
  if (msg.includes('⚠️') || msg.includes('warn') || msg.includes('slow')) {
    return 'text-yellow-300';
  }
  if (msg.includes('❌') || msg.includes('error') || msg.includes('fail')) {
    return 'text-red-400';
  }
  if (msg.includes('🧪') || msg.includes('test') || msg.includes('debug')) {
    return 'text-purple-300';
  }
  if (msg.includes('🔄') || msg.includes('refresh') || msg.includes('context')) {
    return 'text-blue-300';
  }
  return 'text-white/80';
}
