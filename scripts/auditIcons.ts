import fs from "fs";
import path from "path";

const ICON_REGEX = /<Icon\s+name=["']([a-zA-Z0-9-]+)["']/g;
const SRC_DIR = path.resolve(__dirname, "../src");

function walk(dir: string, icons: Set<string>) {
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (fs.statSync(full).isDirectory()) {
      walk(full, icons);
    } else if (full.endsWith(".tsx") || full.endsWith(".ts")) {
      const content = fs.readFileSync(full, "utf8");
      let match;
      while ((match = ICON_REGEX.exec(content))) {
        icons.add(match[1]);
      }
    }
  }
}

const icons = new Set<string>();
walk(SRC_DIR, icons);
console.log("Icon names found:", Array.from(icons));
// Optionally: write to file for CI/test use
fs.writeFileSync(path.resolve(__dirname, "icon-usage.json"), JSON.stringify(Array.from(icons), null, 2));
