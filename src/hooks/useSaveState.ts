import { useContext } from "react";
import { SaveStateContext } from "../contexts/SaveStateContext";

export const useSaveState = () => {
  const context = useContext(SaveStateContext);
  if (!context) {
    throw new Error("useSaveState must be used within SaveStateProvider");
  }
  return context;
};