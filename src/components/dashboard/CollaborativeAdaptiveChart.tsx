/**
 * Collaborative Adaptive Chart Component
 * Phase 2B Sprint 4: Real-time collaborative chart with live cursors and data sharing
 *
 * Wraps AdaptiveChart with real-time collaboration features:
 * - Live cursor tracking
 * - Real-time data updates
 * - Conflict resolution for data changes
 * - Participant indicators
 */

import React, { useState, useCallback } from "react";
import { AdaptiveChart, type AdaptiveChartProps } from "./AdaptiveChart";
import { CollaborativeWidget } from "../collaboration/CollaborativeWidget";
import { Button } from "../ui";
import { Typography } from "../design-system/Typography";
import type { DataSeries } from "@services/smartDataAnalyzer";

export interface CollaborativeAdaptiveChartProps
  extends Omit<AdaptiveChartProps, "data"> {
  /**
   * Chart data - will be synchronized across collaborators
   */
  data: DataSeries;

  /**
   * Unique identifier for this chart widget
   */
  widgetId: string;

  /**
   * Whether data can be edited collaboratively
   */
  allowDataEditing?: boolean;

  /**
   * Callback when data is changed by local user
   */
  onDataChange?: (newData: DataSeries) => void;

  /**
   * Callback when chart configuration changes
   */
  onConfigChange?: (config: Record<string, unknown>) => void;

  /**
   * Mock collaboration data for development
   */
  mockCollaboration?: {
    participants: Array<{ id: string; name: string; avatar?: string }>;
    cursors: Array<{
      userId: string;
      userName: string;
      x: number;
      y: number;
      widgetId?: string;
      widgetX?: number;
      widgetY?: number;
      action: "hover" | "click" | "typing";
      color: string;
    }>;
    isConnected: boolean;
  };
}

export const CollaborativeAdaptiveChart: React.FC<
  CollaborativeAdaptiveChartProps
> = ({
  data,
  widgetId,
  allowDataEditing = false,
  onDataChange,
  onConfigChange,
  mockCollaboration,
  className = "",
  ...chartProps
}) => {
  const [localData, setLocalData] = useState<DataSeries>(data);
  const [isEditingData, setIsEditingData] = useState(false);

  /**
   * Handle collaborative data changes
   */
  const handleCollaborativeDataChange = useCallback(
    (newData: Record<string, unknown>) => {
      if (newData.dataSeries) {
        const updatedData = newData.dataSeries as DataSeries;
        setLocalData(updatedData);
        onDataChange?.(updatedData);
      }

      if (newData.config) {
        onConfigChange?.(newData.config as Record<string, unknown>);
      }
    },
    [onDataChange, onConfigChange]
  );

  /**
   * Handle local data editing
   */
  const handleLocalDataEdit = useCallback(
    (newValue: number, pointIndex: number) => {
      if (!allowDataEditing) return;

      const updatedData = {
        ...localData,
        data: localData.data.map((point, index) =>
          index === pointIndex ? { ...point, value: newValue } : point
        ),
      };

      setLocalData(updatedData);
      onDataChange?.(updatedData);
    },
    [localData, allowDataEditing, onDataChange]
  );

  return (
    <CollaborativeWidget
      widgetId={widgetId}
      onDataChange={handleCollaborativeDataChange}
      className={`collaborative-chart ${className}`}
      mockCollaboration={mockCollaboration}
    >
      <div className="relative">
        {/* Chart Header with Collaboration Status */}
        <div className="flex items-center justify-between mb-2">
          <Typography variant="headline-sm" as="h3">
            {localData.name}
          </Typography>

          {allowDataEditing && (
            <Button
              onClick={() => setIsEditingData(!isEditingData)}
              variant="secondary"
              size="sm"
              className="text-xs"
            >
              {isEditingData ? "✓ Done" : "✏️ Edit"}
            </Button>
          )}
        </div>

        {/* Interactive Data Editing Overlay */}
        {isEditingData && allowDataEditing && (
          <div className="absolute top-8 left-0 right-0 bg-surface-secondary/90 backdrop-blur-sm rounded-lg p-2 z-10">
            <div className="text-xs text-text-secondary mb-2">
              Click and drag data points to edit values (changes will be shared
              with collaborators)
            </div>
            <div className="flex flex-wrap gap-1">
              {localData.data.slice(0, 5).map((point, index) => (
                <div key={index} className="flex items-center gap-1">
                  <span className="text-xs">{point.label}:</span>
                  <input
                    type="number"
                    value={point.value}
                    onChange={(e) =>
                      handleLocalDataEdit(Number(e.target.value), index)
                    }
                    className="w-12 px-1 py-0.5 text-xs border border-border-primary rounded-lg"
                    step="0.1"
                  />
                </div>
              ))}
              {localData.data.length > 5 && (
                <span className="text-xs text-text-muted">
                  +{localData.data.length - 5} more...
                </span>
              )}
            </div>
          </div>
        )}

        {/* Adaptive Chart with Real-time Data */}
        <AdaptiveChart
          data={localData}
          className="transition-opacity duration-200"
          {...chartProps}
        />

        {/* Data Summary for Collaboration Context */}
        <div className="mt-2 text-xs text-text-muted">
          {localData.data.length} data points • Last updated:{" "}
          {new Date().toLocaleTimeString()}
          {allowDataEditing && (
            <span className="ml-2 text-primary">
              ✏️ Collaborative editing enabled
            </span>
          )}
        </div>
      </div>
    </CollaborativeWidget>
  );
};
