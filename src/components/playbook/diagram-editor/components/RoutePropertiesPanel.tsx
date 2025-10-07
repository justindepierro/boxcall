import { colorTokens } from "../../../../design-system/tokens";
import { useDiagramEditor } from "../context/useDiagramEditor";

export const RoutePropertiesPanel: React.FC = () => {
  const { state, dispatch } = useDiagramEditor();

  // Get the selected route - for now, we'll need to determine this from selected elements
  // This is a simplified version - in a full implementation we'd track selected routes
  const selectedRouteId = state.ui.selectedIds?.find((id) =>
    state.doc.routes.some((route) => route.id === id)
  );
  const selectedRoute = selectedRouteId
    ? state.doc.routes.find((r) => r.id === selectedRouteId)
    : null;

  if (!selectedRoute) {
    return (
      <div className="p-4">
        <div className="text-sm text-content-secondary">
          Select a route to edit properties
        </div>
      </div>
    );
  }

  const colorOptions = [
    colorTokens.red[500], // Red
    colorTokens.blue[500], // Blue
    colorTokens.emerald[500], // Green
    colorTokens.amber[500], // Yellow
    colorTokens.purple[500], // Purple
    colorTokens.violet[400], // Pink
    colorTokens.gray[500], // Gray
    "#000000", // Black
  ];

  // Get the associated player for context
  const associatedPlayer = state.doc.players.find(
    (p) => p.id === selectedRoute.playerId
  );

  return (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="text-sm font-medium text-content-primary mb-3">
          Route Properties
        </h3>
        {associatedPlayer && (
          <div className="text-xs text-content-secondary mb-2">
            Player: {associatedPlayer.label}
          </div>
        )}
      </div>

      {/* Color */}
      <div>
        <label className="block text-xs font-medium text-content-secondary mb-2">
          Color
        </label>
        <div className="grid grid-cols-4 gap-2">
          {colorOptions.map((color) => (
            <button
              key={color}
              onClick={() => {
                // Update route color - we'd need to implement this action
                // For now, this is a placeholder
                console.log("Update route color:", color);
              }}
              className={`w-8 h-8 rounded-lg border-2 ${
                selectedRoute.color === color
                  ? "border-primary"
                  : "border-border hover:border-primary/50"
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* Route Info */}
      <div className="space-y-2">
        <div>
          <label className="block text-xs font-medium text-content-secondary mb-1">
            Segments
          </label>
          <div className="text-sm text-content-primary">
            {selectedRoute.segments.length} segment
            {selectedRoute.segments.length !== 1 ? "s" : ""}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-content-secondary mb-1">
            Total Length
          </label>
          <div className="text-sm text-content-primary">
            {/* Calculate approximate route length */}~
            {Math.round(
              selectedRoute.segments.reduce((total, segment) => {
                if (segment.points.length >= 2) {
                  let segmentLength = 0;
                  for (let i = 1; i < segment.points.length; i++) {
                    const dx = segment.points[i].x - segment.points[i - 1].x;
                    const dy = segment.points[i].y - segment.points[i - 1].y;
                    segmentLength += Math.sqrt(dx * dx + dy * dy);
                  }
                  return total + segmentLength;
                }
                return total;
              }, 0) * 10
            )}{" "}
            yards
          </div>
        </div>
      </div>

      {/* Route Templates */}
      <div>
        <label className="block text-xs font-medium text-content-secondary mb-2">
          Quick Templates
        </label>
        <div className="space-y-1">
          <button
            onClick={() => {
              // Apply slant route template
              console.log("Apply slant template");
            }}
            className="w-full text-left px-2 py-1 text-sm bg-surface-secondary hover:bg-surface-tertiary text-content-primary rounded-lg transition-colors"
          >
            Slant
          </button>
          <button
            onClick={() => {
              // Apply out route template
              console.log("Apply out template");
            }}
            className="w-full text-left px-2 py-1 text-sm bg-surface-secondary hover:bg-surface-tertiary text-content-primary rounded-lg transition-colors"
          >
            Out
          </button>
          <button
            onClick={() => {
              // Apply curl route template
              console.log("Apply curl template");
            }}
            className="w-full text-left px-2 py-1 text-sm bg-surface-secondary hover:bg-surface-tertiary text-content-primary rounded-lg transition-colors"
          >
            Curl
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="pt-4 divider-t">
        <button
          onClick={() =>
            dispatch({ type: "DELETE_ROUTE", routeId: selectedRoute.id })
          }
          className="w-full px-3 py-2 text-sm bg-error-600 hover:bg-error-700 text-white rounded-lg transition-colors"
        >
          Delete Route
        </button>
      </div>
    </div>
  );
};
