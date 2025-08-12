import React, { useRef, useEffect } from "react";
import { useDiagramEditor } from "./context";

// Simple SVG field canvas with zoom/pan transforms (placeholder)
export const FieldCanvas: React.FC<{
  className?: string;
  onPlayerMouseDown?: (id: string, e: React.MouseEvent) => void;
}> = ({ className, onPlayerMouseDown }) => {
  const { state } = useDiagramEditor();
  const { doc } = state;
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  return (
    <div className={className}>
      <svg
        ref={svgRef}
        viewBox="0 0 1600 900"
        className="w-full h-full bg-emerald-700/90 rounded-md shadow-inner"
        role="img"
        aria-label="Diagram field"
      >
        {/* Yard lines (every 5) */}
        {doc.field.showYardLines &&
          Array.from({ length: 21 }).map((_, i) => (
            <line
              key={i}
              x1={i * (1600 / 20)}
              x2={i * (1600 / 20)}
              y1={0}
              y2={900}
              stroke="#065f46"
              strokeWidth={i % 2 === 0 ? 3 : 1}
              opacity={0.6}
            />
          ))}
        {/* Hash marks placeholder */}
        {doc.field.showHashMarks &&
          Array.from({ length: 21 }).map((_, i) => (
            <g key={`h${i}`}>
              {Array.from({ length: 20 }).map((__, j) => (
                <rect
                  key={j}
                  x={i * (1600 / 20) - 2}
                  y={j * (900 / 20) + 10}
                  width={4}
                  height={2}
                  fill="#047857"
                  opacity={0.5}
                />
              ))}
            </g>
          ))}
        {/* Players */}
        {doc.players.map((p) => (
          <g
            key={p.id}
            transform={`translate(${(p.x / 100) * 1600},${(p.y / 100) * 900})`}
            className="cursor-pointer"
            onMouseDown={(e) => onPlayerMouseDown?.(p.id, e)}
          >
            <circle
              r={20}
              fill={p.color || "#1e3a8a"}
              stroke="#fff"
              strokeWidth={2}
            />
            {doc.field.showPlayerLabels && (
              <text
                x={0}
                y={5}
                fontSize={26}
                fontWeight={600}
                fill="#fff"
                textAnchor="middle"
                style={{ pointerEvents: "none", userSelect: "none" }}
              >
                {p.label}
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
};
