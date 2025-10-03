import React, { createContext, useContext, useReducer, ReactNode } from "react";

// Types for diagram elements
export interface DiagramElement {
  id: string;
  type: "player" | "route" | "shape" | "text";
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation?: number;
  data: any;
  style?: {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
  };
}

export interface Personnel {
  id: string;
  name: string;
  position: string;
  jerseyNumber: number;
  isStarter: boolean;
}

export interface Formation {
  id: string;
  name: string;
  personnel: Personnel[];
  positions: Array<{
    personnelId: string;
    x: number;
    y: number;
  }>;
}

export interface DiagramState {
  elements: DiagramElement[];
  selectedElements: string[];
  formation: Formation | null;
  tool: "select" | "player" | "route" | "shape" | "text";
  snapToGrid: boolean;
  showGrid: boolean;
  zoom: number;
  pan: { x: number; y: number };
}

type DiagramAction =
  | { type: "ADD_ELEMENT"; element: DiagramElement }
  | { type: "UPDATE_ELEMENT"; id: string; updates: Partial<DiagramElement> }
  | { type: "DELETE_ELEMENT"; id: string }
  | { type: "SELECT_ELEMENT"; id: string }
  | { type: "DESELECT_ALL" }
  | { type: "SET_TOOL"; tool: DiagramState["tool"] }
  | { type: "SET_FORMATION"; formation: Formation }
  | { type: "SET_ZOOM"; zoom: number }
  | { type: "SET_PAN"; pan: { x: number; y: number } }
  | { type: "TOGGLE_GRID" }
  | { type: "TOGGLE_SNAP" };

const initialState: DiagramState = {
  elements: [],
  selectedElements: [],
  formation: null,
  tool: "select",
  snapToGrid: true,
  showGrid: true,
  zoom: 1,
  pan: { x: 0, y: 0 },
};

function diagramReducer(
  state: DiagramState,
  action: DiagramAction
): DiagramState {
  switch (action.type) {
    case "ADD_ELEMENT":
      return {
        ...state,
        elements: [...state.elements, action.element],
      };

    case "UPDATE_ELEMENT":
      return {
        ...state,
        elements: state.elements.map((el) =>
          el.id === action.id ? { ...el, ...action.updates } : el
        ),
      };

    case "DELETE_ELEMENT":
      return {
        ...state,
        elements: state.elements.filter((el) => el.id !== action.id),
        selectedElements: state.selectedElements.filter(
          (id) => id !== action.id
        ),
      };

    case "SELECT_ELEMENT":
      return {
        ...state,
        selectedElements: [action.id],
      };

    case "DESELECT_ALL":
      return {
        ...state,
        selectedElements: [],
      };

    case "SET_TOOL":
      return {
        ...state,
        tool: action.tool,
      };

    case "SET_FORMATION":
      return {
        ...state,
        formation: action.formation,
      };

    case "SET_ZOOM":
      return {
        ...state,
        zoom: action.zoom,
      };

    case "SET_PAN":
      return {
        ...state,
        pan: action.pan,
      };

    case "TOGGLE_GRID":
      return {
        ...state,
        showGrid: !state.showGrid,
      };

    case "TOGGLE_SNAP":
      return {
        ...state,
        snapToGrid: !state.snapToGrid,
      };

    default:
      return state;
  }
}

interface DiagramContextType {
  state: DiagramState;
  dispatch: React.Dispatch<DiagramAction>;
}

const DiagramContext = createContext<DiagramContextType | undefined>(undefined);

export const DiagramProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(diagramReducer, initialState);

  return (
    <DiagramContext.Provider value={{ state, dispatch }}>
      {children}
    </DiagramContext.Provider>
  );
};

export const useDiagramEditor = (): DiagramContextType => {
  const context = useContext(DiagramContext);
  if (!context) {
    throw new Error("useDiagramEditor must be used within a DiagramProvider");
  }
  return context;
};
