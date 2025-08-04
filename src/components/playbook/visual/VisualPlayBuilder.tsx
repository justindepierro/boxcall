import React, { useState } from "react";
import { X, Save, Eye, Users, Route, Palette } from "lucide-react";
import type { Play } from "../../../types/play";
import { FieldCanvas } from "./FieldCanvas";
import { getDemoPlays } from "../../../data/demoPlays";
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
  const [selectedPlay, setSelectedPlay] = useState<Play | undefined>(
    play || getDemoPlays({})[0] // Use first demo play if no play provided
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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-slate-900">
              Visual Play Builder
            </h2>
            {selectedPlay && (
              <div className="text-sm text-slate-600">
                <span className="font-medium">{selectedPlay.play_name}</span>
                {selectedPlay.formation && (
                  <span className="ml-2">• {selectedPlay.formation}</span>
                )}
                {selectedPlay.one_word_play && (
                  <span className="ml-2 text-emerald-600">
                    • "{selectedPlay.one_word_play}"
                  </span>
                )}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        {/* View Mode Tabs */}
        <div className="flex items-center border-b border-slate-200 px-6">
          {viewModeButtons.map((button) => {
            const Icon = button.icon;
            return (
              <button
                key={button.id}
                onClick={() => setViewMode(button.id)}
                className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 ${
                  viewMode === button.id
                    ? "border-emerald-500 text-emerald-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {button.label}
              </button>
            );
          })}
        </div>
        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-80 border-r border-slate-200 bg-slate-50 p-6 overflow-y-auto">
            {viewMode === "field" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-slate-900 mb-4">
                    Field View Options
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Play Selection
                      </label>
                      <select
                        value={selectedPlay?.id || ""}
                        onChange={(e) => {
                          const playId = e.target.value;
                          const plays = getDemoPlays({});
                          const play = plays.find((p) => p.id === playId);
                          setSelectedPlay(play);
                        }}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      >
                        {getDemoPlays({}).map((play) => (
                          <option key={play.id} value={play.id}>
                            {play.play_name} ({play.formation})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
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
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
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
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          defaultChecked
                        />
                        <span className="ml-2 text-sm text-slate-700">
                          Show hash marks
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-slate-200">
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
                  <h3 className="text-lg font-medium text-slate-900 mb-4">
                    Player Positions
                  </h3>
                  <p className="text-sm text-slate-600 mb-4">
                    Drag and drop players to adjust their positions on the
                    field.
                  </p>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-sm text-amber-800">
                      🚧 <strong>Coming Soon:</strong> Interactive player
                      positioning with drag-and-drop functionality.
                    </p>
                  </div>
                </div>
              </div>
            )}
            {viewMode === "routes" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-slate-900 mb-4">
                    Route Drawing
                  </h3>
                  <p className="text-sm text-slate-600 mb-4">
                    Click and drag to draw routes for each receiver.
                  </p>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-sm text-amber-800">
                      🚧 <strong>Coming Soon:</strong> Interactive route drawing
                      with timing and depth indicators.
                    </p>
                  </div>
                </div>
              </div>
            )}
            {viewMode === "settings" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-slate-900 mb-4">
                    Visual Settings
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Field Orientation
                      </label>
                      <select className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                        <option>Horizontal</option>
                        <option>Vertical</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Color Scheme
                      </label>
                      <select className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
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
          <div className="flex-1 p-6">
            <FieldCanvas
              play={selectedPlay}
              readOnly={false}
              className="w-full h-full"
            />
          </div>
        </div>
        {/* Footer */}
        <div className="border-t border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="text-sm text-slate-600">
            Phase 2: Visual Play Builder - Interactive field canvas with player
            positions
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-md hover:bg-emerald-700"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Diagram
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
