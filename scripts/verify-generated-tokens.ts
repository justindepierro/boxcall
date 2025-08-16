#!/usr/bin/env ts-node
/**
 * Verifies that the on-disk generated-tokens.css matches current token source.
 * Exits with non-zero code if drift is detected (for CI).
 */
import { readFileSync } from "fs";
import { generateTokensCSS } from "./lib/generateTokens";

const current = readFileSync("src/styles/generated-tokens.css", "utf8");
const expected = generateTokensCSS();

// Normalization for tolerant comparison: collapse single vs multi-line box-shadow formatting and ignore comma spacing in font stacks
function normalizeLines(lines: string[]): string[] {
  const out: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s{2}--elevation-.*:$/.test(line)) {
      // Merge following indented value line(s) until next token or closing brace
      let merged = line.replace(/:$/, ":");
      i++;
      while (i < lines.length && /^\s{4}\S/.test(lines[i])) {
        merged += " " + lines[i].trim();
        i++;
      }
      i--; // step back one after loop
      out.push(merged);
    } else {
      out.push(line);
    }
  }
  return out.map((l) => l.replace(/,\s+/g, ",").replace(/\s+$/g, ""));
}

if (current !== expected) {
  const currentLines = current.split(/\r?\n/);
  const expectedLines = expected.split(/\r?\n/);
  let diffCount = 0;
  const diffs: string[] = [];
  const normCurrent = normalizeLines(currentLines);
  const normExpected = normalizeLines(expectedLines);
  for (let i = 0; i < Math.max(normCurrent.length, normExpected.length); i++) {
    if (normCurrent[i] !== normExpected[i]) {
      diffCount++;
      if (diffs.length < 15) {
        diffs.push(
          `Line ${i + 1}:\n  expected: ${normExpected[i] ?? "<missing>"}\n  found:    ${normCurrent[i] ?? "<missing>"}`
        );
      }
    }
  }
  if (diffCount === 0) {
    // Only formatting/newline differences that normalize away
    console.log("generated-tokens.css is up-to-date.");
    process.exit(0);
  }
  console.error(
    `generated-tokens.css drift detected (first ${diffs.length} mismatches shown, total ${diffCount}).`
  );
  if (diffs.length) console.error(diffs.join("\n"));
  process.exit(1);
}
console.log("generated-tokens.css is up-to-date.");
