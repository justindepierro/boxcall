/**
 * Demo page for testing the DiagramEditor component
 */

import React from "react";
import { DiagramEditor } from "../components/playbook/diagram-editor/DiagramEditorNew";

export const DiagramEditorDemo: React.FC = () => {
  const handleChange = (data: any) => {
    console.log("Diagram changed:", data);
  };

  const handleSave = (data: any) => {
    console.log("Diagram saved:", data);
  };

  return (
    <div className="min-h-screen bg-neutral-900 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">
          BoxCall Diagram Editor Demo
        </h1>

        <div className="bg-neutral-800 rounded-lg p-6">
          <DiagramEditor
            diagramType="play"
            width={1200}
            height={600}
            enableRoutes={true}
            enablePlayerEditing={true}
            onChange={handleChange}
            onSave={handleSave}
          />
        </div>

        <div className="mt-6 text-sm text-neutral-400">
          <p>This is a demo of the unified diagram editor with:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Formation templates (I-Formation, Shotgun, Empty)</li>
            <li>Player positioning with NFL standards</li>
            <li>Route drawing capabilities (when enabled)</li>
            <li>Professional canvas rendering with Pixi.js</li>
            <li>Real-time formation updates</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DiagramEditorDemo;
