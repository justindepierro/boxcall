import React, { useState, useMemo, useCallback } from "react";
import { Typography } from "../../design-system/Typography";
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
import { Button } from "../../ui/Button/Button";
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
      <div className="surface-card elevation-modal rounded-lg shadow-xl w-[95vw] h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-subtle surface-subtle">
          <div>
            <Typography
              variant="headline-sm"
              as="h2"
              className="text-text-primary"
            >
              Interactive Play Builder
            </Typography>
            <p className="text-sm text-text-secondary">
              {currentPlay.play_name} - {currentPlay.formation} Formation
            </p>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            icon={<X className="w-5 h-5" />}
            iconPosition="only"
            aria-label="Close"
            className="p-2 h-auto surface-subtle-hover rounded-lg"
          />
        </div>
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 surface-subtle border-r border-subtle flex flex-col">
            {/* Mode Controls */}
            <div className="p-4 border-b border-subtle">
              <Typography
                variant="label-lg"
                as="h3"
                className="text-text-primary mb-3"
              >
                Edit Mode
              </Typography>
              <div className="space-y-2">
                <Button
                  onClick={() => handleModeChange("view")}
                  variant={editMode === "view" ? "primary" : "ghost"}
                  size="sm"
                  icon={<Eye className="w-4 h-4" />}
                  className="w-full justify-start"
                >
                  View Only
                </Button>
                <Button
                  onClick={() => handleModeChange("move")}
                  variant={editMode === "move" ? "primary" : "ghost"}
                  size="sm"
                  icon={<Users className="w-4 h-4" />}
                  className="w-full justify-start"
                >
                  Move Players
                </Button>
                <Button
                  onClick={() => handleModeChange("draw")}
                  variant={editMode === "draw" ? "primary" : "ghost"}
                  size="sm"
                  icon={<Route className="w-4 h-4" />}
                  className="w-full justify-start"
                >
                  Draw Routes
                </Button>
              </div>
            </div>
            {/* Animation Controls */}
            <div className="p-4 border-b border-subtle">
              <Typography
                variant="label-lg"
                as="h3"
                className="text-text-primary mb-3"
              >
                Animation
              </Typography>
              <div className="flex gap-2">
                <Button
                  onClick={handlePlayAnimation}
                  variant={isPlaying ? "outline" : "success"}
                  size="sm"
                  icon={
                    isPlaying ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <PlayIcon className="w-4 h-4" />
                    )
                  }
                  className="flex-1"
                >
                  {isPlaying ? "Pause" : "Play"}
                </Button>
                <Button
                  onClick={handleReset}
                  variant="ghost"
                  size="sm"
                  icon={<RotateCcw className="w-4 h-4" />}
                  iconPosition="only"
                  aria-label="Reset to formation"
                  title="Reset to formation"
                />
              </div>
            </div>
            {/* Display Options */}
            <div className="p-4 border-b border-subtle">
              <Typography
                variant="label-lg"
                as="h3"
                className="text-text-primary mb-3"
              >
                Display
              </Typography>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={showYardLines}
                    onChange={(e) => setShowYardLines(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-text-primary">Yard lines</span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={showLabels}
                    onChange={(e) => setShowLabels(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-text-primary">Player labels</span>
                </label>
              </div>
            </div>
            {/* Play Information */}
            <div className="p-4">
              <Typography
                variant="label-lg"
                as="h3"
                className="text-text-primary mb-3"
              >
                Play Info
              </Typography>
              <div className="space-y-2 text-sm text-text-secondary">
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
                {/* Success rate removed: property not present on Play type */}
              </div>
            </div>
            {/* Instructions */}
            <div className="mt-auto p-4 border-t border-subtle">
              <div className="text-xs text-text-secondary space-y-1">
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
              <div className="h-full surface-subtle decorative-gradient bg-gradient-to-b from-green-50 to-green-100 rounded-lg border-2 border-subtle overflow-hidden shadow-inner">
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
            <div className="p-4 border-t border-subtle surface-subtle">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <span className="text-text-secondary">
                    Mode:{" "}
                    <span className="font-medium capitalize text-blue-600">
                      {editMode}
                    </span>
                  </span>
                  {selectedPlayerId && (
                    <span className="text-text-secondary">
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
                  <Button onClick={handleSave} variant="primary" size="sm">
                    Save Play
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
