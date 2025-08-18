#!/usr/bin/env tsx
/**
 * scripts/a11y_smoke_pages.ts
 * Baseline accessibility (axe-core) smoke scan across key application routes.
 * Output: docs/style-inventory/a11y-smoke-report.md & a11y-smoke-report.json
 * Exit Code: 0 (baseline capture). Enable failure gate later when violations triaged.
 */
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";

import AxeBuilder from "@axe-core/playwright";
import { chromium } from "playwright";

const BASE_URL = process.env.BOXCALL_BASE_URL || "http://localhost:5173";
// Scenes allow us to visit a path and perform optional interactions before analyzing (e.g., open the Sidebar)
type SceneAction = "openSidebar";
type ThemeId =
  | "light"
  | "dark"
  | "high-contrast"
  | "cupertino-light"
  | "cupertino-dark";
interface Scene {
  path: string;
  actions?: SceneAction[];
  theme?: ThemeId; // when omitted, defaults to "light"
}
// TODO: derive from route config; static initial list + sidebar-open variant
const baseScenes: Omit<Scene, "theme">[] = [
  // Home / Dashboard
  { path: "/" },
  { path: "/", actions: ["openSidebar"] },
  { path: "/dashboard" },
  { path: "/dashboard", actions: ["openSidebar"] },
  // Primary app routes
  { path: "/plays" },
  { path: "/plays", actions: ["openSidebar"] },
  { path: "/calendar" },
  { path: "/calendar", actions: ["openSidebar"] },
  { path: "/teams" },
  { path: "/teams", actions: ["openSidebar"] },
  // Team-scoped pages (use sample id)
  { path: "/team/t1/bulletin" },
  { path: "/team/t1/bulletin", actions: ["openSidebar"] },
  { path: "/team/t1/settings" },
  { path: "/team/t1/settings", actions: ["openSidebar"] },
  { path: "/team/t1/analytics" },
  { path: "/team/t1/analytics", actions: ["openSidebar"] },
  // Auth/role pages
  { path: "/login" },
  { path: "/coach" },
  { path: "/player" },
];
const themes: ThemeId[] = [
  "light",
  "dark",
  "high-contrast",
  "cupertino-light",
  "cupertino-dark",
];
const SCENES: Scene[] = baseScenes.flatMap((s) =>
  themes.map((t) => ({ ...s, theme: t }))
);

interface AxeNodeSummary {
  target: string[];
  html?: string;
}
interface AxeViolationSummary {
  id: string;
  impact?: string; // normalized to string
  description: string;
  help: string;
  helpUrl: string;
  nodes: AxeNodeSummary[];
}
interface PageResult {
  path: string;
  url: string;
  status: number | null;
  violations: AxeViolationSummary[];
  error?: string;
  durationMs: number;
  // Custom live-contrast checks (computed styles); empty if none
  contrastFindings?: Array<{
    selector: string;
    role?: string | null;
    name?: string | null;
    ratio: number;
    threshold: number;
    reason: string;
  }>;
}

async function scan(): Promise<PageResult[]> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const results: PageResult[] = [];
  const captureScreens = Boolean(process.env.BOXCALL_SMOKE_SCREENSHOTS);
  const sanitize = (s: string) =>
    s
      .replace(/\s+/g, "-")
      // Allow alphanumerics, underscore, dot, slash, and colon; replace others
      .replace(/[^a-zA-Z0-9_.:/]/g, "-")
      .replace(/\/+$/g, "")
      .replace(/^\//, "");

  for (const scene of SCENES) {
    const url = BASE_URL.replace(/\/$/, "") + scene.path;
    const start = performance.now();
    let status: number | null = null;
    let error: string | undefined;
    let violations: AxeViolationSummary[] = [];
    let contrastFindings: PageResult["contrastFindings"] = [];
    try {
      const resp = await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });
      // Apply theme via ThemeManager contract (set data-theme + dark class)
      if (scene.theme) {
        try {
          await page.evaluate((t: ThemeId) => {
            const root = document.documentElement;
            root.setAttribute("data-theme", t);
            root.classList.remove("dark", "high-contrast");
            if (t === "dark" || t === "high-contrast") root.classList.add("dark");
            if (t === "high-contrast") root.classList.add("high-contrast");
            localStorage.setItem("app-theme", t);
          }, scene.theme);
        } catch (err) {
          console.debug("a11y-smoke: theme apply skipped:", (err as Error)?.message || err);
        }
      }
      status = resp?.status() ?? null;
      // Allow hydration & client rendering effects
      await page.waitForTimeout(600);
      // Perform scene actions (e.g., open sidebar) if requested
      if (scene.actions && scene.actions.length) {
        for (const action of scene.actions) {
          if (action === "openSidebar") {
            try {
              const btn = page.getByRole("button", { name: /open sidebar/i });
              await btn.click({ timeout: 2000 });
              await page.waitForTimeout(150);
            } catch {
              // ignore if not found on the page
            }
          }
        }
      }
      // Remove dev-only Vite error overlay (noise for accessibility scan)
      try {
        await page.evaluate(() => {
          const selectors = [
            "#vite-error-overlay",
            "vite-error-overlay",
            ".vite-error-overlay",
          ];
          selectors.forEach((sel) =>
            document.querySelectorAll(sel).forEach((el) => el.remove())
          );
        });
      } catch (err) {
        console.debug("a11y-smoke: overlay cleanup skipped:", (err as Error)?.message || err);
      }
  const axeResults = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa"])
        .analyze();
      violations = axeResults.violations.map((v) => ({
        id: v.id,
        impact: v.impact ? String(v.impact) : undefined,
        description: v.description,
        help: v.help,
        helpUrl: v.helpUrl,
        nodes: v.nodes.slice(0, 5).map((n) => ({
          target: n.target as string[],
          html: typeof n.html === "string" ? n.html.slice(0, 300) : undefined,
        })),
      }));
      // Filter out violations exclusively from dev overlay elements
      violations = violations.filter(
        (v) =>
          !v.nodes.every((n) =>
            n.target.some((t) => t.includes("vite-error-overlay"))
          )
      );

      // Live contrast sampling for key interactive elements (esp. icons using currentColor and placeholders)
      try {
        contrastFindings = await page.evaluate(() => {
        // Compute relative luminance
        const lum = (rgb: string) => {
          const m = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
          if (!m) return 0;
          const [r, g, b] = [Number(m[1]), Number(m[2]), Number(m[3])].map(
            (v) => v / 255
          );
          const f = (c: number) =>
            c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
          const [sr, sg, sb] = [f(r), f(g), f(b)];
          return 0.2126 * sr + 0.7152 * sg + 0.0722 * sb;
        };
        const contrast = (fg: string, bg: string) => {
          const L1 = lum(fg);
          const L2 = lum(bg);
          const lighter = Math.max(L1, L2);
          const darker = Math.min(L1, L2);
          return (lighter + 0.05) / (darker + 0.05);
        };
        const effectiveBg = (el: Element): string => {
          let node: Element | null = el as Element;
          while (node && node instanceof Element) {
            const cs = getComputedStyle(node as Element);
            const bg = cs.backgroundColor;
            if (bg && !bg.includes("0)")) return bg; // not fully transparent
            node = node.parentElement;
          }
          return "rgb(255, 255, 255)"; // fallback white
        };
        const results: Array<{
          selector: string;
          role?: string | null;
          name?: string | null;
          ratio: number;
          threshold: number;
          reason: string;
        }> = [];
        // Sample menuitems, nav buttons/links, lucide svg icons, and icon placeholders
        const nodes: Element[] = [
          ...document.querySelectorAll(
            '[role="menuitem"], nav [role="button"], [role="link"]'
          ),
          ...document.querySelectorAll("svg"),
          ...document.querySelectorAll('[data-icon-placeholder="true"]'),
        ];
        for (const el of nodes) {
          const cs = getComputedStyle(el as Element);
          const fg = cs.color;
          const bg = effectiveBg(el as Element);
          const ratio = contrast(fg, bg);
          const text = (el.textContent || "").trim();
          const isSVG = (el as HTMLElement).tagName.toLowerCase() === "svg";
          const isPlaceholder =
            (el as HTMLElement).getAttribute("data-icon-placeholder") ===
            "true";
          const isIconLike =
            isSVG ||
            isPlaceholder ||
            text.length === 0 ||
            (el as HTMLElement).innerText.trim().length === 0;
          const threshold = isIconLike ? 3.0 : 4.5; // WCAG AA: icons/graphics 3:1, normal text 4.5:1
          if (ratio < threshold) {
            const role = (el as HTMLElement).getAttribute("role");
            const accName = (el as HTMLElement).getAttribute("aria-label");
            results.push({
              selector: (el as HTMLElement).tagName.toLowerCase(),
              role,
              name: accName,
              ratio: Number(ratio.toFixed(2)),
              threshold,
              reason: isPlaceholder
                ? "icon placeholder below 3:1"
                : isSVG
                  ? "svg icon below 3:1"
                  : isIconLike
                    ? "icon-like element below 3:1"
                    : "text below 4.5:1",
            });
          }
        }
        return results;
        });
      } catch {
        contrastFindings = [];
      }
      // Optional screenshot capture per scene/theme for visual QA
      try {
        if (captureScreens) {
          const ssDir = join(
            process.cwd(),
            "docs",
            "screenshots",
            "a11y",
            scene.theme || "light"
          );
          mkdirSync(ssDir, { recursive: true });
          const file = sanitize(
            `${scene.path}${scene.actions?.length ? "_" + scene.actions.join("+") : ""}`
          )
            .replace(/\//g, "_")
            .replace(/[^a-zA-Z0-9-_]+/g, "-");
          await page.screenshot({ path: join(ssDir, `${file || "home"}.png`) });
        }
      } catch {
        // ignore screenshot errors
      }
    } catch (e) {
      error = (e as Error).message || String(e);
    }
    const durationMs = performance.now() - start;
    results.push({
      path:
        scene.path +
        ` [theme:${scene.theme || "light"}]` +
        (scene.actions?.length
          ? " (actions:" + scene.actions.join("+") + ")"
          : ""),
      url,
      status,
      violations,
      error,
      durationMs,
      contrastFindings,
    });
  }
  await browser.close();
  return results;
}

function summarize(results: PageResult[]) {
  const counts = {
    totalPages: results.length,
    pagesErrored: 0,
    violations: 0,
    seriousOrCritical: 0,
  };
  results.forEach((r) => {
    if (r.error) counts.pagesErrored++;
    counts.violations += r.violations.length;
    counts.seriousOrCritical += r.violations.filter((v) =>
      ["serious", "critical"].includes((v.impact || "").toLowerCase())
    ).length;
  });
  return counts;
}

(async () => {
  const results = await scan();
  const summary = summarize(results);
  const outDir = join(process.cwd(), "docs/style-inventory");
  mkdirSync(outDir, { recursive: true });
  const jsonPath = join(outDir, "a11y-smoke-report.json");
  writeFileSync(
    jsonPath,
    JSON.stringify(
      {
        generated: new Date().toISOString(),
        baseUrl: BASE_URL,
        summary,
        results,
      },
      null,
      2
    )
  );

  const md: string[] = [];
  md.push("# Accessibility Smoke Report");
  md.push(`Generated: ${new Date().toISOString()}`);
  md.push(`Base URL: ${BASE_URL}`);
  md.push("");
  md.push(
    `Pages scanned: ${summary.totalPages}, Pages errored: ${summary.pagesErrored}`
  );
  md.push(
    `Total violations: ${summary.violations} (Serious+Critical: ${summary.seriousOrCritical})`
  );
  md.push("");
  md.push("## Per Page");
  results.forEach((r) => {
    md.push(`### ${r.path}`);
    if (r.error) {
      md.push(`Error: ${r.error}`);
      return;
    }
    md.push(
      `Status: ${r.status} • Violations: ${r.violations.length} • Load+scan: ${r.durationMs.toFixed(0)}ms`
    );
    r.violations.slice(0, 25).forEach((v) => {
      const firstTarget = v.nodes[0]?.target?.[0] || "";
      md.push(
        `- [${v.impact || "n/a"}] ${v.id}: ${v.help} ${firstTarget && "(e.g. " + firstTarget + ")"}`
      );
    });
    if (r.contrastFindings && r.contrastFindings.length) {
      md.push(
        `Low contrast findings (live styles): ${r.contrastFindings.length}`
      );
      r.contrastFindings.slice(0, 20).forEach((c) => {
        md.push(
          `- ${c.reason}: ${c.role || ""} ${c.name || ""} ratio=${c.ratio} (< ${c.threshold})`
        );
      });
    }
    md.push("");
  });
  const mdPath = join(outDir, "a11y-smoke-report.md");
  writeFileSync(mdPath, md.join("\n"));
  console.log(
    `A11y smoke complete: ${summary.violations} violations across ${summary.totalPages} pages.`
  );
  console.log("Markdown:", mdPath);
  console.log("JSON:", jsonPath);
  process.exit(0); // Always 0 for baseline; gate later.
})();
