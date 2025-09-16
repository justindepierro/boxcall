/*
 * Contrast Debug Helper (Development Only)
 * --------------------------------------------------
 * Activates when localStorage.setItem('debugContrast','on') and page reloads
 * Scans DOM for potential low-contrast pairs (text nodes) and visually outlines failures.
 * Uses WCAG 2.1 contrast ratio algorithm (relative luminance) and flags < 4.5 (normal text) or < 3.0 (large text ≥18px or ≥14px bold).
 */

interface ContrastIssue {
  node: HTMLElement;
  fg: string;
  bg: string;
  ratio: number;
  large: boolean;
}

const ACTIVE_FLAG = "debugContrast";
const isEnabled = () =>
  typeof window !== "undefined" && localStorage.getItem(ACTIVE_FLAG) === "on";
// Lightweight diagnostic (safe if console blocked)
try {
  console.info("[contrastDebug] loaded", { flag: isEnabled() });
} catch (_err) {
  /* noop */
}

let indicatorEl: HTMLDivElement | null = null;
let active = false;

// Config / Modes
// localStorage.debugContrastMode values:
//  - undefined: only failing elements outlined (default)
//  - 'all': annotate every scanned element with data-contrast-ratio
//  - 'near': annotate + outline elements within NEAR_DELTA of threshold
const getMode = () =>
  (typeof window !== "undefined" &&
    localStorage.getItem("debugContrastMode")) ||
  "";
const NEAR_DELTA = 0.5; // within 0.5 of threshold counts as "near"

function createIndicator() {
  if (indicatorEl) return indicatorEl;
  indicatorEl = document.createElement("div");
  indicatorEl.id = "contrast-debug-indicator";
  indicatorEl.style.position = "fixed";
  indicatorEl.style.bottom = "0.75rem";
  indicatorEl.style.left = "0.75rem";
  indicatorEl.style.zIndex = "2147483647";
  indicatorEl.style.font = "600 11px/1.2 Inter, system-ui, sans-serif";
  indicatorEl.style.padding = "0.4rem 0.55rem";
  indicatorEl.style.borderRadius = "4px";
  indicatorEl.style.background = "rgba(15,23,42,0.9)"; // slate-900 w/ opacity
  indicatorEl.style.color = "#fff";
  indicatorEl.style.letterSpacing = "0.5px";
  indicatorEl.style.boxShadow = "0 2px 4px rgba(0,0,0,0.35)";
  indicatorEl.style.pointerEvents = "none";
  indicatorEl.textContent = "Contrast: scanning…";
  document.body.appendChild(indicatorEl);
  return indicatorEl;
}

function updateIndicator(
  failCount: number,
  nearCount?: number,
  scanned?: number
) {
  if (!indicatorEl) return;
  if (typeof nearCount === "number" && typeof scanned === "number") {
    indicatorEl.textContent = `Contrast: ${failCount} • Near: ${nearCount} • Scanned: ${scanned}`;
  } else {
    indicatorEl.textContent = `Contrast: ${failCount}`;
  }
  indicatorEl.style.background =
    failCount > 0 ? "rgba(180,32,32,0.9)" : "rgba(17,94,89,0.9)"; // red vs teal
}

function attachUI() {
  if (document.getElementById("contrast-rescan-btn")) return;
  const toggleBtn = document.createElement("button");
  toggleBtn.id = "contrast-rescan-btn";
  toggleBtn.textContent = "Rescan";
  toggleBtn.style.position = "fixed";
  toggleBtn.style.bottom = "0.75rem";
  toggleBtn.style.right = "0.75rem";
  toggleBtn.style.zIndex = "2147483647";
  toggleBtn.style.padding = "0.45rem 0.6rem";
  toggleBtn.style.fontSize = "11px";
  toggleBtn.style.fontFamily = "Inter, system-ui, sans-serif";
  toggleBtn.style.background = "#0F172A";
  toggleBtn.style.color = "white";
  toggleBtn.style.border = "1px solid #334155";
  toggleBtn.style.borderRadius = "4px";
  toggleBtn.style.boxShadow = "0 2px 4px rgba(0,0,0,0.25)";
  toggleBtn.addEventListener("click", () => {
    clearMarks();
    runContrastScan();
  });
  document.body.appendChild(toggleBtn);
}

function activateContrastDebug() {
  if (active) return; // idempotent
  active = true;
  document.documentElement.setAttribute("data-debug-contrast", "true");
  createIndicator();
  attachUI();
  runContrastScan();
  const mo = new MutationObserver((mutations) => {
    if (!indicatorEl) return;
    let added = 0;
    for (const m of mutations) added += m.addedNodes.length;
    if (added > 50) {
      requestIdleCallback(
        () => {
          clearMarks();
          runContrastScan();
        },
        { timeout: 1500 }
      );
    }
  });
  mo.observe(document.body, { childList: true, subtree: true });
}

function deactivateContrastDebug() {
  if (!active) return;
  active = false;
  document.documentElement.removeAttribute("data-debug-contrast");
  clearMarks();
  indicatorEl?.remove();
  indicatorEl = null;
  const btn = document.getElementById("contrast-rescan-btn");
  btn?.remove();
}

// Auto-activate (dev OR production preview) if flag set
if (isEnabled()) {
  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    activateContrastDebug();
  } else {
    window.addEventListener("DOMContentLoaded", activateContrastDebug, {
      once: true,
    });
  }
}
// Keyboard toggle Alt+Shift+C always available
window.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "c" && e.altKey && e.shiftKey) {
    if (active) {
      localStorage.removeItem(ACTIVE_FLAG);
      deactivateContrastDebug();
    } else {
      localStorage.setItem(ACTIVE_FLAG, "on");
      activateContrastDebug();
    }
  }
});

function parseColor(input: string): [number, number, number] | null {
  if (!input) return null;
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) return null;
  ctx.fillStyle = input;
  const computed = ctx.fillStyle;
  const m = /rgb[a]?\((\d+),\s*(\d+),\s*(\d+)/.exec(computed);
  if (!m) return null;
  return [parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3], 10)];
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const srgb = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}

function contrastRatio(
  fg: [number, number, number],
  bg: [number, number, number]
): number {
  const L1 = relativeLuminance(fg) + 0.05;
  const L2 = relativeLuminance(bg) + 0.05;
  return L1 > L2 ? L1 / L2 : L2 / L1;
}

function getEffectiveBackground(el: HTMLElement): string {
  let current: HTMLElement | null = el;
  while (current && current !== document.documentElement) {
    const bg = getComputedStyle(current).backgroundColor;
    if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") return bg;
    current = current.parentElement;
  }
  return getComputedStyle(document.body).backgroundColor || "rgb(255,255,255)";
}

function isLargeText(el: HTMLElement): boolean {
  const style = getComputedStyle(el);
  const fontSize = parseFloat(style.fontSize);
  const isBold = /bold|600|700|800|900/.test(style.fontWeight || "");
  return fontSize >= 18 || (fontSize >= 14 && isBold);
}

function clearMarks() {
  document.querySelectorAll("[data-contrast-fail]").forEach((n) => {
    n.removeAttribute("data-contrast-fail");
    (n as HTMLElement).style.outline = "";
    (n as HTMLElement).style.position =
      (n as HTMLElement).dataset._contrastOrigPos || "";
    delete (n as HTMLElement).dataset._contrastOrigPos;
  });
}

function runContrastScan() {
  const mode = getMode();
  const issues: ContrastIssue[] = [];
  let near = 0;
  let scanned = 0;
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_ELEMENT,
    null
  );
  while (walker.nextNode()) {
    const el = walker.currentNode as HTMLElement;
    if (!el) continue;
    // Skip hidden / zero-size
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) continue;
    const style = getComputedStyle(el);
    const fg = parseColor(style.color);
    const bg = parseColor(getEffectiveBackground(el));
    if (!fg || !bg) continue;
    const ratio = contrastRatio(fg, bg);
    const large = isLargeText(el);
    const threshold = large ? 3.0 : 4.5;
    scanned += 1;
    if (mode === "all") {
      el.setAttribute("data-contrast-ratio", ratio.toFixed(2));
    }
    if (ratio < threshold) {
      issues.push({
        node: el,
        fg: style.color,
        bg: getEffectiveBackground(el),
        ratio,
        large,
      });
    } else if (mode && ratio < threshold + NEAR_DELTA) {
      near += 1;
      if (mode !== "all") {
        el.setAttribute("data-contrast-near", ratio.toFixed(2));
      }
      if (mode === "near") {
        // Soft outline (amber) for near misses
        if (getComputedStyle(el).position === "static") {
          el.style.position = "relative";
        }
        el.style.outline = "2px dashed rgba(234,179,8,0.9)"; // amber-400
      }
    }
  }
  issues.forEach((issue) => {
    const el = issue.node;
    if (!el.dataset._contrastOrigPos)
      el.dataset._contrastOrigPos = el.style.position || "";
    if (getComputedStyle(el).position === "static")
      el.style.position = "relative";
    el.style.outline = "2px solid rgba(220,38,38,0.9)";
    el.setAttribute("data-contrast-fail", issue.ratio.toFixed(2));
  });
  // Log summary table
  if (indicatorEl) updateIndicator(issues.length, near, scanned);
  if (issues.length) {
    console.info(
      issues.slice(0, 50).map((i) => ({
        text: i.node.textContent?.trim()?.slice(0, 40) || "(element)",
        ratio: i.ratio.toFixed(2),
        large: i.large,
        fg: i.fg,
        bg: i.bg,
      }))
    );
    console.info(`Contrast issues flagged: ${issues.length}`);
  } else {
    console.info("No contrast issues detected by heuristic scanner.");
  }
  console.info(
    `[contrastDebug] scanned=${scanned} fail=${issues.length} near=${near} mode='${mode || "default"}'`
  );
  return issues;
}

// Expose manual trigger
declare global {
  interface Window {
    runContrastScan?: () => void;
    activateContrastDebug?: () => void;
    deactivateContrastDebug?: () => void;
    toggleContrastDebug?: () => void;
  }
}
window.runContrastScan = runContrastScan;
window.activateContrastDebug = activateContrastDebug;
window.deactivateContrastDebug = deactivateContrastDebug;
window.toggleContrastDebug = () => {
  if (active) {
    localStorage.removeItem(ACTIVE_FLAG);
    deactivateContrastDebug();
  } else {
    localStorage.setItem(ACTIVE_FLAG, "on");
    activateContrastDebug();
  }
};
