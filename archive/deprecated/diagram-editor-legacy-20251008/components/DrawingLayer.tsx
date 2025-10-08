import React from "react";
import { useDiagramEditor } from "../context/useDiagramEditor";
import { ShapeRenderer } from "./ShapeRenderer";

export const DrawingLayer: React.FC = () => {
  const { state } = useDiagramEditor();

  return (
    <g>
      {state.doc.shapes.map((shape) => (
        <ShapeRenderer key={shape.id} shape={shape} />
      ))}
    </g>
  );
};
