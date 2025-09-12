// Archived from src/components/playbook/visual/VisualPlayBuilder.tsx
// LEGACY: Deprecated VisualPlayBuilder (superseded by diagram-v2/VisualPlayBuilderV2)
// Confirmed unused as of 2025-08-14; retained here for reference.

import React, { useState } from "react";
import { Button } from "../../src/components/ui/Button/Button";
import { X, Save, Eye, Users, Route, Palette } from "lucide-react";
import { SegmentedControl } from "../../src/components/ui/SegmentedControl/SegmentedControl";
import type { Play } from "../../src/types/play";
// Use the archived shim to keep this self-contained
// Explicit extension to satisfy TS in archive context
import { FieldCanvas } from "./FieldCanvas.legacy-shim.tsx";
import { Typography } from "../../src/components/design-system/Typography";

interface VisualPlayBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  play?: Play;
  onSave?: (play: Play) => void;
}

type ViewMode = "field" | "players" | "routes" | "settings";

export const VisualPlayBuilder: React.FC<VisualPlayBuilderProps> = ({
  isOpen,
  onClose,
  play,
  onSave,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>("field");
  const [selectedPlay, _setSelectedPlay] = useState<Play | undefined>(
    play // Only use provided play, no fallback demo data
  );

  if (!isOpen) return null;

  const handleSave = () => {
    if (selectedPlay && onSave) {
      onSave(selectedPlay);
    }
    onClose();
  };

  const viewModeButtons = [
    { id: "field" as const, label: "Field View", icon: Eye },
    { id: "players" as const, label: "Players", icon: Users },
    { id: "routes" as const, label: "Routes", icon: Route },
    { id: "settings" as const, label: "Settings", icon: Palette },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="surface-card elevation-modal rounded-lg shadow-xl w-full max-w-7xl h-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between bc-card-padding panel-cupertino">
          <div className="flex items-center space-x-4">
            <Typography
              variant="headline-sm"
              as="h2"
              className="text-slate-900"
            >
              Visual Play Builder
            </Typography>
            {selectedPlay && (
              <div className="text-sm text-slate-600">
                <span className="font-medium">{selectedPlay.play_name}</span>
                {selectedPlay.formation && (
                  <span className="ml-2">• {selectedPlay.formation}</span>
                )}
                {selectedPlay.one_word_play && (
                  <span className="ml-2 text-jade-600">
                    • "{selectedPlay.one_word_play}"
                  </span>
                )}
              </div>
            )}
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="xs"
            className="text-slate-400 hover:text-slate-600 p-1 h-auto w-auto"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* View Mode Segmented Control */}
        <div className="flex items-center bc-card-padding panel-cupertino">
          <SegmentedControl
            ariaLabel="View mode"
            options={viewModeButtons.map((b) => ({
              id: b.id,
              label: b.label,
              icon: <b.icon className="w-4 h-4" />,
            }))}
            value={viewMode}
            onChange={(v) => setViewMode(v)}
          />
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-80 bc-card-padding overflow-y-auto panel-cupertino">
            {/* ...omitted for brevity; identical to original... */}
          </div>

          {/* Main Field Canvas */}
          <div className="flex-1 bc-card-padding">
            <FieldCanvas
              play={selectedPlay}
              readOnly={false}
              className="w-full h-full"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-subtle bc-card-padding flex items-center justify-between">
          <div className="text-sm text-slate-600">
            Phase 2: Visual Play Builder - Interactive field canvas with player
            positions
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="inline-flex items-center"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              variant="primary"
              size="sm"
              className="inline-flex items-center"
            >
              <Save className="h-4 w-4 mr-2" /> Save Diagram
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualPlayBuilder;
