// PDF Generation Worker (Web Worker)
// Uses comlink for type-safe communication
import { expose } from "comlink";
import type { PDFWorkerAPI, PDFDocumentInput } from "./types/pdfWorkerTypes";

let pdfRenderer: typeof import("@react-pdf/renderer") | null = null;

async function loadPdfRenderer() {
  if (!pdfRenderer) {
    pdfRenderer = await import("@react-pdf/renderer");
  }
  return pdfRenderer;
}

const pdfWorker: PDFWorkerAPI = {
  async generatePdfBlob(document: PDFDocumentInput): Promise<Blob> {
    const { pdf } = await loadPdfRenderer();
    const instance = pdf(document);
    return await instance.toBlob();
  },
};

expose(pdfWorker);
