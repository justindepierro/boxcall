/**
 * FormationBuilderModal - Tabbed Interface (Redesigned)
 *
 * Unified formation management with three modes:
 * - Tab 1: Edit Details - Set personnel, category, tags, description
 * - Tab 2: Link Formations - Connect left/right variants
 * - Tab 3: Draw Formation - Visual canvas builder (Phase 3 - Coming Soon)
 *
 * This gives coaches one place to manage all formation workflows.
 */

import React, { useState } from "react";
import { Modal } from "../../ui/Modal/Modal";
import { Button } from "../../ui/Button/Button";
import { Typography } from "../../design-system/Typography";
import { Link2, Pencil, Settings } from "lucide-react";
import { FormationLinkingPanel } from "../../formations/FormationLinkingPanel";
import { FormationBuilderPanel } from "../../formations/FormationBuilderPanel";
import type { Formation } from "../../../types/formation";
import { useIsMobile } from "@hooks/useBreakpoint";
import { triggerHapticFeedback } from "../../../lib/hapticFeedback";

interface FormationBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  playbookId: string;
  formationId?: string; // For editing existing formation
  onSaved?: (formation?: Formation) => void;
}

type TabType = "edit" | "link" | "draw";

export function FormationBuilderModal({
  isOpen,
  onClose,
  playbookId,
  formationId,
  onSaved,
}: FormationBuilderModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("edit");
  const [linkTabKey, setLinkTabKey] = useState(0);
  const isMobile = useIsMobile();

  // If we're editing a specific formation, default to edit tab
  React.useEffect(() => {
    if (formationId) {
      setActiveTab("edit");
    } else {
      setActiveTab("edit");
    }
  }, [formationId, isOpen]);

  const handleSuccess = (formation?: Formation) => {
    // Refresh Link tab data when formations change
    setLinkTabKey((prev) => prev + 1);
    if (onSaved) {
      onSaved(formation);
    }
    // Don't auto-close - let user continue working
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Formation Manager"
      size={isMobile ? "fullscreen" : "xl"}
    >
      <div className="flex flex-col h-full">
        {/* Tab Navigation - Mobile optimized */}
        <div className="flex border-b border-border-primary bg-surface-secondary">
          <button
            onClick={() => {
              triggerHapticFeedback("light");
              setActiveTab("edit");
            }}
            className={`
              flex-1 ${isMobile ? "py-spacing-lg" : "py-spacing-md"} px-spacing-md
              flex flex-col ${isMobile ? "gap-spacing-xs" : "flex-row gap-spacing-xs"}
              items-center justify-center
              font-medium transition-colors
              ${isMobile ? "min-h-[60px]" : ""}
              ${
                activeTab === "edit"
                  ? "bg-surface-primary text-text-primary border-b-2 border-primary-500"
                  : "text-text-muted hover:text-text-secondary hover:bg-surface-muted"
              }
            `}
          >
            <Settings className={isMobile ? "w-6 h-6" : "w-5 h-5"} />
            <span className={`font-medium ${isMobile ? "text-xs" : ""}`}>
              {isMobile ? "Edit" : "Edit Details"}
            </span>
          </button>

          <button
            onClick={() => {
              triggerHapticFeedback("light");
              setActiveTab("link");
              setLinkTabKey((prev) => prev + 1); // Refresh link tab data
            }}
            className={`
              flex-1 ${isMobile ? "py-spacing-lg" : "py-spacing-md"} px-spacing-md
              flex flex-col ${isMobile ? "gap-spacing-xs" : "flex-row gap-spacing-xs"}
              items-center justify-center
              font-medium transition-colors
              ${isMobile ? "min-h-[60px]" : ""}
              ${
                activeTab === "link"
                  ? "bg-surface-primary text-text-primary border-b-2 border-primary-500"
                  : "text-text-muted hover:text-text-secondary hover:bg-surface-muted"
              }
            `}
          >
            <Link2 className={isMobile ? "w-6 h-6" : "w-5 h-5"} />
            <span className={`font-medium ${isMobile ? "text-xs" : ""}`}>
              Link
            </span>
          </button>

          <button
            onClick={() => {
              triggerHapticFeedback("light");
              setActiveTab("draw");
            }}
            className={`
              flex-1 ${isMobile ? "py-spacing-lg" : "py-spacing-md"} px-spacing-md
              flex flex-col ${isMobile ? "gap-spacing-xs" : "flex-row gap-spacing-xs"}
              items-center justify-center
              font-medium transition-colors relative
              ${isMobile ? "min-h-[60px]" : ""}
              ${
                activeTab === "draw"
                  ? "bg-surface-primary text-text-primary border-b-2 border-primary-500"
                  : "text-text-muted hover:text-text-secondary hover:bg-surface-muted"
              }
            `}
          >
            <Pencil className={isMobile ? "w-6 h-6" : "w-5 h-5"} />
            <span className={`font-medium ${isMobile ? "text-xs" : ""}`}>
              Draw
            </span>
            <span className="absolute top-1 right-1 px-spacing-xs py-0.5 bg-warning-100 text-warning-700 text-xs rounded">
              Soon
            </span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-auto">
          {activeTab === "edit" && (
            <FormationBuilderPanel
              playbookId={playbookId}
              onFormationUpdated={handleSuccess}
              showHeader={false}
            />
          )}

          {activeTab === "link" && (
            <FormationLinkingPanel
              key={linkTabKey} // Force re-mount to reload formations
              playbookId={playbookId}
              onSuccess={handleSuccess}
              initialLeftFormation={null}
              initialRightFormation={null}
            />
          )}

          {activeTab === "draw" && (
            <div
              className="flex flex-col items-center justify-center h-full p-spacing-xl bg-surface-muted"
              style={{ minHeight: "500px" }}
            >
              <div className="text-center max-w-md space-y-spacing-md">
                <div className="text-6xl mb-spacing-md">✏️</div>
                <Typography variant="headline-lg" className="text-text-primary">
                  Visual Formation Builder
                </Typography>
                <Typography variant="body-md" className="text-text-secondary">
                  Drag-and-drop canvas for positioning players visually is
                  coming soon!
                </Typography>
                <div className="mt-spacing-lg p-spacing-md bg-surface-secondary rounded-lg border border-border-primary">
                  <Typography variant="caption" className="text-text-muted">
                    <strong>Phase 3 Features (Coming Soon):</strong>
                  </Typography>
                  <ul className="mt-spacing-sm text-left text-text-secondary space-y-spacing-xs text-sm">
                    <li>• Drag players to position on field</li>
                    <li>• Personnel package integration</li>
                    <li>• Strength player marking</li>
                    <li>• Auto-create Left/Right variants</li>
                    <li>• Export to diagram templates</li>
                  </ul>
                </div>
                <div className="mt-spacing-md">
                  <Button
                    onClick={() => setActiveTab("link")}
                    variant="primary"
                  >
                    Try Formation Linking →
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
