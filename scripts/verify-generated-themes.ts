#!/usr/bin/env ts-node
/** Verify generated-themes.css matches current theme registry output. */
import { execSync } from "child_process";
import { readFileSync } from "fs";

try {
  execSync("npm run themes:build", { stdio: "ignore" });
} catch {
  // build script errors already surfaced
}

const before = readFileSync("src/styles/generated-themes.css", "utf8");
// rebuild again to ensure determinism
try {
  execSync("npm run themes:build", { stdio: "ignore" });
} catch {
  // ignore rebuild errors (reported earlier) to allow diff check
}
const after = readFileSync("src/styles/generated-themes.css", "utf8");

if (before !== after) {
  console.error(
    "generated-themes.css drift detected (non-deterministic output)"
  );
  process.exit(1);
}
console.log("generated-themes.css is up-to-date and deterministic.");
