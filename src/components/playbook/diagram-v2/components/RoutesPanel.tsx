import React from "react";
import { useDiagramEditor } from "../context";
import { Button } from "../../../ui/Button";

export const RoutesPanel: React.FC = () => {
  const { state, dispatch } = useDiagramEditor();
  if (!state.doc.routes.length) return null;
  return (
    <div className="mt-4">
      <div className="text-[11px] font-semibold text-text-xssrimary mt-2 mb-1">
        ROUTES
      </div>
      <ul className="space-y-1">
        {state.doc.routes.map((r) => (
          <li
            key={r.id}
            className="flex items-center justify-between text-[11px] surface-card/70 rounded-lg px-2 py-1 border border-subtle"
          >
            <span>
              {r.playerId} ·{" "}
              {r.segments.reduce((a, s) => a + s.points.length - 1, 0)} pts
            </span>
            <Button
              size="xs"
              variant="ghost"
              onClick={() => dispatch({ type: "DELETE_ROUTE", routeId: r.id })}
            >
              ✕
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
};
