/**
 * PracticeScriptModalLoader Component
 * Extracted from PlaybookPage.tsx - Lazy loads PracticeScriptModal with suspense fallback
 */

import React from "react";

// Lazy load modal component
const PracticeScriptModal = React.lazy(() =>
  import("../../../components/practice/PracticeScriptModal").then((module) => ({
    default: module.PracticeScriptModal,
  }))
);

interface PracticeScriptModalLoaderProps {
  show: boolean;
  editingScript: any;
  onClose: () => void;
  onSave: (script: unknown) => void;
}

export function PracticeScriptModalLoader({
  show,
  editingScript,
  onClose,
  onSave,
}: PracticeScriptModalLoaderProps) {
  if (!show) return null;

  return (
    <React.Suspense
      fallback={
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-modal">
          <div className="text-white">Loading...</div>
        </div>
      }
    >
      <PracticeScriptModal
        editingScript={editingScript ?? undefined}
        onClose={onClose}
        onSave={onSave}
      />
    </React.Suspense>
  );
}
