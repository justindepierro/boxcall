#!/usr/bin/env tsx
/**
 * scripts/a11y_smoke_pages.ts
 * Baseline accessibility (axe-core) smoke scan across key application routes.
 * Output: docs/style-inventory/a11y-smoke-report.md & a11y-smoke-report.json
 * Exit Code: 0 (baseline capture). Enable failure gate later when violations triaged.
 */
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";

const BASE_URL = process.env.BOXCALL_BASE_URL || "http://localhost:5173";
// TODO: derive from route config; static initial list
const PATHS = ["/", "/plays", "/calendar", "/login"];

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
}

async function scan(): Promise<PageResult[]> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const results: PageResult[] = [];

  for (const path of PATHS) {
    const url = BASE_URL.replace(/\/$/, "") + path;
    const start = performance.now();
    let status: number | null = null;
    let error: string | undefined;
    let violations: AxeViolationSummary[] = [];
    try {
      const resp = await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });
      status = resp?.status() ?? null;
      // Allow hydration & client rendering effects
      await page.waitForTimeout(500);
      // Remove dev-only Vite error overlay (noise for accessibility scan)
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
    } catch (e) {
      error = (e as Error).message || String(e);
    }
    const durationMs = performance.now() - start;
    results.push({ path, url, status, violations, error, durationMs });
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
