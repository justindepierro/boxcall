import React, { useState } from "react";
import { Typography } from "../design-system/Typography";
import {
  Edit,
  Copy,
  Image,
  ChevronDown,
  ChevronUp,
  Target,
  Hash,
  Clock,
  Calendar,
  Gamepad2,
} from "lucide-react";
import type { Play as PlayType } from "../../types/play";
import { VisualPlayBuilder } from "./visual/VisualPlayBuilder";
import { getDisplayName, getSubtitleText } from "../../utils/playNameUtils";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button/Button";
interface PlayCardProps {
  play: PlayType;
  showOneWordCalls?: boolean;
  onEdit?: (play: PlayType) => void;
  onDuplicate?: (play: PlayType) => void;
  onCreateDiagram?: (play: PlayType) => void;
  onAddToPracticeScript?: (play: PlayType) => void;
  onAddToGamePlan?: (play: PlayType) => void;
  // Bulk Operations
  enableSelection?: boolean;
  isSelected?: boolean;
  onSelectionChange?: (playId: string, selected: boolean) => void;
}
export const PlayCard: React.FC<PlayCardProps> = ({
  play,
  showOneWordCalls = false,
  onEdit,
  onDuplicate,
  onCreateDiagram,
  onAddToPracticeScript,
  onAddToGamePlan,
  // Bulk Operations
  enableSelection = false,
  isSelected = false,
  onSelectionChange,
}) => {
  const [showVisualBuilder, setShowVisualBuilder] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const getPlayTypeColor = (type: string) => {
    switch (type) {
      case "Pass":
        return "bg-blue-100 text-blue-800";
      case "Run":
        return "bg-green-100 text-green-800";
      case "RPO":
        return "bg-purple-100 text-purple-800";
      case "Play Action":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-green-600";
    if (confidence >= 60) return "text-yellow-600";
    return "text-red-600";
  };
  const handleCreateDiagram = () => {
    setShowVisualBuilder(true);
  };
  const handleSaveDiagram = (updatedPlay: PlayType) => {
    setShowVisualBuilder(false);
    if (onCreateDiagram) {
      onCreateDiagram(updatedPlay);
    }
  };
  const displayName = getDisplayName(play, showOneWordCalls);
  const subtitleText = getSubtitleText(play, showOneWordCalls);
  return (
    <>
      <div
        className={`bg-white rounded-lg border transition-colors shadow-sm ${
          isSelected
            ? "border-jade-600 ring-2 ring-blue-200"
            : "border-slate-200 hover:border-slate-300"
        }`}
      >
        <div className="p-4 sm:p-6">
          {/* Collapsed/Skinny Mode */}
          <div className="flex items-center justify-between">
            {/* Selection Checkbox */}
            {enableSelection && (
              <div className="flex items-center mr-3">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) =>
                    onSelectionChange?.(play.id, e.target.checked)
                  }
                  className="rounded border-slate-300 text-blue-600 focus:ring-jade-500"
                />
              </div>
            )}

            <div className="flex-1">
              {/* Play Name with MonoCode Font */}
              <h3
                className={`font-mono font-bold text-lg ${
                  showOneWordCalls && play.one_word_play
                    ? "text-blue-600"
                    : "text-slate-900"
                }`}
              >
                {displayName}
              </h3>
              {/* Subtitle in italics for one-word plays */}
              {subtitleText && (
                <p className="text-xs text-slate-500 mt-1 italic font-light">
                  {subtitleText}
                </p>
              )}
              {/* Play Type and additional info - Mobile-friendly badges */}
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span
                  className={`px-3 py-1.5 rounded-full text-sm font-medium ${getPlayTypeColor(play.p_type)}`}
                >
                  {play.p_type}
                </span>
                {play.f_type && (
                  <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full text-sm">
                    {play.f_type}
                  </span>
                )}
                <span
                  className={`text-sm font-medium ${getConfidenceColor(play.confidence_base)}`}
                >
                  {play.confidence_base}%
                </span>
              </div>
            </div>
            {/* Action Buttons - Mobile Touch-Optimized */}
            <div className="flex items-center space-x-1 ml-4">
              <Button
                onClick={() => setIsExpanded(!isExpanded)}
                variant="ghost"
                size="sm"
                icon={
                  isExpanded ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )
                }
                iconPosition="only"
                aria-label={isExpanded ? "Collapse details" : "Expand details"}
                title={isExpanded ? "Collapse" : "Expand details"}
                className="p-3 !h-auto min-w-[48px] min-h-[48px]"
              />
              <Button
                onClick={() => onEdit?.(play)}
                variant="ghost"
                size="sm"
                icon={<Edit className="h-5 w-5" />}
                iconPosition="only"
                aria-label="Edit play"
                title="Edit play"
                className="p-3 !h-auto min-w-[48px] min-h-[48px]"
              />
              <Button
                onClick={() => onDuplicate?.(play)}
                variant="ghost"
                size="sm"
                icon={<Copy className="h-5 w-5" />}
                iconPosition="only"
                aria-label="Duplicate play"
                title="Duplicate play"
                className="p-3 !h-auto min-w-[48px] min-h-[48px]"
              />
              <Button
                onClick={handleCreateDiagram}
                variant="ghost"
                size="sm"
                icon={<Image className="h-5 w-5" />}
                iconPosition="only"
                aria-label="Create diagram"
                title="Create diagram"
                className="p-3 !h-auto min-w-[48px] min-h-[48px]"
              />
            </div>
          </div>
          {/* Expanded Details */}
          {isExpanded && (
            <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Formation Details */}
              <div className="space-y-2">
                <Typography
                  variant="label-lg"
                  as="h4"
                  className="text-slate-700 flex items-center"
                >
                  <Target className="h-4 w-4 mr-1" />
                  Formation
                </Typography>
                <div className="space-y-1 text-sm text-slate-600">
                  <div>
                    <span className="font-medium">Base:</span> {play.formation}
                  </div>
                  {play.f_dir && (
                    <div>
                      <span className="font-medium">Direction:</span>{" "}
                      {play.f_dir}
                    </div>
                  )}
                  {play.ftag1 && (
                    <div>
                      <span className="font-medium">Tag 1:</span> {play.ftag1}
                    </div>
                  )}
                  {play.ftag2 && (
                    <div>
                      <span className="font-medium">Tag 2:</span> {play.ftag2}
                    </div>
                  )}
                  {play.back_align && (
                    <div>
                      <span className="font-medium">Back Align:</span>{" "}
                      {play.back_align}
                    </div>
                  )}
                  {play.shift && (
                    <div>
                      <span className="font-medium">Shift:</span> {play.shift}
                    </div>
                  )}
                  {play.motion && (
                    <div>
                      <span className="font-medium">Motion:</span> {play.motion}
                    </div>
                  )}
                </div>
              </div>
              {/* Play Details */}
              <div className="space-y-2">
                <Typography
                  variant="label-lg"
                  as="h4"
                  className="text-slate-700 flex items-center"
                >
                  <Hash className="h-4 w-4 mr-1" />
                  Play Details
                </Typography>
                <div className="space-y-1 text-sm text-slate-600">
                  <div>
                    <span className="font-medium">Core:</span> {play.play_name}
                  </div>
                  {play.p_dir && (
                    <div>
                      <span className="font-medium">Direction:</span>{" "}
                      {play.p_dir}
                    </div>
                  )}
                  {play.protection && (
                    <div>
                      <span className="font-medium">Protection:</span>{" "}
                      {play.protection}
                    </div>
                  )}
                  {play.p_tag1 && (
                    <div>
                      <span className="font-medium">Tag 1:</span> {play.p_tag1}
                    </div>
                  )}
                  {play.p_tag2 && (
                    <div>
                      <span className="font-medium">Tag 2:</span> {play.p_tag2}
                    </div>
                  )}
                  {play.r_str && (
                    <div>
                      <span className="font-medium">Run Strength:</span>{" "}
                      {play.r_str}
                    </div>
                  )}
                  {play.p_str && (
                    <div>
                      <span className="font-medium">Pass Strength:</span>{" "}
                      {play.p_str}
                    </div>
                  )}
                </div>
              </div>
              {/* Situational & Stats */}
              <div className="space-y-2">
                <Typography
                  variant="label-lg"
                  as="h4"
                  className="text-slate-700 flex items-center"
                >
                  <Clock className="h-4 w-4 mr-1" />
                  Usage & Stats
                </Typography>
                <div className="space-y-1 text-sm text-slate-600">
                  {/* Success rate removed: deprecated legacy field */}
                  <div>
                    <span className="font-medium">Times Called:</span>{" "}
                    {play.times_called}
                  </div>
                  <div>
                    <span className="font-medium">Times Successful:</span>{" "}
                    {play.times_successful}
                  </div>
                  {play.pref_down && (
                    <div>
                      <span className="font-medium">Pref Down:</span>{" "}
                      {play.pref_down}
                    </div>
                  )}
                  {play.pref_dis && (
                    <div>
                      <span className="font-medium">Pref Distance:</span>{" "}
                      {play.pref_dis}
                    </div>
                  )}
                  {play.pref_hash && (
                    <div>
                      <span className="font-medium">Pref Hash:</span>{" "}
                      {play.pref_hash}
                    </div>
                  )}
                  {play.pref_cov && (
                    <div>
                      <span className="font-medium">Pref Coverage:</span>{" "}
                      {play.pref_cov}
                    </div>
                  )}
                </div>
              </div>
              {/* Notes & Tags */}
              {play.notes && (
                <div className="md:col-span-3 pt-2 border-t border-slate-100">
                  {play.notes && (
                    <div className="mb-2">
                      <span className="text-sm font-medium text-slate-700">
                        Notes:
                      </span>
                      <p className="text-sm text-slate-600 mt-1">
                        {play.notes}
                      </p>
                    </div>
                  )}
                  {/* Tags removed: deprecated legacy field */}
                </div>
              )}

              {/* 3-Part Workflow Actions - Week 3 Feature */}
              <div className="md:col-span-3 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <Typography
                      variant="label-lg"
                      as="h4"
                      className="text-slate-700 mb-1"
                    >
                      Add to Workflow
                    </Typography>
                    <p className="text-xs text-slate-500">
                      Build practice scripts and game plans from this play
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => onAddToPracticeScript?.(play)}
                      title="Add this play to a practice script"
                      className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-transparent"
                    >
                      <Calendar className="h-3 w-3 mr-1" />
                      Practice Script
                    </Button>
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => onAddToGamePlan?.(play)}
                      title="Add this play to a game plan"
                      className="bg-jade-50 hover:bg-jade-100 text-jade-700 border-transparent"
                    >
                      <Gamepad2 className="h-3 w-3 mr-1" />
                      Game Plan
                    </Button>
                    <Badge variant="premium" size="sm">
                      Week 3
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Visual Play Builder Modal */}
      {showVisualBuilder && (
        <VisualPlayBuilder
          isOpen={showVisualBuilder}
          play={play}
          onSave={handleSaveDiagram}
          onClose={() => setShowVisualBuilder(false)}
        />
      )}
    </>
  );
};
