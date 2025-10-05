import { useDiagramEditor } from "./useDiagramEditor";
import { colorTokens } from "../../../../design-system/tokens";

export const useAddPlayer = () => {
  const { dispatch } = useDiagramEditor();
  return () => {
    dispatch({
      type: "ADD_PLAYER",
      player: {
        id: `P${Date.now().toString(36)}`,
        label: "P",
        x: 50,
        y: 60,
        color: colorTokens.blue[600],
      },
    });
  };
};
