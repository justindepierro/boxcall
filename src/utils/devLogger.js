const logQueue = [];

export function devLog(msg) {
  const formatted = `[${new Date().toLocaleTimeString()}] ${msg}`;
  logQueue.push(formatted);

  if (!ensureLogPanelExists()) return;

  const panel = document.getElementById('dev-log-console');
  const entry = document.createElement('div');
  entry.textContent = formatted;
  panel.appendChild(entry);
  panel.scrollTop = panel.scrollHeight;

  console.log(formatted);
}

function getContextHTML() {
  return `
    <div>Page: <code>${location.hash || '(none)'}</code></div>
    <div>Role: <code>${window.userSettings?.role || 'unknown'}</code></div>
    <div>Team ID: <code>${window.userSettings?.team_id || 'none'}</code></div>
    <div>Font: <code>${window.userSettings?.font_theme || 'default'}</code></div>
    <div>Color: <code>${window.userSettings?.color_theme || 'default'}</code></div>
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
