import React from "react";
import { PlayerControls } from "./diagram-editor/components/PlayerControls";
import type { ProfessionalPixiEngine } from "./diagram-editor/core/ProfessionalPixiEngine";

interface DesktopLayoutProps {
  app: ProfessionalPixiEngine | null;
  selectedAlignment: "left" | "middle" | "right";
  children: React.ReactNode; // Canvas content
}

/**
 * DesktopLayout - Traditional sidebar + canvas layout
 * Used on desktop (≥ 1024px)
 */
export function DesktopLayout({
  app,
  selectedAlignment,
  children,
}: DesktopLayoutProps) {
  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left Sidebar */}
      <div className="w-64 bg-surface-card border-r border-border flex-shrink-0 overflow-y-auto">
        <PlayerControls app={app} externalAlignment={selectedAlignment} />
      </div>

      {/* Canvas Area */}
      <div className="flex-1 relative overflow-hidden bg-surface-secondary">
        {children}
      </div>
    </div>
  );
}
