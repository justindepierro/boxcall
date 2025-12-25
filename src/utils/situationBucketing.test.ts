import { describe, it, expect } from "vitest";

import {
  bucketDistance,
  bucketDownDistance,
  bucketFieldZone,
  getCustomSituationColorByLabel,
  getFieldZoneColorByLabel,
} from "./situationBucketing";

describe("situationBucketing", () => {
  it("buckets field zones with defaults", () => {
    expect(bucketFieldZone(null, null)).toBe("Unknown");
    expect(bucketFieldZone(null, 10)).toBe("Backed Up");
    expect(bucketFieldZone(null, 30)).toBe("Open Field");
    expect(bucketFieldZone(null, 60)).toBe("Plus Territory");
    expect(bucketFieldZone(null, 85)).toBe("Red Zone");
    expect(bucketFieldZone(null, 99)).toBe("Goal Line");
  });

  it("buckets distances with defaults", () => {
    expect(bucketDistance(null, null)).toBe("Unknown");
    expect(bucketDistance(null, 1)).toBe("Short");
    expect(bucketDistance(null, 6)).toBe("Medium");
    expect(bucketDistance(null, 9)).toBe("Long");
    expect(bucketDistance(null, 20)).toBe("Very Long");
  });

  it("creates down & distance label", () => {
    expect(bucketDownDistance(null, null, 5)).toBe("Unknown");
    expect(bucketDownDistance(null, 3, 9)).toBe("3rd & Long");
    expect(bucketDownDistance(null, 1, null)).toBe("1st");
  });

  it("resolves field zone colors by legacy label and id", () => {
    const teamDefs: any = {
      field_zones_v2: [
        {
          id: "red_zone",
          label: "High Red",
          start_yard_line: 80,
          end_yard_line: 95,
          color: "purple",
        },
      ],
    };

    // Old plays may still store the default legacy label.
    expect(getFieldZoneColorByLabel(teamDefs, "Red Zone")).toBe("purple");

    // Some callers may store the id.
    expect(getFieldZoneColorByLabel(teamDefs, "red_zone")).toBe("purple");
  });

  it("resolves custom situation colors by label or id", () => {
    const teamDefs: any = {
      custom_situations: [
        {
          id: "two_minute",
          label: "2-Minute",
          color: "amber",
        },
      ],
    };

    expect(getCustomSituationColorByLabel(teamDefs, "2-Minute")).toBe("amber");
    expect(getCustomSituationColorByLabel(teamDefs, "two_minute")).toBe(
      "amber"
    );
  });
});
