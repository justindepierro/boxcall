import { Typography } from "../../design-system/Typography";
/**
 * Play Builder Preview - Live preview of play being created
 * Database-aligned with actual Play schema
 */

import React from "react";
import { Tag } from "../../ui/Tag";
import { Icon } from "../../ui/Icon/Icon";
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
  return (
    <div className="surface-card rounded-lg border-subtle elevation-card">
      {/* Preview Header */}
      <div className="surface-subtle px-6 py-4 border-b border-subtle">
        <div className="flex items-center justify-between">
          <Typography variant="headline-sm" as="h3" className="text-slate-900">
            Play Preview
          </Typography>
          <div className="flex items-center space-x-2">
            {isValid ? (
              <div className="flex items-center text-green-700">
                <Icon name="check-circle" className="h-5 w-5 mr-1" />
                <Typography variant="body-sm" as="span" className="font-medium">
                  Ready to save
                </Typography>
              </div>
            ) : (
              <div className="flex items-center text-amber-700">
                <Icon name="alert-triangle" className="h-5 w-5 mr-1" />
                <Typography variant="body-sm" as="span" className="font-medium">
                  Missing required fields
                </Typography>
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
          <div className="surface-subtle rounded-lg p-4">
            <Typography
              variant="label-lg"
              as="h4"
              className="text-slate-500 mb-2"
            >
              Play Type
            </Typography>
            <p className="text-lg font-semibold text-slate-900">
              {playData.p_type || "Not specified"}
            </p>
          </div>

          <div className="surface-subtle rounded-lg p-4">
            <Typography
              variant="label-lg"
              as="h4"
              className="text-slate-500 mb-2"
            >
              Formation
            </Typography>
            <p className="text-lg font-semibold text-slate-900">
              {playData.formation || "Not specified"}
            </p>
          </div>

          <div className="surface-subtle rounded-lg p-4">
            <Typography
              variant="label-lg"
              as="h4"
              className="text-slate-500 mb-2"
            >
              Personnel
            </Typography>
            <p className="text-lg font-semibold text-slate-900">
              {playData.personnel || "Not specified"}
            </p>
          </div>
        </div>

        {/* Formation Details */}
        {(playData.f_type || playData.f_dir || playData.protection) && (
          <div className="mb-6">
            <Typography
              variant="label-lg"
              as="h4"
              className="text-slate-500 mb-3"
            >
              Formation Details
            </Typography>
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
          <Typography
            variant="label-lg"
            as="h4"
            className="text-slate-500 mb-3"
          >
            Performance
          </Typography>
          <div className="flex flex-wrap gap-3">
            <Tag
              variant={
                playData.confidence_base
                  ? playData.confidence_base >= 80
                    ? "success"
                    : playData.confidence_base >= 60
                      ? "warning"
                      : "danger"
                  : "neutral"
              }
              size="sm"
            >
              Confidence: {playData.confidence_base || 70}%
            </Tag>
            <Tag
              variant={
                playData.complexity_score
                  ? playData.complexity_score <= 2
                    ? "success"
                    : playData.complexity_score <= 3
                      ? "warning"
                      : "danger"
                  : "neutral"
              }
              size="sm"
            >
              Complexity: {playData.complexity_score || 1}/5
            </Tag>
            {playData.is_archived && (
              <Tag variant="neutral" size="sm">
                Archived
              </Tag>
            )}
          </div>
        </div>

        {/* Notes */}
        {playData.notes && (
          <div className="mb-6">
            <Typography
              variant="label-lg"
              as="h4"
              className="text-slate-500 mb-2"
            >
              Notes
            </Typography>
            <div className="surface-subtle rounded-lg p-4">
              <p className="text-slate-700 whitespace-pre-wrap">
                {playData.notes}
              </p>
            </div>
          </div>
        )}

        {/* Validation Errors */}
        {!isValid && validationErrors.length > 0 && (
          <div className="surface-subtle border border-subtle rounded-lg p-4">
            <div className="flex items-start">
              <Icon
                name="alert-triangle"
                className="h-5 w-5 text-amber-400 mt-0.5 mr-3 flex-shrink-0"
              />
              <div>
                <h5 className="font-medium text-amber-800 mb-2">
                  Required fields missing:
                </h5>
                <ul className="text-sm text-amber-700 space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index} className="flex items-center">
                      <Icon
                        name="arrow-right"
                        className="h-4 w-4 mr-2 flex-shrink-0"
                      />
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
          <div className="surface-subtle border border-subtle rounded-lg p-4">
            <div className="flex items-center">
              <Icon
                name="check-circle"
                className="h-5 w-5 text-green-400 mr-3"
              />
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
