import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { VisualPlayBuilderV2 } from "./VisualPlayBuilderV2";
import { Button } from "../../ui/Button";
import { X } from "lucide-react";

// Lightweight wrapper to present VisualPlayBuilderV2 as a full-screen route (parity with legacy VisualPlayBuilder route)
export const DiagramV2Route: React.FC = () => {
  const [_params] = useSearchParams();
  const navigate = useNavigate();
  // TODO: Integrate loading existing play by id when persistence wired
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-full max-h-[90vh] flex flex-col overflow-hidden">
        <VisualPlayBuilderV2 />
      </div>
      <Button
        variant="ghost"
        size="xs"
        onClick={() => navigate("/playbook")}
        className="absolute top-4 right-4 bg-white/70 backdrop-blur p-1 h-auto w-auto"
        aria-label="Close diagram"
      >
        <X className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default DiagramV2Route;
