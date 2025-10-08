import { useContext } from "react";
import { DiagramEditorContext } from "./DiagramEditorContext";

export const useDiagramEditor = () => useContext(DiagramEditorContext);
