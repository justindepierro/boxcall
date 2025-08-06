/**
 * Lazy-loaded PDF Export Dialog
 *
 * This component dynamically imports the heavy PDF generation libraries
 * only when the user actually wants to export, reducing initial bundle size by ~1.4MB
 */
import React, { Suspense, lazy } from "react";
import { Icon } from "../ui/Icon/Icon";
import { Button } from "../ui/Button/Button";
import type { PracticeBlock } from "./types";

// Lazy load the heavy PDF components
const PracticePDFExportDialog = lazy(() =>
  import("./PracticePDFExportDialog").then((module) => ({
    default: module.PracticePDFExportDialog,
  }))
);

interface LazyPDFExportProps {
  isOpen: boolean;
  onClose: () => void;
  practiceData: {
    title?: string;
    date?: string;
    duration?: number;
    location?: string;
    weather?: string;
    blocks?: PracticeBlock[];
    coaches?: Array<{
      id: string;
      name: string;
      role: string;
      assignments?: string[];
    }>;
    equipment?: Array<{
      item: string;
      quantity?: number;
      location?: string;
    }>;
    summary?: {
      categoryBreakdown: Record<string, number>;
      objectives?: string[];
    };
  };
}

const PDFLoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    <span className="ml-3 text-gray-600">Loading PDF Export...</span>
  </div>
);

export const LazyPDFExport: React.FC<LazyPDFExportProps> = ({
  isOpen,
  onClose,
  practiceData,
}) => {
  if (!isOpen) return null;

  return (
    <Suspense fallback={<PDFLoadingSpinner />}>
      <PracticePDFExportDialog
        isOpen={isOpen}
        onClose={onClose}
        practiceData={practiceData}
      />
    </Suspense>
  );
};

// Also export a lazy PDF trigger button
interface PDFExportTriggerProps {
  practiceData: {
    title?: string;
    date?: string;
    duration?: number;
    location?: string;
    weather?: string;
    blocks?: PracticeBlock[];
    coaches?: Array<{
      id: string;
      name: string;
      role: string;
      assignments?: string[];
    }>;
    equipment?: Array<{
      item: string;
      quantity?: number;
      location?: string;
    }>;
    summary?: {
      categoryBreakdown: Record<string, number>;
      objectives?: string[];
    };
  };
  children?: React.ReactNode;
}

export const PDFExportTrigger: React.FC<PDFExportTriggerProps> = ({
  practiceData,
  children,
}) => {
  const [showPDFDialog, setShowPDFDialog] = React.useState(false);

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setShowPDFDialog(true)}
        className="gap-2"
      >
        <Icon name="download" size={16} />
        {children || "Export PDF"}
      </Button>

      <LazyPDFExport
        isOpen={showPDFDialog}
        onClose={() => setShowPDFDialog(false)}
        practiceData={practiceData}
      />
    </>
  );
};
