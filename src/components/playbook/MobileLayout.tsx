import React, { useState } from "react";
import { BottomSheet } from "../BottomSheet";
import { TabBar, TabPanel, type Tab } from "../TabBar";
import { FloatingActionButton } from "../FloatingActionButton";
import { FABPresets } from "../FABPresets";
import { PlayersTab } from "./diagram-editor/components/tabs/PlayersTab";
import { FormationsTab } from "./diagram-editor/components/tabs/FormationsTab";
import { DefenseTab } from "./diagram-editor/components/tabs/DefenseTab";
import { AlignTab } from "./diagram-editor/components/tabs/AlignTab";
import { SettingsTab } from "./diagram-editor/components/tabs/SettingsTab";
import type { DiagramPixiApp } from "./diagram-editor/core/PixiApp";

interface MobileLayoutProps {
  app: DiagramPixiApp | null;
  selectedAlignment: "left" | "middle" | "right";
  onAlignmentChange: (alignment: "left" | "middle" | "right") => void;
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
  onAlignmentChange,
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
    { id: "align", label: "Align", icon: "move" },
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

        {/* Tab Content - Lazy loaded: only active tab is rendered */}
        <div className="px-4 py-4">
          {activeTab === "players" && (
            <TabPanel id="players" active={true}>
              <PlayersTab app={app} />
            </TabPanel>
          )}

          {activeTab === "formations" && (
            <TabPanel id="formations" active={true}>
              <FormationsTab app={app} selectedAlignment={selectedAlignment} />
            </TabPanel>
          )}

          {activeTab === "defense" && (
            <TabPanel id="defense" active={true}>
              <DefenseTab app={app} selectedAlignment={selectedAlignment} />
            </TabPanel>
          )}

          {activeTab === "align" && (
            <TabPanel id="align" active={true}>
              <AlignTab
                selectedAlignment={selectedAlignment}
                onAlignmentChange={onAlignmentChange}
              />
            </TabPanel>
          )}

          {activeTab === "settings" && (
            <TabPanel id="settings" active={true}>
              <SettingsTab />
            </TabPanel>
          )}
        </div>
      </BottomSheet>
    </>
  );
}
