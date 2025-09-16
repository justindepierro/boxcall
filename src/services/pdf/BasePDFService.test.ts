import { describe, it, expect } from "vitest";
import { PDFError } from "./types";
import { BasePDFService } from "./BasePDFService";

describe("BasePDFService", () => {
  class TestPDFService extends BasePDFService {
    exportToPDF() {
      return Promise.resolve(new Blob());
    }
    downloadPDF() {
      return Promise.resolve();
    }
    previewPDF() {
      return Promise.resolve("");
    }
  }

  it("generates a filename with timestamp", () => {
    const svc = new TestPDFService();
    const name = svc["generateFilename"]("test");
    expect(name.startsWith("test_")).toBe(true);
    expect(name.endsWith(".pdf")).toBe(true);
  });

  it("throws on invalid options", () => {
    const svc = new TestPDFService();
    expect(() => svc["validateOptions"]({ format: "bad" as any })).toThrow(
      PDFError
    );
  });

  it("returns default template", () => {
    const svc = new TestPDFService();
    const tpl = svc["getDefaultTemplate"]();
    expect(tpl.pageFormat).toBe("A4");
  });
});
