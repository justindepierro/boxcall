import { useContext } from "react";
import { UndoRedoContext } from "../contexts/UndoRedoContext";

/**
 * Hook to access undo/redo functionality
 * Separated from context file for fast refresh compatibility
 */
export const useUndoRedo = () => {
  const context = useContext(UndoRedoContext);
  if (!context) {
    throw new Error("useUndoRedo must be used within UndoRedoProvider");
  }
  return context;
};