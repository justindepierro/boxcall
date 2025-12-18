/* eslint-disable max-lines-per-function */

import React, { useState } from "react";
import { Typography } from "../../design-system/Typography";
import { Card } from "../../ui/Card";
import { Badge } from "../../ui/Badge";
import { getSuccessRateColor } from "@design-system/chartColors";

interface FieldZoneData {
  zone: string;
  yardLine: number;
  attempts: number;
  successRate: number;
  avgYards: number;
}

interface PlaySuccessHeatmapProps {
  data: FieldZoneData[];
  title?: string;
  className?: string;
}

export const PlaySuccessHeatmap: React.FC<PlaySuccessHeatmapProps> = ({
  data,
  title = "Field Position Success Rate",
  className = "",
}) => {
  const [selectedZone, setSelectedZone] = useState<FieldZoneData | null>(null);

  // Map zones to field positions (0-100 yard line)
  const zoneMapping: Record<string, { start: number; end: number }> = {
    "Own End Zone": { start: 0, end: 10 },
    "Own 10-25": { start: 10, end: 25 },
    "Own 25-40": { start: 25, end: 40 },
    "Own 40-50": { start: 40, end: 50 },
    "Opp 50-40": { start: 50, end: 60 },
    "Opp 40-25": { start: 60, end: 75 },
    "Opp 25-10": { start: 75, end: 90 },
    "Red Zone": { start: 90, end: 100 },
  };

  // Get color based on success rate
  const getZoneColor = (successRate: number): string => {
    return getSuccessRateColor(successRate);
  };

  // Get opacity based on attempts (more attempts = more solid)
  const getOpacity = (attempts: number, maxAttempts: number): number => {
    if (maxAttempts === 0) return 0.3;
    return Math.max(0.3, Math.min(1, attempts / maxAttempts));
  };

  const maxAttempts = Math.max(...data.map((z) => z.attempts));

  if (!data || data.length === 0) {
    return (
      <Card className={className}>
        <div className="p-6">
          <Typography variant="headline-md" className="mb-4">
            {title}
          </Typography>
          <Typography variant="body-sm" className="text-secondary">
            No field zone data available
          </Typography>
        </div>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <div className="p-6">
        <Typography variant="headline-md" className="mb-4">
          {title}
        </Typography>

        {/* Legend */}
        <div className="mb-6 flex items-center gap-4 flex-wrap">
          <Typography variant="body-xs" className="text-secondary">
            Success Rate:
          </Typography>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: "#10b981" }}
            />
            <Typography variant="body-xs">75%+</Typography>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: "#fbbf24" }}
            />
            <Typography variant="body-xs">60-74%</Typography>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: "#f97316" }}
            />
            <Typography variant="body-xs">45-59%</Typography>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: "#ef4444" }}
            />
            <Typography variant="body-xs">&lt;45%</Typography>
          </div>
        </div>

        {/* Football Field SVG */}
        <div className="relative w-full bg-gradient-to-b from-green-600 to-green-700 rounded-lg p-4 overflow-hidden">
          <svg
            viewBox="0 0 300 800"
            className="w-full h-auto"
            style={{ maxHeight: "600px" }}
          >
            {/* Field background */}
            <rect x="0" y="0" width="300" height="800" fill="#16a34a" />

            {/* Yard lines */}
            {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((yard) => {
              const y = (yard / 100) * 800;
              return (
                <g key={yard}>
                  <line
                    x1="0"
                    y1={y}
                    x2="300"
                    y2={y}
                    stroke="white"
                    strokeWidth={yard === 0 || yard === 100 ? "3" : "1"}
                    opacity="0.5"
                  />
                  {yard % 10 === 0 && yard !== 0 && yard !== 100 && (
                    <text
                      x="15"
                      y={y + 5}
                      fill="white"
                      fontSize="12"
                      opacity="0.7"
                    >
                      {yard <= 50 ? yard : 100 - yard}
                    </text>
                  )}
                  {yard % 10 === 0 && yard !== 0 && yard !== 100 && (
                    <text
                      x="270"
                      y={y + 5}
                      fill="white"
                      fontSize="12"
                      opacity="0.7"
                    >
                      {yard <= 50 ? yard : 100 - yard}
                    </text>
                  )}
                </g>
              );
            })}

            {/* End zones */}
            <rect
              x="0"
              y="0"
              width="300"
              height="80"
              fill="#1e40af"
              opacity="0.3"
            />
            <rect
              x="0"
              y="720"
              width="300"
              height="80"
              fill="#dc2626"
              opacity="0.3"
            />

            {/* Heat map zones */}
            {data.map((zone) => {
              const mapping = zoneMapping[zone.zone];
              if (!mapping) return null;

              const y = (mapping.start / 100) * 800;
              const height = ((mapping.end - mapping.start) / 100) * 800;
              const color = getZoneColor(zone.successRate);
              const opacity = getOpacity(zone.attempts, maxAttempts);

              return (
                <g key={zone.zone}>
                  <rect
                    x="40"
                    y={y}
                    width="220"
                    height={height}
                    fill={color}
                    opacity={opacity}
                    stroke="white"
                    strokeWidth="1"
                    className="cursor-pointer transition-opacity hover:opacity-100"
                    onClick={() => setSelectedZone(zone)}
                    onMouseEnter={() => setSelectedZone(zone)}
                    onMouseLeave={() => {
                      if (selectedZone?.zone === zone.zone) {
                        // Keep selected on click, clear on mouse leave
                      }
                    }}
                  />
                  {/* Zone label */}
                  <text
                    x="150"
                    y={y + height / 2}
                    fill="white"
                    fontSize="14"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="pointer-events-none"
                    style={{ textShadow: "0 0 4px rgba(0,0,0,0.8)" }}
                  >
                    {zone.successRate}%
                  </text>
                </g>
              );
            })}

            {/* Midfield line emphasis */}
            <line
              x1="0"
              y1="400"
              x2="300"
              y2="400"
              stroke="white"
              strokeWidth="3"
              opacity="0.8"
            />
            <text
              x="150"
              y="395"
              fill="white"
              fontSize="16"
              fontWeight="bold"
              textAnchor="middle"
              style={{ textShadow: "0 0 4px rgba(0,0,0,0.8)" }}
            >
              50
            </text>
          </svg>
        </div>

        {/* Selected Zone Details */}
        {selectedZone && (
          <div className="mt-6 p-4 bg-secondary rounded-lg">
            <div className="flex items-start justify-between mb-3">
              <div>
                <Typography variant="body-sm" className="font-semibold mb-1">
                  {selectedZone.zone}
                </Typography>
                <Typography variant="body-xs" className="text-secondary">
                  {selectedZone.attempts} attempts
                </Typography>
              </div>
              <Badge
                variant={(() => {
                  if (selectedZone.successRate >= 75) return "success";
                  if (selectedZone.successRate >= 60) return "warning";
                  return "danger";
                })()}
              >
                {selectedZone.successRate}% Success
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Typography variant="body-xs" className="text-secondary mb-1">
                  Avg Yards/Play
                </Typography>
                <Typography variant="headline-sm">
                  {selectedZone.avgYards.toFixed(1)}
                </Typography>
              </div>
              <div>
                <Typography variant="body-xs" className="text-secondary mb-1">
                  Total Attempts
                </Typography>
                <Typography variant="headline-sm">
                  {selectedZone.attempts}
                </Typography>
              </div>
            </div>
          </div>
        )}

        {/* Zone Breakdown List */}
        <div className="mt-6 space-y-2">
          <Typography variant="body-sm" className="font-semibold mb-3">
            All Zones
          </Typography>
          {data.map((zone) => (
            <div
              key={zone.zone}
              className="flex items-center justify-between p-3 bg-secondary rounded-lg cursor-pointer hover:bg-muted transition-colors"
              onClick={() => setSelectedZone(zone)}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getZoneColor(zone.successRate) }}
                />
                <div>
                  <Typography variant="body-sm" className="font-medium">
                    {zone.zone}
                  </Typography>
                  <Typography variant="body-xs" className="text-secondary">
                    {zone.attempts} attempts • {zone.avgYards.toFixed(1)} avg
                    yards
                  </Typography>
                </div>
              </div>
              <Badge
                variant={(() => {
                  if (zone.successRate >= 75) return "success";
                  if (zone.successRate >= 60) return "warning";
                  return "danger";
                })()}
                className="w-15 text-center"
              >
                {zone.successRate}%
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
