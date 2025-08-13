import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { telemetry } from "../../telemetry/dispatcher";
import { TelemetryEventTypes } from "../../telemetry/events";
import { Button } from "../ui/Button/Button";
import { X } from "lucide-react";

import { VisualPlayBuilderV2 } from "./diagram-v2/VisualPlayBuilderV2";

export const DiagramPaneRoute: React.FC = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const playId = params.get("playId");

  const handleClose = () => navigate("/playbook");

  // (future) optionally load play by id here if needed

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-md p-0 shadow-lg w-full max-w-7xl h-full max-h-[90vh] flex flex-col overflow-hidden relative">
        <VisualPlayBuilderV2
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
          className="absolute top-3 right-3 bg-white/70 backdrop-blur p-1 h-auto w-auto"
          aria-label="Close diagram"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default DiagramPaneRoute;
