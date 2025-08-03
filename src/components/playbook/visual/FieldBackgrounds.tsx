import React from "react";

interface FieldBackgroundProps {
  width: number;
  height: number;
  mode: "football" | "redzone" | "blank" | "lines" | "grid" | "dots";
  lineOfScrimmage?: number; // Yard line position (0-100)
}

export const FieldBackground: React.FC<FieldBackgroundProps> = ({
  width,
  height,
  mode,
  lineOfScrimmage = 50,
}) => {
  // Standard field proportions based on NFHS diagram
  // 53.33 yards wide, showing 40 yards total (10 behind LOS, 30 ahead)
  const FIELD_WIDTH_YARDS = 53.33;
  const FIELD_LENGTH_YARDS = 40; // 10 behind + 30 ahead of LOS

  // Calculate scale
  const yardToPixelX = width / FIELD_WIDTH_YARDS;

  // Hash mark positions (18'6" from sidelines = 18.5 feet = 6.17 yards)
  const leftHashX = 6.17 * yardToPixelX;
  const rightHashX = (FIELD_WIDTH_YARDS - 6.17) * yardToPixelX;

  const renderFootballField = () => (
    <g>
      {/* Field background */}
      <rect
        width={width}
        height={height}
        fill="#22c55e"
        stroke="#ffffff"
        strokeWidth={2}
      />

      {/* Sidelines */}
      <line x1={0} y1={0} x2={0} y2={height} stroke="#ffffff" strokeWidth={3} />
      <line
        x1={width}
        y1={0}
        x2={width}
        y2={height}
        stroke="#ffffff"
        strokeWidth={3}
      />

      {/* Yard lines - every 5 yards */}
      {Array.from({ length: 9 }, (_, i) => {
        const yardFromBack = (i + 1) * 5; // 5, 10, 15, 20, 25, 30, 35, 40
        const y = (yardFromBack / FIELD_LENGTH_YARDS) * height;
        const isMainYard = yardFromBack % 10 === 0;

        return (
          <g key={`yard-${yardFromBack}`}>
            <line
              x1={0}
              y1={y}
              x2={width}
              y2={y}
              stroke="#ffffff"
              strokeWidth={isMainYard ? 2 : 1}
            />

            {/* Yard numbers on main lines */}
            {isMainYard && (
              <>
                <text
                  x={width * 0.15}
                  y={y - 5}
                  fill="#ffffff"
                  fontSize="14"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {lineOfScrimmage - 10 + yardFromBack}
                </text>
                <text
                  x={width * 0.85}
                  y={y - 5}
                  fill="#ffffff"
                  fontSize="14"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {lineOfScrimmage - 10 + yardFromBack}
                </text>
              </>
            )}
          </g>
        );
      })}

      {/* Line of Scrimmage (highlighted) */}
      <line
        x1={0}
        y1={height * 0.25} // 10 yards from back = 25% of 40-yard view
        x2={width}
        y2={height * 0.25}
        stroke="#fbbf24"
        strokeWidth={3}
      />

      {/* Hash marks */}
      {Array.from({ length: 41 }, (_, i) => {
        const y = (i / 40) * height;
        return (
          <g key={`hash-${i}`}>
            {/* Left hash marks */}
            <line
              x1={leftHashX - 10}
              y1={y}
              x2={leftHashX + 10}
              y2={y}
              stroke="#ffffff"
              strokeWidth={1}
            />
            {/* Right hash marks */}
            <line
              x1={rightHashX - 10}
              y1={y}
              x2={rightHashX + 10}
              y2={y}
              stroke="#ffffff"
              strokeWidth={1}
            />
          </g>
        );
      })}

      {/* Goal line indicator (if in view) */}
      {lineOfScrimmage <= 40 && (
        <line
          x1={0}
          y1={height * ((40 - lineOfScrimmage) / 40)}
          x2={width}
          y2={height * ((40 - lineOfScrimmage) / 40)}
          stroke="#dc2626"
          strokeWidth={4}
        />
      )}
    </g>
  );

  const renderRedZone = () => (
    <g>
      {/* Red zone background */}
      <rect
        width={width}
        height={height}
        fill="#fef2f2"
        stroke="#dc2626"
        strokeWidth={3}
      />

      {/* Yard lines in red zone (25, 20, 15, 10, 5, Goal) */}
      {Array.from({ length: 6 }, (_, i) => {
        const yardLine = 25 - i * 5;
        const y = (i / 5) * height * 0.85; // Leave space for end zone

        return (
          <g key={`redzone-${yardLine}`}>
            <line
              x1={0}
              y1={y}
              x2={width}
              y2={y}
              stroke="#dc2626"
              strokeWidth={yardLine === 0 ? 4 : 2}
            />

            {/* Yard numbers */}
            <text
              x={width * 0.1}
              y={y - 5}
              fill="#dc2626"
              fontSize="16"
              fontWeight="bold"
              textAnchor="middle"
            >
              {yardLine === 0 ? "GOAL" : yardLine}
            </text>
          </g>
        );
      })}

      {/* End zone */}
      <rect
        x={0}
        y={height * 0.85}
        width={width}
        height={height * 0.15}
        fill="#dc2626"
        opacity={0.2}
      />

      {/* Hash marks */}
      {Array.from({ length: 26 }, (_, i) => {
        const y = (i / 25) * height * 0.85;
        return (
          <g key={`redzone-hash-${i}`}>
            <line
              x1={leftHashX - 8}
              y1={y}
              x2={leftHashX + 8}
              y2={y}
              stroke="#dc2626"
              strokeWidth={1}
            />
            <line
              x1={rightHashX - 8}
              y1={y}
              x2={rightHashX + 8}
              y2={y}
              stroke="#dc2626"
              strokeWidth={1}
            />
          </g>
        );
      })}
    </g>
  );

  const renderLines = () => (
    <g>
      {/* Lined paper background */}
      <rect width={width} height={height} fill="#ffffff" />

      {/* Horizontal lines every 20 pixels */}
      {Array.from({ length: Math.floor(height / 20) }, (_, i) => (
        <line
          key={`line-${i}`}
          x1={0}
          y1={i * 20}
          x2={width}
          y2={i * 20}
          stroke="#e5e7eb"
          strokeWidth={1}
        />
      ))}

      {/* Red margin line */}
      <line
        x1={width * 0.1}
        y1={0}
        x2={width * 0.1}
        y2={height}
        stroke="#dc2626"
        strokeWidth={1}
      />
    </g>
  );

  const renderGrid = () => (
    <g>
      {/* Grid paper background */}
      <rect width={width} height={height} fill="#ffffff" />

      {/* Horizontal grid lines */}
      {Array.from({ length: Math.floor(height / 15) }, (_, i) => (
        <line
          key={`grid-h-${i}`}
          x1={0}
          y1={i * 15}
          x2={width}
          y2={i * 15}
          stroke="#e5e7eb"
          strokeWidth={0.5}
        />
      ))}

      {/* Vertical grid lines */}
      {Array.from({ length: Math.floor(width / 15) }, (_, i) => (
        <line
          key={`grid-v-${i}`}
          x1={i * 15}
          y1={0}
          x2={i * 15}
          y2={height}
          stroke="#e5e7eb"
          strokeWidth={0.5}
        />
      ))}

      {/* Heavier lines every 5th line */}
      {Array.from({ length: Math.floor(height / 75) }, (_, i) => (
        <line
          key={`grid-h-heavy-${i}`}
          x1={0}
          y1={i * 75}
          x2={width}
          y2={i * 75}
          stroke="#9ca3af"
          strokeWidth={1}
        />
      ))}

      {Array.from({ length: Math.floor(width / 75) }, (_, i) => (
        <line
          key={`grid-v-heavy-${i}`}
          x1={i * 75}
          y1={0}
          x2={i * 75}
          y2={height}
          stroke="#9ca3af"
          strokeWidth={1}
        />
      ))}
    </g>
  );

  const renderDots = () => (
    <g>
      {/* Dot paper background */}
      <rect width={width} height={height} fill="#ffffff" />

      {/* Dot grid */}
      {Array.from({ length: Math.floor(height / 20) }, (_, row) =>
        Array.from({ length: Math.floor(width / 20) }, (_, col) => (
          <circle
            key={`dot-${row}-${col}`}
            cx={col * 20 + 10}
            cy={row * 20 + 10}
            r={1}
            fill="#9ca3af"
          />
        ))
      )}
    </g>
  );

  const renderBlank = () => (
    <rect
      width={width}
      height={height}
      fill="#ffffff"
      stroke="#e5e7eb"
      strokeWidth={1}
    />
  );

  const renderBackground = () => {
    switch (mode) {
      case "football":
        return renderFootballField();
      case "redzone":
        return renderRedZone();
      case "lines":
        return renderLines();
      case "grid":
        return renderGrid();
      case "dots":
        return renderDots();
      case "blank":
      default:
        return renderBlank();
    }
  };

  return (
    <svg width={width} height={height} className="absolute inset-0">
      {renderBackground()}
    </svg>
  );
};
