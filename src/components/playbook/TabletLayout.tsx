import React from "react";
import { DesktopLayout } from "./DesktopLayout";
import type { DiagramPixiApp } from "./diagram-editor/core/PixiApp";

interface TabletLayoutProps {
  app: DiagramPixiApp | null;
  selectedAlignment: "left" | "middle" | "right";
  children: React.ReactNode; // Canvas content
}

/**
 * TabletLayout - Hybrid sidebar approach
 * Used on tablet (768px - 1023px)
 *
 * For now, uses same layout as desktop but could be enhanced with:
 * - Collapsible sidebar
 * - Floating panels
 * - Touch-optimized controls
 */
export function TabletLayout({
  app,
  selectedAlignment,
  children,
}: TabletLayoutProps) {
  // Use desktop layout for tablets (for now)
  // TODO: Implement tablet-specific optimizations
  return (
    <DesktopLayout app={app} selectedAlignment={selectedAlignment}>
      {children}
    </DesktopLayout>
  );
}
