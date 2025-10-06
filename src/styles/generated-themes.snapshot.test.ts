import { readFileSync } from "fs";

import { describe, it, expect } from "vitest";

describe("generated-tokens.css snapshot", () => {
  it("exists and is not empty", () => {
    const disk = readFileSync("src/styles/generated-tokens.css", "utf8");
    expect(disk.length).toBeGreaterThan(100);
    expect(disk).toContain(":root");
    expect(disk).toContain("--space-");
  });
});
