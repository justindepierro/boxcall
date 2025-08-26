import React, { useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

import { telemetry } from "../../telemetry/dispatcher";
import { TelemetryEventTypes } from "../../telemetry/events";
import { Button } from "../ui/Button/Button";
import { Icon } from "../ui/Icon/Icon";

import { VisualPlayBuilder } from "./diagram/VisualPlayBuilder";
import { ROUTES } from "../../routes/paths";

export const DiagramPaneRoute: React.FC = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const playId = params.get("playId");

  const handleClose = useCallback(() => navigate(ROUTES.PLAYBOOK), [navigate]);

  // Close on ESC key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleClose]);

  // (future) optionally load play by id here if needed

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        className="surface-card rounded-md p-0 shadow-lg w-full max-w-7xl h-full max-h-[90vh] flex flex-col overflow-hidden relative border border-subtle"
        role="dialog"
        aria-modal="true"
      >
        <VisualPlayBuilder
          onDocumentChange={(doc) => {
            telemetry.enqueue({
              type: TelemetryEventTypes.PlayDiagramUpdated,
              data: { playId: playId || "free", routes: doc.routes.length },
            });
          }}
        />
        <Button
          variant="ghost"
          size="xs"
          onClick={handleClose}
          className="absolute top-3 right-3 surface-subtle/70 backdrop-blur p-1 h-auto w-auto"
          aria-label="Close diagram"
        >
          <Icon name="close" className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default DiagramPaneRoute;
