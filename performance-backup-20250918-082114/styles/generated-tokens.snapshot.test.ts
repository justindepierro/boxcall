import { readFileSync } from "fs";

import { describe, it, expect } from "vitest";

import { generateTokensCSS } from "../../scripts/lib/generateTokens";

describe("generated-tokens.css snapshot", () => {
  it("matches generator output", () => {
    const disk = readFileSync("src/styles/generated-tokens.css", "utf8");
    const fresh = generateTokensCSS();
    const normalize = (s: string) =>
      s
        .replace(/\r/g, "")
        .replace(/,\s+/g, ",")
        .replace(/\n\s+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    expect(normalize(disk)).toBe(normalize(fresh));
  });
});
