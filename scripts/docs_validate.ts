import { readdirSync, statSync, readFileSync } from "fs";
import { join, extname } from "path";

interface Violation {
  file: string;
  reason: string;
}

const ROOT = join(process.cwd(), "docs");
const violations: Violation[] = [];

function walk(dir: string) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full);
    else if (extname(entry) === ".md") check(full);
  }
}

function check(file: string) {
  const txt = readFileSync(file, "utf8");
  if (txt.includes("<!-- allow-empty -->")) return; // explicit allow
  const nonWhitespace = txt.replace(/\s+/g, "");
  if (nonWhitespace.length === 0) {
    violations.push({ file, reason: "empty file" });
    return;
  }
  const hasH1 = /^#\s+\S+/m.test(txt);
  if (!hasH1) violations.push({ file, reason: "missing H1 title" });
  const lineCount = txt.split(/\n/).length;
  if (lineCount > 300)
    violations.push({ file, reason: `exceeds 300 lines (${lineCount})` });
}

walk(ROOT);

if (violations.length) {
  console.error("\nDocumentation validation failed:");
  for (const v of violations) console.error(` - ${v.file}: ${v.reason}`);
  process.exit(1);
} else {
  console.log("Documentation validation passed.");
}
