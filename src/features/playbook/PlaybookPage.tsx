import React from "react";
import { FieldCanvasProvider } from "../../components/playbook/diagram-v2/FieldCanvas/FieldCanvasContext";
import { FieldCanvasOrchestrator } from "../../components/playbook/diagram-v2/FieldCanvas/FieldCanvasOrchestrator";
import { Toolbar } from "../../components/playbook/diagram-v2/FieldCanvas/Toolbar";

// Main Playbook feature page
import { useState } from "react";
import { eventBus } from "../../lib/eventBus";

const PlaybookPage: React.FC = () => {
  const [activeTool, setActiveTool] = useState("select");
  const handleToolSelect = (tool: string) => {
    setActiveTool(tool);
    eventBus.publish({ type: "playbook:toolSelected", payload: { tool } });
  };
  return (
    <FieldCanvasProvider>
      <div
        style={{ display: "flex", flexDirection: "column", height: "100vh" }}
      >
        <Toolbar activeTool={activeTool} onToolSelect={handleToolSelect} />
        <div style={{ flex: 1, position: "relative" }}>
          <FieldCanvasOrchestrator />
        </div>
      </div>
    </FieldCanvasProvider>
  );
};

export default PlaybookPage;
