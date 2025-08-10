import { Typography } from "../../design-system/Typography";
/**
 * Play Builder Preview - Live preview of play being created
 * Database-aligned with actual Play schema
 */

import React from "react";
import { ArrowRight, CheckCircle, AlertTriangle } from "lucide-react";
import type { Play } from "../../../types/play";

interface PlayBuilderPreviewProps {
  playData: Partial<Play>;
  isValid: boolean;
  validationErrors: string[];
}

export const PlayBuilderPreview: React.FC<PlayBuilderPreviewProps> = ({
  playData,
  isValid,
  validationErrors,
}) => {
  // Get complexity color
  const getComplexityColor = (score?: number) => {
    if (!score) return "bg-slate-100 text-slate-600";
    if (score <= 2) return "bg-green-100 text-green-800";
    if (score <= 3) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  // Get confidence color
  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return "bg-slate-100 text-slate-600";
    if (confidence >= 80) return "bg-green-100 text-green-800";
    if (confidence >= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200">
      {/* Preview Header */}
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <Typography variant="headline-sm" as="h3" className="text-slate-900">Play Preview</Typography>
          <div className="flex items-center space-x-2">
            {isValid ? (
              <div className="flex items-center text-green-700">
                <CheckCircle className="h-5 w-5 mr-1" />
                <span className="text-sm font-medium">Ready to save</span>
              </div>
            ) : (
              <div className="flex items-center text-amber-700">
                <AlertTriangle className="h-5 w-5 mr-1" />
                <span className="text-sm font-medium">
                  Missing required fields
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Play Title */}
        <div className="mb-6">
          <Typography variant="headline-md" as="h2" className="text-slate-900">
            {playData.play_name || "Untitled Play"}
          </Typography>
          {playData.one_word_play && (
            <p className="text-lg text-slate-600 mt-1">
              Call: "{playData.one_word_play}"
            </p>
          )}
        </div>

        {/* Core Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-2">
              Play Type
            </h4>
            <p className="text-lg font-semibold text-slate-900">
              {playData.p_type || "Not specified"}
            </p>
          </div>

          <div className="bg-slate-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-2">
              Formation
            </h4>
            <p className="text-lg font-semibold text-slate-900">
              {playData.formation || "Not specified"}
            </p>
          </div>

          <div className="bg-slate-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-2">
              Personnel
            </h4>
            <p className="text-lg font-semibold text-slate-900">
              {playData.personnel || "Not specified"}
            </p>
          </div>
        </div>

        {/* Formation Details */}
        {(playData.f_type || playData.f_dir || playData.protection) && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-3">
              Formation Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {playData.f_type && (
                <div>
                  <span className="text-sm text-slate-600">Type:</span>
                  <p className="font-medium">{playData.f_type}</p>
                </div>
              )}
              {playData.f_dir && (
                <div>
                  <span className="text-sm text-slate-600">Direction:</span>
                  <p className="font-medium">{playData.f_dir}</p>
                </div>
              )}
              {playData.protection && (
                <div>
                  <span className="text-sm text-slate-600">Protection:</span>
                  <p className="font-medium">{playData.protection}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Performance Metrics */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-3">
            Performance
          </h4>
          <div className="flex flex-wrap gap-3">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(playData.confidence_base)}`}
            >
              Confidence: {playData.confidence_base || 70}%
            </span>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getComplexityColor(playData.complexity_score)}`}
            >
              Complexity: {playData.complexity_score || 1}/5
            </span>
            {playData.is_archived && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-800">
                Archived
              </span>
            )}
          </div>
        </div>

        {/* Notes */}
        {playData.notes && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-2">
              Notes
            </h4>
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-slate-700 whitespace-pre-wrap">
                {playData.notes}
              </p>
            </div>
          </div>
        )}

        {/* Validation Errors */}
        {!isValid && validationErrors.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h5 className="font-medium text-amber-800 mb-2">
                  Required fields missing:
                </h5>
                <ul className="text-sm text-amber-700 space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index} className="flex items-center">
                      <ArrowRight className="h-4 w-4 mr-2 flex-shrink-0" />
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Success State */}
        {isValid && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
              <div>
                <h5 className="font-medium text-green-800">Ready to save!</h5>
                <p className="text-sm text-green-700 mt-1">
                  All required fields are complete. Your play is ready to be
                  added to the playbook.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
