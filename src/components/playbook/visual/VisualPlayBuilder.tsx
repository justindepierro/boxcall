import React, { useState } from "react";
import { Construction } from "lucide-react";
import { Button } from "../../ui/Button/Button";
import { X, Save, Eye, Users, Route, Palette } from "lucide-react";
import type { Play } from "../../../types/play";
import { FieldCanvas } from "./FieldCanvas";
import { Typography } from "../../design-system/Typography";
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
        <div className="flex items-center justify-between bc-card-padding border-b border-subtle surface-subtle">
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
        {/* View Mode Tabs */}
        <div className="flex items-center border-b border-subtle bc-card-padding surface-subtle">
          {viewModeButtons.map((button) => {
            const Icon = button.icon;
            return (
              <Button
                key={button.id}
                onClick={() => setViewMode(button.id)}
                variant={viewMode === button.id ? "primary" : "ghost"}
                size="xs"
                className={`flex items-center px-4 py-2 h-auto font-medium border-b-2 rounded-none ${
                  viewMode === button.id
                    ? "border-jade-500"
                    : "border-transparent"
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {button.label}
              </Button>
            );
          })}
        </div>
        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-80 border-r border-subtle surface-subtle bc-card-padding overflow-y-auto">
            {viewMode === "field" && (
              <div className="space-y-6">
                <div>
                  <Typography
                    variant="headline-sm"
                    as="h3"
                    className="text-slate-900 mb-4"
                  >
                    Field View Options
                  </Typography>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Play Selection
                      </label>
                      <select
                        value={selectedPlay?.id || ""}
                        onChange={(e) => {
                          // TODO: Implement play selection from database
                          console.log(
                            "Play selection not yet implemented:",
                            e.target.value
                          );
                        }}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-jade-500 focus:border-jade-500"
                        disabled
                      >
                        <option value="">Select a play (coming soon)</option>
                      </select>
                    </div>
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-slate-300 text-jade-600 focus:ring-jade-500"
                          defaultChecked
                        />
                        <span className="ml-2 text-sm text-slate-700">
                          Show player labels
                        </span>
                      </label>
                    </div>
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-slate-300 text-jade-600 focus:ring-jade-500"
                          defaultChecked
                        />
                        <span className="ml-2 text-sm text-slate-700">
                          Show yard lines
                        </span>
                      </label>
                    </div>
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-slate-300 text-jade-600 focus:ring-jade-500"
                          defaultChecked
                        />
                        <span className="ml-2 text-sm text-slate-700">
                          Show hash marks
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg bc-card-padding border border-slate-200">
                  <h4 className="font-medium text-slate-900 mb-2">Play Info</h4>
                  {selectedPlay && (
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-slate-600">Type:</span>
                        <span className="ml-2 font-medium">
                          {selectedPlay.p_type}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-600">Formation:</span>
                        <span className="ml-2 font-medium">
                          {selectedPlay.formation}
                        </span>
                      </div>
                      {selectedPlay.protection && (
                        <div>
                          <span className="text-slate-600">Protection:</span>
                          <span className="ml-2 font-medium">
                            {selectedPlay.protection}
                          </span>
                        </div>
                      )}
                      <div>
                        <span className="text-slate-600">Confidence:</span>
                        <span className="ml-2 font-medium">
                          {selectedPlay.confidence_base}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            {viewMode === "players" && (
              <div className="space-y-6">
                <div>
                  <Typography
                    variant="headline-sm"
                    as="h3"
                    className="text-slate-900 mb-4"
                  >
                    Player Positions
                  </Typography>
                  <p className="text-sm text-slate-600 mb-4">
                    Drag and drop players to adjust their positions on the
                    field.
                  </p>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-sm text-amber-800">
                      <Construction
                        aria-label="construction"
                        className="inline h-4 w-4 align-middle text-current"
                      />{" "}
                      <strong>Coming Soon:</strong> Interactive player
                      positioning with drag-and-drop functionality.
                    </p>
                  </div>
                </div>
              </div>
            )}
            {viewMode === "routes" && (
              <div className="space-y-6">
                <div>
                  <Typography
                    variant="headline-sm"
                    as="h3"
                    className="text-slate-900 mb-4"
                  >
                    Route Drawing
                  </Typography>
                  <p className="text-sm text-slate-600 mb-4">
                    Click and drag to draw routes for each receiver.
                  </p>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-sm text-amber-800">
                      <Construction
                        aria-label="construction"
                        className="inline h-4 w-4 align-middle text-current"
                      />{" "}
                      <strong>Coming Soon:</strong> Interactive route drawing
                      with timing and depth indicators.
                    </p>
                  </div>
                </div>
              </div>
            )}
            {viewMode === "settings" && (
              <div className="space-y-6">
                <div>
                  <Typography
                    variant="headline-sm"
                    as="h3"
                    className="text-slate-900 mb-4"
                  >
                    Visual Settings
                  </Typography>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Field Orientation
                      </label>
                      <select className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-jade-500 focus:border-jade-500">
                        <option>Horizontal</option>
                        <option>Vertical</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Color Scheme
                      </label>
                      <select className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-jade-500 focus:border-jade-500">
                        <option>Standard</option>
                        <option>High Contrast</option>
                        <option>Colorblind Friendly</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
        <div className="border-t border-slate-200 bc-card-padding flex items-center justify-between">
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
