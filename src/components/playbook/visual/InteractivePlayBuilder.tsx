import React, { useState, useMemo, useCallback } from "react";
import {
  X,
  Eye,
  Users,
  Route,
  Play as PlayIcon,
  Pause,
  RotateCcw,
} from "lucide-react";
import { EnhancedFieldCanvas } from "./EnhancedFieldCanvas";
import type { Play } from "../../../types/play";
interface InteractivePlayBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  play?: Play;
  onSave?: (play: Play) => void;
}
type EditMode = "view" | "move" | "draw";
export const InteractivePlayBuilder: React.FC<InteractivePlayBuilderProps> = ({
  isOpen,
  onClose,
  play,
  onSave,
}) => {
  const [editMode, setEditMode] = useState<EditMode>("view");
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showYardLines, setShowYardLines] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  // Demo play data if none provided
  const currentPlay: Play = useMemo(
    () =>
      play || {
        id: "demo-play",
        playbook_id: "demo-playbook",
        play_name: "Quick Slant Concept",
        one_word_play: "Slant",
        formation: "Shotgun",
        p_type: "Pass",
        description: "Quick 3-step drop with slant routes to both sides",
        personnel: "11 Personnel",
        tags: ["quick-game", "slant", "concept"],
        confidence_base: 85,
        times_called: 12,
        times_successful: 9,
        success_rate: 75,
        created_by: "demo-user",
        created_at: new Date(),
        updated_at: new Date(),
      },
    [play]
  );
  const handlePlayerMove = useCallback(
    (_playerId: string, _x: number, _y: number) => {
      // In a real implementation, this would update the play data
    },
    []
  );
  const handleModeChange = useCallback((mode: EditMode) => {
    setEditMode(mode);
    if (mode !== "draw") {
      setSelectedPlayerId(null);
    }
  }, []);
  const handlePlayAnimation = useCallback(() => {
    setIsPlaying(!isPlaying);
    // In a real implementation, this would animate the play execution
  }, [isPlaying]);
  const handleReset = useCallback(() => {
    setEditMode("view");
    setSelectedPlayerId(null);
    setIsPlaying(false);
  }, []);
  const handleSave = useCallback(() => {
    if (onSave) {
      onSave(currentPlay);
    }
    onClose();
  }, [currentPlay, onSave, onClose]);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[95vw] h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Interactive Play Builder
            </h2>
            <p className="text-sm text-gray-600">
              {currentPlay.play_name} - {currentPlay.formation} Formation
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
            {/* Mode Controls */}
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Edit Mode
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleModeChange("view")}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    editMode === "view"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Eye className="w-4 h-4" />
                  View Only
                </button>
                <button
                  onClick={() => handleModeChange("move")}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    editMode === "move"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Move Players
                </button>
                <button
                  onClick={() => handleModeChange("draw")}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    editMode === "draw"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Route className="w-4 h-4" />
                  Draw Routes
                </button>
              </div>
            </div>
            {/* Animation Controls */}
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Animation
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={handlePlayAnimation}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <PlayIcon className="w-4 h-4" />
                  )}
                  {isPlaying ? "Pause" : "Play"}
                </button>
                <button
                  onClick={handleReset}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  title="Reset to formation"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
            {/* Display Options */}
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Display
              </h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={showYardLines}
                    onChange={(e) => setShowYardLines(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-gray-700">Yard lines</span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={showLabels}
                    onChange={(e) => setShowLabels(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-gray-700">Player labels</span>
                </label>
              </div>
            </div>
            {/* Play Information */}
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Play Info
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Type:</span>{" "}
                  {currentPlay.p_type}
                </div>
                <div>
                  <span className="font-medium">Personnel:</span>{" "}
                  {currentPlay.personnel}
                </div>
                <div>
                  <span className="font-medium">Formation:</span>{" "}
                  {currentPlay.formation}
                </div>
                {currentPlay.success_rate && (
                  <div>
                    <span className="font-medium">Success Rate:</span>{" "}
                    {Math.round(currentPlay.success_rate * 100)}%
                  </div>
                )}
              </div>
            </div>
            {/* Instructions */}
            <div className="mt-auto p-4 border-t border-gray-200">
              <div className="text-xs text-gray-600 space-y-1">
                {editMode === "move" && (
                  <p>Drag players to reposition them on the field</p>
                )}
                {editMode === "draw" && (
                  <>
                    <p>1. Select a player by clicking</p>
                    <p>2. Click to draw route points</p>
                    <p>3. Double-click to finish route</p>
                    <p>4. Right-click to cancel</p>
                  </>
                )}
                {editMode === "view" && (
                  <p>Use the controls above to edit the play</p>
                )}
              </div>
            </div>
          </div>
          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Field Canvas */}
            <div className="flex-1 p-6">
              <div className="h-full bg-gradient-to-b from-green-50 to-green-100 rounded-lg border-2 border-green-200 overflow-hidden shadow-inner">
                <EnhancedFieldCanvas
                  play={currentPlay}
                  readOnly={editMode === "view"}
                  onPlayerMove={
                    editMode === "move" ? handlePlayerMove : undefined
                  }
                  className="w-full h-full"
                  lineOfScrimmage={
                    currentPlay?.formation === "Red Zone" ? 15 : 50
                  }
                />
              </div>
            </div>
            {/* Status Bar */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <span className="text-gray-600">
                    Mode:{" "}
                    <span className="font-medium capitalize text-blue-600">
                      {editMode}
                    </span>
                  </span>
                  {selectedPlayerId && (
                    <span className="text-gray-600">
                      Selected:{" "}
                      <span className="font-medium text-green-600">
                        {selectedPlayerId}
                      </span>
                    </span>
                  )}
                  {isPlaying && (
                    <span className="text-orange-600 font-medium animate-pulse">
                      ▶ Playing Animation
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-jade-600 text-white rounded-lg hover:bg-jade-700 transition-colors font-medium"
                  >
                    Save Play
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
