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
import { PlayerPropertiesDrawer } from "./diagram-editor/components/PlayerPropertiesDrawer";
import { ContextualToolbar } from "./diagram-editor/components/ContextualToolbar";
import { useDiagramStore } from "./diagram-editor/stores/diagramStore";
import { useToast } from "@hooks/useToast";
import { haptics } from "@utils/haptics";
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

  // Store state
  const {
    players,
    selectedPlayerId,
    selectPlayer,
    updatePlayer,
    removePlayer,
  } = useDiagramStore();

  const toast = useToast();

  // Get selected player object
  const selectedPlayer = selectedPlayerId
    ? players.find((p) => p.id === selectedPlayerId) || null
    : null;

  // Player Properties Drawer handlers
  const handleCloseDrawer = () => {
    selectPlayer(null);
  };

  const handleFlipSide = (playerId: string) => {
    const player = players.find((p) => p.id === playerId);
    if (!player || !app) return;

    haptics.medium(); // Tactile feedback for transformation

    // Get center X for current alignment
    const centerX = app.coordinates.fieldWidth / 2;

    // Calculate flipped X position (mirror across center)
    const distanceFromCenter = player.x - centerX;
    const flippedX = centerX - distanceFromCenter;

    updatePlayer(playerId, { x: flippedX });
    toast.success("Player flipped");
  };

  const handleEditPosition = (_playerId: string) => {
    haptics.light(); // Light tap for UI action
    // TODO: Open position editor modal
    toast.info("Position editor coming soon");
  };

  const handleCopyPlayer = (playerId: string) => {
    const player = players.find((p) => p.id === playerId);
    if (!player) return;

    haptics.medium(); // Tactile feedback for creation

    // Create duplicate with slight offset
    const duplicate = {
      ...player,
      id: `player-${Date.now()}`,
      x: player.x + 2, // Offset 2 yards right
    };

    useDiagramStore.getState().addPlayer(duplicate);
    toast.success("Player duplicated");
  };

  const handleDeletePlayer = (playerId: string) => {
    haptics.heavy(); // Heavy feedback for destructive action
    removePlayer(playerId);
    toast.success("Player deleted");
  };

  // Contextual Toolbar handlers (placeholder for now)
  const handleSelectAll = () => {
    // TODO: Implement multi-selection
    toast.info("Select all coming soon");
  };

  const handleToolbarFlip = () => {
    // TODO: Flip all selected players
    toast.info("Bulk flip coming soon");
  };

  const handleAlign = () => {
    // TODO: Align selected players
    toast.info("Align players coming soon");
  };

  const handleDistribute = () => {
    // TODO: Distribute selected players evenly
    toast.info("Distribute coming soon");
  };

  const handleToolbarCopy = () => {
    // TODO: Copy all selected players
    toast.info("Bulk copy coming soon");
  };

  const handleToolbarDelete = () => {
    // TODO: Delete all selected players
    toast.info("Bulk delete coming soon");
  };

  const handleDeselectAll = () => {
    selectPlayer(null);
  };

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

      {/* Player Properties Drawer - Shows when player selected */}
      <PlayerPropertiesDrawer
        player={selectedPlayer}
        onClose={handleCloseDrawer}
        onFlipSide={handleFlipSide}
        onEditPosition={handleEditPosition}
        onCopy={handleCopyPlayer}
        onDelete={handleDeletePlayer}
      />

      {/* Contextual Toolbar - Adaptive actions based on selection */}
      <ContextualToolbar
        selectedPlayers={selectedPlayer ? [selectedPlayer] : []}
        onSelectAll={handleSelectAll}
        onFlipSide={handleToolbarFlip}
        onAlign={handleAlign}
        onDistribute={handleDistribute}
        onCopy={handleToolbarCopy}
        onDelete={handleToolbarDelete}
        onDeselectAll={handleDeselectAll}
      />

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
