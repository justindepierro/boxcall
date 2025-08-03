import React from "react";
import { Edit, Copy, Image, Play } from "lucide-react";
import type { Play as PlayType } from "../../types/play";

interface PlayCardProps {
  play: PlayType;
  onEdit?: (play: PlayType) => void;
  onDuplicate?: (play: PlayType) => void;
  onCreateDiagram?: (play: PlayType) => void;
}

export const PlayCard: React.FC<PlayCardProps> = ({
  play,
  onEdit,
  onDuplicate,
  onCreateDiagram,
}) => {
  const getPlayTypeColor = (type: string) => {
    switch (type) {
      case "Pass":
        return "bg-blue-100 text-blue-800";
      case "Run":
        return "bg-green-100 text-green-800";
      case "RPO":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-green-600";
    if (confidence >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 text-lg truncate">
              🏈 {play.play_name}
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Formation: {play.formation} {play.f_dir && `(${play.f_dir})`}
            </p>
            {play.one_word_play && (
              <p className="text-sm text-emerald-600 font-medium mt-1">
                Call: "{play.one_word_play}"
              </p>
            )}
          </div>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getPlayTypeColor(play.p_type)}`}
          >
            {play.p_type}
          </span>
        </div>
      </div>

      {/* Preview Area */}
      <div className="p-4">
        {play.diagram_url ? (
          <div className="aspect-video bg-slate-50 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center mb-4">
            <img
              src={play.diagram_url}
              alt={`${play.play_name} diagram`}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        ) : (
          <div className="aspect-video bg-slate-50 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center mb-4">
            <div className="text-center">
              <Play className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No diagram available</p>
            </div>
          </div>
        )}

        {/* Play Details */}
        <div className="space-y-2 text-sm">
          {play.f_type && (
            <div className="flex justify-between">
              <span className="text-slate-600">Type:</span>
              <span className="font-medium">
                {play.p_type} | {play.f_type}
              </span>
            </div>
          )}

          {play.protection && (
            <div className="flex justify-between">
              <span className="text-slate-600">Protection:</span>
              <span className="font-medium">{play.protection}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-slate-600">Confidence:</span>
            <span
              className={`font-medium ${getConfidenceColor(play.confidence_base)}`}
            >
              {play.confidence_base}%
            </span>
          </div>

          {play.times_called > 0 && (
            <div className="flex justify-between">
              <span className="text-slate-600">Success:</span>
              <span className="font-medium">
                {Math.round((play.times_successful / play.times_called) * 100)}%
                ({play.times_successful}/{play.times_called})
              </span>
            </div>
          )}
        </div>

        {/* Tags */}
        {play.tags && play.tags.length > 0 && (
          <div className="mt-3">
            <div className="flex flex-wrap gap-1">
              {play.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md"
                >
                  {tag}
                </span>
              ))}
              {play.tags.length > 3 && (
                <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md">
                  +{play.tags.length - 3}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit?.(play)}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </button>
          <button
            onClick={() => onDuplicate?.(play)}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            <Copy className="h-3 w-3 mr-1" />
            Duplicate
          </button>
        </div>

        <button
          onClick={() => onCreateDiagram?.(play)}
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
        >
          <Image className="h-3 w-3 mr-1" />
          Create Diagram
        </button>
      </div>
    </div>
  );
};
