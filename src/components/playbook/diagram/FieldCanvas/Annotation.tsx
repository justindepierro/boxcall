import { useFieldCanvas } from "../FieldCanvas/useFieldCanvas";
import type { AnnotationType } from "./FieldCanvasContext";
import { Arrow } from "./Arrow";
import { Text as CanvasText } from "./Text";
import { colorTokens } from "../../../../design-system/tokens";

export const Annotation: React.FC = () => {
  const { state } = useFieldCanvas();
  return (
    <g>
      {/* Connector arrows */}
      {state.doc.annotations
        .filter(
          (a: AnnotationType): a is AnnotationType =>
            a.type === "connector" && !!a.from && !!a.to
        )
        .map((a: AnnotationType) => (
          <g key={a.id}>
            <Arrow
              x1={a.from!.x}
              y1={a.from!.y}
              x2={a.to!.x}
              y2={a.to!.y}
              color={a.color || colorTokens.gray[900]}
            />
          </g>
        ))}
      {/* Note annotations */}
      {state.doc.annotations
        .filter(
          (a: AnnotationType): a is AnnotationType =>
            a.type === "note" && Array.isArray(a.points) && a.points.length > 0
        )
        .map((a: AnnotationType) => (
          <g key={a.id}>
            <CanvasText
              x={a.points![0].x}
              y={a.points![0].y}
              text={"Note"}
              color={a.color || colorTokens.amber[400]}
              fontSize={16}
            />
            <circle
              cx={a.points![0].x}
              cy={a.points![0].y}
              r={8}
              fill={a.color || colorTokens.amber[400]}
              opacity={0.7}
            />
          </g>
        ))}
    </g>
  );
};
