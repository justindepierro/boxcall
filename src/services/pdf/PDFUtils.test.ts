import { describe, it, expect } from "vitest";
import { PDFUtils } from "./BasePDFService";

describe("PDFUtils", () => {
  it("converts a blob to a data URL", async () => {
    const blob = new Blob(["test"], { type: "text/plain" });
    const dataUrl = await PDFUtils.blobToDataURL(blob);
    expect(dataUrl.startsWith("data:text/plain;base64"));
  });

  it("calculates margins for A4", () => {
    const margins = PDFUtils.calculateMargins(400, 600, "A4");
    expect(margins.top).toBeGreaterThan(0);
    expect(margins.left).toBeGreaterThan(0);
  });

  it("estimates page count", () => {
    const count = PDFUtils.estimatePageCount(10, 50, 842, {
      top: 40,
      bottom: 40,
    });
    expect(count).toBeGreaterThan(0);
  });

  it("generates metadata", () => {
    const meta = PDFUtils.generateMetadata("Test Title", "Author");
    expect(meta.title).toBe("Test Title");
    expect(meta.author).toBe("Author");
    expect(meta.creator).toBe("Practice Planner App");
  });
});
