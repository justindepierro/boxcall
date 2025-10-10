import React, { useState } from "react";
import { BottomSheet } from "../BottomSheet";
import { TabBar, TabPanel, type Tab } from "../TabBar";
import { FloatingActionButton, FABPresets } from "../FloatingActionButton";
import { PlayerControls } from "./diagram-editor/components/PlayerControls";
import type { DiagramPixiApp } from "./diagram-editor/core/PixiApp";

interface MobileLayoutProps {
  app: DiagramPixiApp | null;
  selectedAlignment: "left" | "middle" | "right";
  children: React.ReactNode; // Canvas content
  onAddPlayer: () => void;
  onAddFormation: () => void;
  onClear: () => void;
  onUndo: () => void;
}

/**
 * MobileLayout - Bottom sheet + FAB layout
 * Used on mobile (< 768px)
 * 
 * Features:
 * - Maximum canvas space (90%+)
 * - Bottom sheet with tabs
 * - Floating action button for quick actions
 * - Swipe gestures
 */
export function MobileLayout({
  app,
  selectedAlignment,
  children,
  onAddPlayer,
  onAddFormation,
  onClear,
  onUndo,
}: MobileLayoutProps) {
  const [activeTab, setActiveTab] = useState("players");

  const tabs: Tab[] = [
    { id: "players", label: "Players", icon: "user" },
    { id: "formations", label: "Formations", icon: "grid" },
    { id: "defense", label: "Defense", icon: "shield" },
    { id: "align", label: "Align", icon: "align-center" },
    { id: "settings", label: "Settings", icon: "settings" },
  ];

  const fabActions = FABPresets.diagramEditor({
    onAddPlayer,
    onAddFormation,
    onClear,
    onUndo,
  });

  return (
    <>
      {/* Canvas Area - Full screen */}
      <div className="flex-1 relative overflow-hidden bg-surface-secondary">
        {children}
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton actions={fabActions} zIndex={45} />

      {/* Bottom Sheet with Tabs */}
      <BottomSheet
        snapPoints={[0.08, 0.5, 0.9]}
        initialSnapPoint={0}
        zIndex={40}
      >
        {/* Tab Navigation */}
        <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab Content */}
        <div className="px-4 py-4">
          <TabPanel id="players" active={activeTab === "players"}>
            <PlayerControls app={app} externalAlignment={selectedAlignment} />
          </TabPanel>

          <TabPanel id="formations" active={activeTab === "formations"}>
            <div className="text-center py-8 text-secondary">
              <p>Formations tab</p>
              <p className="text-xs mt-2">Coming soon...</p>
            </div>
          </TabPanel>

          <TabPanel id="defense" active={activeTab === "defense"}>
            <div className="text-center py-8 text-secondary">
              <p>Defense tab</p>
              <p className="text-xs mt-2">Coming soon...</p>
            </div>
          </TabPanel>

          <TabPanel id="align" active={activeTab === "align"}>
            <div className="text-center py-8 text-secondary">
              <p>Alignment tab</p>
              <p className="text-xs mt-2">Coming soon...</p>
            </div>
          </TabPanel>

          <TabPanel id="settings" active={activeTab === "settings"}>
            <div className="text-center py-8 text-secondary">
              <p>Settings tab</p>
              <p className="text-xs mt-2">Coming soon...</p>
            </div>
          </TabPanel>
        </div>
      </BottomSheet>
    </>
  );
}
