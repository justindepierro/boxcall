import fs from "fs";
import path from "path";

import { describe, it, expect } from "vitest";

// Simple inventory test: ensure no 'variant="outline"' usages remain in calendar filters panel.
// (Lightweight safeguard until ESLint rule is added.)

describe("Calendar button variant inventory", () => {
  it("has no outline variant in CalendarFiltersPanel quick filters", () => {
    const file = path.resolve(
      __dirname,
      "../../calendar/CalendarFiltersPanel.tsx"
    );
    const content = fs.readFileSync(file, "utf-8");
    const outlineMatches = content.match(/variant="outline"/g) || [];
    expect(outlineMatches.length).toBe(0);
  });
});
