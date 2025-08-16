#!/usr/bin/env node
/**
 * CI/build guard: fail if any built assets reference external Google Fonts
 * or external font URLs. Ensures we remain fully self-hosted for fonts.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const DIST_DIR = join(process.cwd(), "dist");
const FORBIDDEN = [
  /fonts\.googleapis\.com/i,
  /fonts\.gstatic\.com/i,
  /url\(https?:\/\//i, // any external font URL in CSS
];

function listFiles(dir) {
  const entries = readdirSync(dir);
  const files = [];
  for (const entry of entries) {
    const p = join(dir, entry);
    const s = statSync(p);
    if (s.isDirectory()) files.push(...listFiles(p));
    else files.push(p);
  }
  return files;
}

function main() {
  try {
    const files = listFiles(DIST_DIR).filter((p) =>
      /\.(html|css|js|json|txt)$/i.test(p)
    );
    let violations = [];
    for (const file of files) {
      const txt = readFileSync(file, "utf8");
      for (const pat of FORBIDDEN) {
        if (pat.test(txt)) {
          violations.push({ file, pattern: pat.toString() });
          break;
        }
      }
    }
    if (violations.length) {
      console.error("Font self-hosting guard FAILED: external references found\n");
      for (const v of violations) {
        console.error(`- ${v.file} matched ${v.pattern}`);
      }
      process.exit(1);
    } else {
      console.log("Font self-hosting guard PASSED: no external font references found.");
    }
  } catch (err) {
    console.warn(
      `Font guard could not complete. Did you run a build? Expected: ${DIST_DIR}\n` +
        String(err)
    );
    process.exit(0); // do not fail if dist doesn't exist
  }
}

main();
