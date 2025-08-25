import { useFieldCanvas } from "./useFieldCanvas";
import type { AnnotationType } from "./FieldCanvasContext";

export const Annotation: React.FC = () => {
  const { state } = useFieldCanvas();
  return (
    <g>
      {state.doc.annotations
        .filter(
          (a: AnnotationType): a is AnnotationType =>
            a.type === "connector" && Boolean(a.from) && Boolean(a.to)
        )
        .map((a: AnnotationType) => (
          <g key={a.id}>
            <line
              x1={a.from!.x}
              y1={a.from!.y}
              x2={a.to!.x}
              y2={a.to!.y}
              stroke={a.color || "#111827"}
              strokeWidth={a.width || 3}
            />
            <circle
              cx={a.from!.x}
              cy={a.from!.y}
              r={5}
              fill={a.color || "#111827"}
            />
          </g>
        ))}
    </g>
  );
};
