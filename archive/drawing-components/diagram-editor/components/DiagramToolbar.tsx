/**
 * DiagramToolbar Component
 *
 * Renders the main toolbar UI for the diagram editor.
 * Extracted from the monolithic DiagramEditor component for better maintainability.
 */

import React from "react";
import { Icon } from "../../../../components/ui/Icon/Icon";
import { TipsPopover } from "./TipsPopover";
import { DIAGRAM_EDITOR_TIPS } from "../constants/editorTips";
import { RouteToolbar } from "./RouteToolbar";
import type { DiagramFieldPosition } from "../types/types";
import type { FieldColorMode } from "../layers/FieldLayer";

interface DiagramToolbarProps {
  // Personnel info
  personnelName?: string;
  personnelConfig?: { description?: string } | null;

  // Route toolbar props
  activeTool: string;
  selectedRouteType: "primary" | "hot" | "check";
  selectedRouteId: string | null;
  onToolChange: (tool: string) => void;
  onRouteTypeChange: (type: "primary" | "hot" | "check") => void;

  // Toolbar handlers
  handleAddSingleOffense: () => void;
  handleAddSingleDefense: () => void;
  handleDeleteSelected: () => void;
  handleClearOffense: () => void;
  handleClearDefense: () => void;
  handleClearWhiteboard: () => void;
  handleAlignmentChange: (alignment: "left" | "middle" | "right") => void;
  selectedAlignment: "left" | "middle" | "right";

  // Player counts for button states
  offensePlayerCount: number;
  defensePlayerCount: number;
  totalPlayerCount: number;
  selectedPlayerId: string | null;

  // Formations
  formations: any[];
  onShowFormationPicker: () => void;

  // Field controls
  fieldPosition: DiagramFieldPosition;
  colorMode: FieldColorMode;
  onFieldPositionChange: (position: DiagramFieldPosition) => void;
  onColorModeChange: () => void;

  // Heat map
  showHeatMap?: boolean;
  onToggleHeatMap?: () => void;

  // Version control
  showVersionHistory?: boolean;
  onToggleVersionHistory?: () => void;

  // Analytics
  showAnalytics?: boolean;
  onToggleAnalytics?: () => void;

  // Save state
  isDirty: boolean;
  onSave: () => void;
  saveStatus: string;
  lastSaved: string | null;
}

export const DiagramToolbar: React.FC<DiagramToolbarProps> = ({
  personnelName,
  personnelConfig,
  activeTool,
  selectedRouteType,
  selectedRouteId,
  onToolChange,
  onRouteTypeChange,
  handleAddSingleOffense,
  handleAddSingleDefense,
  handleDeleteSelected,
  handleClearOffense,
  handleClearDefense,
  handleClearWhiteboard,
  handleAlignmentChange,
  selectedAlignment,
  offensePlayerCount,
  defensePlayerCount,
  totalPlayerCount,
  selectedPlayerId,
  formations,
  onShowFormationPicker,
  fieldPosition,
  colorMode,
  onFieldPositionChange,
  onColorModeChange,
  showHeatMap = false,
  onToggleHeatMap,
  showVersionHistory = false,
  onToggleVersionHistory,
  showAnalytics = false,
  onToggleAnalytics,
  isDirty,
  onSave,
  saveStatus,
  lastSaved,
}) => {
  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-surface-card border-b border-border">
        <div className="flex items-center gap-4">
          {/* Title */}
          <h1 className="text-xl font-bold text-content-primary flex items-center gap-2">
            <Icon name="pen-tool" size="lg" />
            Diagram Editor
          </h1>

          {/* Personnel Badge - Show if play has personnel assigned */}
          {personnelName && (
            <div className="flex items-center gap-2 pl-4 border-l border-border">
              <span className="text-xs text-content-secondary">Personnel:</span>
              <div className="px-3 py-1.5 rounded-full bg-jade-600 text-white text-xs font-bold shadow-sm flex items-center gap-1.5">
                <Icon name="users" size="sm" />
                <span>{personnelName}</span>
                {personnelConfig?.description && (
                  <span className="text-jade-100 font-normal">
                    ({personnelConfig.description})
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Route Drawing Tools */}
          <RouteToolbar
            activeTool={
              activeTool === "draw-route" || activeTool === "edit-waypoint"
                ? activeTool
                : "select"
            }
            selectedRouteType={selectedRouteType}
            isRouteSelected={!!selectedRouteId}
            onToolChange={onToolChange}
            onRouteTypeChange={onRouteTypeChange}
          />

          {/* Toolbar Controls */}
          <div className="flex items-center gap-2 pl-4 border-l border-border">
            {/* Add Players */}
            <button
              onClick={handleAddSingleOffense}
              className="px-4 py-1.5 text-xs bg-blue-500 text-white hover:bg-blue-600 rounded-full font-medium transition-colors flex items-center gap-1.5 shadow-sm"
              title="Add Offense Player"
            >
              <Icon name="plus-circle" size="sm" />
              <span>Offense</span>
            </button>
            <button
              onClick={handleAddSingleDefense}
              className="px-4 py-1.5 text-xs bg-error-500 text-white hover:bg-error-600 rounded-full font-medium transition-colors flex items-center gap-1.5 shadow-sm"
              title="Add Defense Player"
            >
              <Icon name="plus-circle" size="sm" />
              <span>Defense</span>
            </button>

            {/* Load Formation */}
            <button
              onClick={onShowFormationPicker}
              disabled={!formations || formations.length === 0}
              className={`px-4 py-1.5 text-xs rounded-full font-medium transition-colors flex items-center gap-1.5 shadow-sm ${
                formations && formations.length > 0
                  ? "bg-jade-600 text-white hover:bg-jade-700"
                  : "bg-surface-tertiary text-content-tertiary cursor-not-allowed opacity-50"
              }`}
              title={
                formations && formations.length > 0
                  ? "Load Formation (Ctrl+Shift+F)"
                  : "No formations available"
              }
            >
              <Icon name="grid" size="sm" />
              <span>Load Formation</span>
            </button>

            {/* Divider */}
            <div className="w-px h-6 bg-border"></div>

            {/* Alignment Toggle */}
            <div className="flex items-center gap-1">
              <span className="text-xs text-content-secondary mr-1.5">
                Hash:
              </span>
              <button
                onClick={() => handleAlignmentChange("left")}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1 shadow-sm ${
                  selectedAlignment === "left"
                    ? "bg-jade-600 text-white"
                    : "bg-surface-secondary text-content-secondary hover:bg-surface-tertiary"
                }`}
                title="Align to Left Hash"
              >
                <Icon name="arrow-left" size="sm" />
                <span>Left</span>
              </button>
              <button
                onClick={() => handleAlignmentChange("middle")}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1 shadow-sm ${
                  selectedAlignment === "middle"
                    ? "bg-jade-600 text-white"
                    : "bg-surface-secondary text-content-secondary hover:bg-surface-tertiary"
                }`}
                title="Align to Middle"
              >
                <Icon name="circle" size="sm" />
                <span>Mid</span>
              </button>
              <button
                onClick={() => handleAlignmentChange("right")}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1 shadow-sm ${
                  selectedAlignment === "right"
                    ? "bg-jade-600 text-white"
                    : "bg-surface-secondary text-content-secondary hover:bg-surface-tertiary"
                }`}
                title="Align to Right Hash"
              >
                <Icon name="arrow-right" size="sm" />
                <span>Right</span>
              </button>
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-border"></div>

            {/* Undo/Redo */}
            <button
              onClick={() => alert("Undo coming soon! Use Ctrl/Cmd+Z")}
              disabled={true}
              className="px-3 py-1.5 text-xs bg-surface-tertiary text-content-tertiary rounded-full font-medium cursor-not-allowed opacity-50 flex items-center gap-1"
              title="Undo (Coming Soon)"
            >
              <Icon name="undo" size="sm" />
              <span>Undo</span>
            </button>
            <button
              onClick={() => alert("Redo coming soon! Use Ctrl/Cmd+Shift+Z")}
              disabled={true}
              className="px-3 py-1.5 text-xs bg-surface-tertiary text-content-tertiary rounded-full font-medium cursor-not-allowed opacity-50 flex items-center gap-1"
              title="Redo (Coming Soon)"
            >
              <Icon name="undo" size="sm" />
              <span>Redo</span>
            </button>

            {/* Divider */}
            <div className="w-px h-6 bg-border"></div>

            {/* Delete/Clear */}
            <button
              onClick={handleDeleteSelected}
              disabled={!selectedPlayerId}
              className={`px-3 py-1.5 text-xs rounded-full font-medium transition-colors flex items-center gap-1 shadow-sm ${
                selectedPlayerId
                  ? "bg-gray-600 text-white hover:bg-gray-700"
                  : "bg-surface-tertiary text-content-tertiary cursor-not-allowed opacity-50"
              }`}
              title="Delete Selected Player"
            >
              <Icon name="delete" size="sm" />
              <span>Delete</span>
            </button>
            <button
              onClick={handleClearOffense}
              disabled={offensePlayerCount === 0}
              className={`px-3 py-1.5 text-xs rounded-full font-medium transition-colors flex items-center gap-1 shadow-sm ${
                offensePlayerCount > 0
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-surface-tertiary text-content-tertiary cursor-not-allowed opacity-50"
              }`}
              title="Clear All Offense"
            >
              <Icon name="close" size="sm" />
              <span>Clear O</span>
            </button>
            <button
              onClick={handleClearDefense}
              disabled={defensePlayerCount === 0}
              className={`px-3 py-1.5 text-xs rounded-full font-medium transition-colors flex items-center gap-1 shadow-sm ${
                defensePlayerCount > 0
                  ? "bg-error-600 text-white hover:bg-error-700"
                  : "bg-surface-tertiary text-content-tertiary cursor-not-allowed opacity-50"
              }`}
              title="Clear All Defense"
            >
              <Icon name="close" size="sm" />
              <span>Clear D</span>
            </button>
            <button
              onClick={handleClearWhiteboard}
              disabled={totalPlayerCount === 0}
              className={`px-3 py-1.5 text-xs rounded-full font-medium transition-colors flex items-center gap-1 shadow-sm ${
                totalPlayerCount > 0
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-surface-tertiary text-content-tertiary cursor-not-allowed opacity-50"
              }`}
              title="Clear All Players"
            >
              <Icon name="delete" size="sm" />
              <span>Clear All</span>
            </button>

            {/* Divider */}
            <div className="w-px h-6 bg-border"></div>

            {/* Quick Tips */}
            <TipsPopover tips={DIAGRAM_EDITOR_TIPS} side="bottom" align="end" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Field Position Selector */}
          <select
            value={fieldPosition}
            onChange={(e) =>
              onFieldPositionChange(e.target.value as DiagramFieldPosition)
            }
            className="px-3 py-1.5 rounded-md bg-surface-secondary hover:bg-surface-tertiary text-content-primary transition-colors text-sm font-medium border border-border cursor-pointer"
            title="Select field position"
          >
            <option value="midfield">Midfield</option>
            <option value="backed-up">Backed Up</option>
            <option value="red-zone">Red Zone</option>
            <option value="free-draw">Free Draw</option>
          </select>

          {/* Color Mode Toggle */}
          <button
            onClick={onColorModeChange}
            className="px-3 py-1.5 rounded-md bg-surface-secondary hover:bg-surface-tertiary text-content-primary transition-colors text-sm font-medium border border-border flex items-center gap-2"
            title="Toggle field color mode"
          >
            <Icon name="sun" size="sm" />
            {colorMode === "jade" && "Jade"}
            {colorMode === "blackwhite" && "B&W"}
            {colorMode === "darkgray" && "Dark"}
          </button>

          {/* Heat Map Toggle */}
          {onToggleHeatMap && (
            <button
              onClick={onToggleHeatMap}
              className={`px-3 py-1.5 rounded-md transition-colors text-sm font-medium border flex items-center gap-2 ${
                showHeatMap
                  ? "bg-orange-600 text-white border-orange-600"
                  : "bg-surface-secondary hover:bg-surface-tertiary text-content-primary border-border"
              }`}
              title={
                showHeatMap
                  ? "Hide execution heat map"
                  : "Show execution heat map"
              }
            >
              <Icon name="zap" size="sm" />
              <span>Heat Map</span>
            </button>
          )}

          {/* Version History Toggle */}
          {onToggleVersionHistory && (
            <button
              onClick={onToggleVersionHistory}
              className={`px-3 py-1.5 rounded-md transition-colors text-sm font-medium border flex items-center gap-2 ${
                showVersionHistory
                  ? "bg-purple-600 text-white border-purple-600"
                  : "bg-surface-secondary hover:bg-surface-tertiary text-content-primary border-border"
              }`}
              title={
                showVersionHistory
                  ? "Hide version history"
                  : "Show version history"
              }
            >
              <Icon name="clock" size="sm" />
              <span>Versions</span>
            </button>
          )}

          {/* Analytics Toggle */}
          {onToggleAnalytics && (
            <button
              onClick={onToggleAnalytics}
              className={`px-3 py-1.5 rounded-md transition-colors text-sm font-medium border flex items-center gap-2 ${
                showAnalytics
                  ? "bg-jade-600 text-white border-jade-600"
                  : "bg-surface-secondary hover:bg-surface-tertiary text-content-primary border-border"
              }`}
              title={
                showAnalytics ? "Hide route analytics" : "Show route analytics"
              }
            >
              <Icon name="bar-chart" size="sm" />
              <span>Analytics</span>
            </button>
          )}

          {/* Save Button */}
          <button
            onClick={onSave}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              isDirty
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-surface-secondary text-content-secondary cursor-not-allowed"
            }`}
            disabled={!isDirty}
            title={isDirty ? "Save play" : "No changes to save"}
          >
            <Icon name="save" size="sm" />
            <span>Save</span>
            {saveStatus === "saving" && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            {saveStatus === "saved" && lastSaved && (
              <span className="text-xs opacity-75">
                {new Date(lastSaved).toLocaleTimeString()}
              </span>
            )}
          </button>
        </div>
      </div>
    </>
  );
};
