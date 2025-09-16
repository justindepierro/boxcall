import { readFileSync } from "fs";

import { describe, it, expect } from "vitest";

describe("generated-themes.css snapshot", () => {
  it("exists and is not empty", () => {
    const disk = readFileSync("src/styles/generated-themes.css", "utf8");
    expect(disk.length).toBeGreaterThan(20);
    expect(disk).toContain(":root");
  });
});
