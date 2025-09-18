// Types for PDF Worker
import type { DocumentProps } from "@react-pdf/renderer";

export type PDFDocumentInput = React.ReactElement<DocumentProps>;

export interface PDFWorkerAPI {
  generatePdfBlob(document: PDFDocumentInput): Promise<Blob>;
}
