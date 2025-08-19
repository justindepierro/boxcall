import { describe, it, expect } from "vitest";
import { iconLoaders } from "../iconSingletons";
import type { ModularIconName } from "../ModularIcon";
import iconNames from "../criticalIcons.json";

describe("Icon coverage", () => {
  it("should have loader for every used icon", () => {
    for (const name of iconNames) {
      expect(iconLoaders[name as ModularIconName]).toBeDefined();
    }
  });
});
