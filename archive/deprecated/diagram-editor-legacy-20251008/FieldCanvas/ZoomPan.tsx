import React from "react";
import { useFieldCanvas } from "./useFieldCanvas";
import { colorTokens } from "../../../../design-system/tokens";

export const ZoomPan: React.FC = () => {
  const { state } = useFieldCanvas();
  const zoom = state.ui.zoom;
  const panX = state.ui.panX;
  const panY = state.ui.panY;
  const MINI_W = 160;
  const widthWorld = 1600 / zoom;
  const heightWorld = 900 / zoom;
  let xWorld = -panX / zoom;
  let yWorld = -panY / zoom;
  xWorld = Math.max(0, Math.min(1600 - widthWorld, xWorld));
  yWorld = Math.max(0, Math.min(900 - heightWorld, yWorld));
  const scale = MINI_W / 1600;
  const rx = xWorld * scale;
  const ry = yWorld * scale;
  const rw = widthWorld * scale;
  const rh = heightWorld * scale;
  return (
    <foreignObject
      x={1200}
      y={700}
      width={MINI_W + 2}
      height={MINI_W * 0.5625 + 2}
    >
      <div style={{ width: MINI_W + 2, height: MINI_W * 0.5625 + 2 }}>
        <svg
          width={MINI_W + 2}
          height={MINI_W * 0.5625 + 2}
          viewBox={`0 0 ${MINI_W + 2} ${MINI_W * 0.5625 + 2}`}
        >
          <rect
            x={0}
            y={0}
            width={MINI_W + 2}
            height={MINI_W * 0.5625 + 2}
            rx={6}
            fill="#fff"
            opacity={0.8}
          />
          <g transform={`translate(1 1)`}>
            <rect
              x={0}
              y={0}
              width={MINI_W}
              height={MINI_W * 0.5625}
              fill={colorTokens.emerald[900]}
              opacity={0.6}
            />
            <rect
              x={rx}
              y={ry}
              width={rw}
              height={rh}
              fill="none"
              stroke={colorTokens.emerald[500]}
              strokeWidth={2}
            />
          </g>
        </svg>
      </div>
    </foreignObject>
  );
};
