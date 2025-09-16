import React, { useReducer } from "react";
import { DiagramEditorContext, initialState } from "./DiagramEditorContext";
import { reducer } from "./context";

export const DiagramEditorProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <DiagramEditorContext.Provider value={{ state, dispatch }}>
      {children}
    </DiagramEditorContext.Provider>
  );
};
