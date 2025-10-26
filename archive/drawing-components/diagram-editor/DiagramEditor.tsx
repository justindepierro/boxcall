/**
 * Pixi Diagram Editor - Main Entry Point
 *
 * Elite football diagram editor using Pixi.js v8.14.0
 * for hardware-accelerated WebGL rendering and mobile-first experience.
 */

import React, { useState, useEffect, useCallback } from "react";
import { DiagramCanvas } from "./components/DiagramCanvas";
import { PixiErrorBoundary } from "./components/PixiErrorBoundary";
import { LandscapePrompt } from "../../LandscapePrompt";
import { DesktopLayout } from "../DesktopLayout";
import { MobileLayout } from "../MobileLayout";
import { TabletLayout } from "../TabletLayout";
import { useKeyboardControls } from "./hooks/useKeyboardControls";
import { useCopyPaste } from "./hooks/useCopyPaste";
import { useDragBoxSelection } from "./hooks/useDragBoxSelection";
import { useUndoRedo } from "./hooks/useUndoRedo";
import { useDiagramStore } from "./stores/diagramStore";
import { useBreakpoint } from "../../../hooks/useBreakpoint";
import { useIsMobilePortrait } from "../../../hooks/useOrientation";
import { Icon } from "../../../components/ui/Icon/Icon";
import { PersonnelManager } from "./components/PersonnelManager";
import { useSaveManager } from "./components/SaveManager";
import { useToolbarManager } from "./components/ToolbarManager";
import { useModalManager } from "./hooks/useModalManager";
import { DiagramToolbar } from "./components/DiagramToolbar";
import { FormationPickerModal } from "./components/FormationPickerModal";
import { QuickPlayEditor } from "./components/QuickPlayEditor";
import { TemplateEditor } from "./components/TemplateEditor";
import { useFormations } from "../../../hooks/useFormations";
import { useRecentPlayCombos } from "../../../hooks/useRecentPlayCombos";
import { PLAY_TYPE_OPTIONS } from "../../../types/play";
import type { ProfessionalPixiEngine } from "./core/ProfessionalPixiEngine";
import type { FieldColorMode } from "./layers/FieldLayer";
import type { Play } from "../../../types/play";
import type { ToolType } from "./stores/diagramStore";
import type { UnifiedDiagramData } from "./types/UnifiedDiagramTypes";
import { useCollaborativeSession } from "./hooks/useCollaborativeSession";
import { UserPresencePanel } from "./components/UserPresencePanel";
import { CollaborativeCursors } from "./components/CollaborativeCursors";
import { ExecutionHeatMap } from "./components/ExecutionHeatMap";
import { usePersonnelConfigurationByName } from "../../../hooks/usePersonnel";
import { VersionHistoryPanel } from "./components/VersionHistoryPanel";
import { RouteAnalyticsDashboard } from "./components/RouteAnalyticsDashboard";
import type { DiagramFieldPosition } from "./types/types";

export interface DiagramEditorProps {
  onClose?: () => void;
  play?: Play | null; // Optional play to load personnel from and enable autosave
  mode?: "edit" | "quick-play" | "template"; // New mode prop for different editor modes
  onQuickPlaySave?: (data: UnifiedDiagramData) => Promise<void>; // Callback for quick play creation
  onTemplateSave?: (data: UnifiedDiagramData) => Promise<void>; // Callback for template creation
  diagramId?: string; // Optional diagram ID for collaborative editing
  enableCollaboration?: boolean; // Enable collaborative editing features
  enableHeatMap?: boolean; // Enable execution heat map overlay
}

const DiagramEditorComponent: React.FC<DiagramEditorProps> = ({
  onClose,
  play,
  mode = "edit", // Default to edit mode
  onQuickPlaySave,
  onTemplateSave,
  diagramId,
  enableCollaboration = false,
  enableHeatMap = false,
}) => {
  const [app, setApp] = useState<ProfessionalPixiEngine | null>(null);
  const [showHeatMap, setShowHeatMap] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Get diagram state from store with selective selectors
  const colorMode = useDiagramStore((state) => state.colorMode);
  const fieldPosition = useDiagramStore((state) => state.fieldPosition);
  const selectedAlignment = useDiagramStore((state) => state.selectedAlignment);
  const selectedRouteType = useDiagramStore((state) => state.selectedRouteType);
  const dismissedLandscapePrompt = useDiagramStore(
    (state) => state.dismissedLandscapePrompt
  );
  const showFormationPicker = useDiagramStore(
    (state) => state.showFormationPicker
  );

  const setColorMode = useDiagramStore((state) => state.setColorMode);
  const setFieldPosition = useDiagramStore((state) => state.setFieldPosition);
  const setSelectedAlignment = useDiagramStore(
    (state) => state.setSelectedAlignment
  );
  const setSelectedRouteType = useDiagramStore(
    (state) => state.setSelectedRouteType
  );
  const setDismissedLandscapePrompt = useDiagramStore(
    (state) => state.setDismissedLandscapePrompt
  );
  const setShowFormationPicker = useDiagramStore(
    (state) => state.setShowFormationPicker
  );

  // Get route selection state and active tool from store
  const selectedRouteId = useDiagramStore((state) => state.selectedRouteId);
  const activeTool = useDiagramStore((state) => state.activeTool);
  const setActiveTool = useDiagramStore((state) => state.setActiveTool);

  const breakpoint = useBreakpoint();
  const { isMobilePortrait } = useIsMobilePortrait();

  // Fetch personnel configuration if play has personnel assigned
  const personnelName = play?.personnel || ""; // Use play's personnel or empty
  const playbookId = play?.playbook_id;

  const { data: personnelConfig } = usePersonnelConfigurationByName(
    playbookId,
    personnelName
  );

  // Fetch formations for formation picker
  const { data: formations = [] } = useFormations(playbookId);

  // Fetch recent play combos for quick play editor
  const { combos: recentCombos } = useRecentPlayCombos();

  // Collaborative editing session
  const {
    isConnected: _isCollaborativeConnected,
    handleMouseMove: _handleMouseMove,
    handleSelectionChange: _handleSelectionChange,
  } = useCollaborativeSession({
    diagramId: diagramId || play?.id || "default",
    enabled: enableCollaboration,
  });

  // Modal management
  const {
    showAlert,
    alertTitle,
    alertMessage,
    showConfirm,
    confirmTitle,
    confirmMessage,
    showSaveDialog,
    showUnsavedChanges,
    setShowSaveDialog,
    setShowUnsavedChanges,
    showAlertModal,
    showConfirmModal,
    handleAlertClose,
    handleConfirmClose,
    handleConfirmConfirm,
  } = useModalManager();

  // Show landscape prompt if on mobile in portrait and not dismissed
  const showLandscapePrompt = isMobilePortrait && !dismissedLandscapePrompt;

  // PersonnelManager handles loading personnel players into diagram
  <PersonnelManager personnelConfig={personnelConfig} />;

  const { players, routes } = useDiagramStore();

  // Create route positions for heat map
  const routePositions = routes.map((route) => ({
    routeId: route.id,
    waypoints: route.waypoints || [],
  }));

  // Save management
  const {
    playName,
    setPlayName,
    isDirty,
    setIsDirty,
    saveStatus,
    lastSaved,
    handleSave,
    performSave,
  } = useSaveManager({
    play,
    players,
    routes,
    onSaveSuccess: () => {
      // Handle save success (could show toast, etc.)
    },
    onShowSaveDialog: () => setShowSaveDialog(true),
  });

  // Toolbar management
  const {
    handleAddSingleOffense,
    handleAddSingleDefense,
    handleDeleteSelected,
    handleClearOffense,
    handleClearDefense,
    handleClearWhiteboard,
    handleAlignmentChange,
    handleLoadFormation,
    handleAlignPlayers,
    handleDistributePlayers,
    selectedPlayerCount,
  } = useToolbarManager({
    app,
    players,
    showAlertModal,
    showConfirmModal,
    setIsDirty,
    setSelectedAlignment,
  });

  // Cleanup: Clear players and routes when component unmounts
  useEffect(() => {
    return () => {
      // Clear the store when diagram editor closes
      const store = useDiagramStore.getState();
      store.clearPlayers();
      store.clearRoutes();
    };
  }, []);

  // Load routes from existing diagram data (if available)
  useEffect(() => {
    if (play?.diagram_data?.routes && Array.isArray(play.diagram_data.routes)) {
      const { addRoute, clearRoutes } = useDiagramStore.getState();

      // Clear existing routes first
      clearRoutes();

      // Load routes from saved diagram data
      play.diagram_data.routes.forEach((route) => {
        addRoute(route);
      });
    }
  }, [play?.diagram_data]);

  // Enable keyboard controls (arrow keys, delete, escape)
  useKeyboardControls({ app, enabled: true });

  // Enable copy/paste (Ctrl/Cmd+C/V/D)
  useCopyPaste({ app, enabled: true });

  // Enable drag box selection (click+drag on empty field)
  useDragBoxSelection({ app, enabled: true });

  // Enable undo/redo (Ctrl+Z/Ctrl+Shift+Z)
  useUndoRedo({ app, enabled: true });

  const handleReady = useCallback((pixiApp: ProfessionalPixiEngine) => {
    setApp(pixiApp);
  }, []);

  const handleColorModeChange = useCallback(() => {
    const modes: FieldColorMode[] = ["jade", "blackwhite", "darkgray"];
    const currentIndex = modes.indexOf(colorMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setColorMode(nextMode);

    // Update field layer color mode
    if (app) {
      const fieldLayer = app.getFieldLayer();
      if (fieldLayer) {
        fieldLayer.setColorMode(nextMode);
      }
    }
  }, [colorMode, app, setColorMode]);

  const handleFieldPositionChange = useCallback(
    (position: DiagramFieldPosition) => {
      setFieldPosition(position);

      // Update line of scrimmage based on position
      if (app) {
        const fieldLayer = app.getFieldLayer();
        if (fieldLayer) {
          switch (position) {
            case "midfield":
              fieldLayer.setLineOfScrimmage(25, true); // 50-yard line (middle)
              break;
            case "backed-up":
              fieldLayer.setLineOfScrimmage(5, true); // 10-yard line (backed up)
              break;
            case "red-zone":
              fieldLayer.setLineOfScrimmage(30, true); // 10-yard line from endzone
              break;
            case "free-draw":
              fieldLayer.setLineOfScrimmage(25, false); // Hide line of scrimmage
              break;
          }
        }
      }
    },
    [app, setFieldPosition]
  );

  const handleSaveAndClose = useCallback(() => {
    if (!playName.trim()) {
      setShowSaveDialog(true);
      setShowUnsavedChanges(false);
      return;
    }
    performSave(playName);
    useDiagramStore.getState().clearPlayers();
    setShowUnsavedChanges(false);
    if (onClose) {
      onClose();
    }
  }, [
    playName,
    performSave,
    onClose,
    setShowSaveDialog,
    setShowUnsavedChanges,
  ]);

  const handleCloseWithoutSaving = useCallback(() => {
    useDiagramStore.getState().clearPlayers();
    setShowUnsavedChanges(false);
    if (onClose) {
      onClose();
    }
  }, [onClose, setShowUnsavedChanges]);

  // Quick play editor handlers
  const handleQuickPlaySave = useCallback(
    async (data: UnifiedDiagramData) => {
      if (onQuickPlaySave) {
        await onQuickPlaySave(data);
      }
    },
    [onQuickPlaySave]
  );

  const handleQuickPlayCancel = useCallback(() => {
    if (onClose) {
      onClose();
    }
  }, [onClose]);

  // Template editor handlers
  const handleTemplateSave = useCallback(
    async (data: UnifiedDiagramData) => {
      if (onTemplateSave) {
        await onTemplateSave(data);
      }
    },
    [onTemplateSave]
  );

  const handleTemplateCancel = useCallback(() => {
    if (onClose) {
      onClose();
    }
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-surface">
      {/* Show landscape prompt on mobile portrait */}
      {showLandscapePrompt && (
        <LandscapePrompt
          onContinueAnyway={() => setDismissedLandscapePrompt(true)}
        />
      )}

      {/* Render Quick Play Editor for quick-play mode */}
      {mode === "quick-play" ? (
        <QuickPlayEditor
          playbookId={playbookId || ""}
          onSave={handleQuickPlaySave}
          onCancel={handleQuickPlayCancel}
          suggestions={{
            formations: formations.map((f) => f.name),
            personnel: [],
            playNames: [],
            playTypes: PLAY_TYPE_OPTIONS.map(
              (opt: { value: string; label: string }) => opt.value
            ),
          }}
          recentCombos={recentCombos}
        />
      ) : mode === "template" ? (
        <TemplateEditor
          initialTemplate={null}
          onSave={handleTemplateSave}
          onCancel={handleTemplateCancel}
        />
      ) : (
        <>
          {/* Header */}
          <DiagramToolbar
            personnelName={personnelName}
            personnelConfig={personnelConfig}
            activeTool={activeTool}
            selectedRouteType={selectedRouteType}
            selectedRouteId={selectedRouteId}
            onToolChange={(tool) => setActiveTool(tool as ToolType)}
            onRouteTypeChange={setSelectedRouteType}
            handleAddSingleOffense={handleAddSingleOffense}
            handleAddSingleDefense={handleAddSingleDefense}
            handleDeleteSelected={handleDeleteSelected}
            handleClearOffense={handleClearOffense}
            handleClearDefense={handleClearDefense}
            handleClearWhiteboard={handleClearWhiteboard}
            handleAlignmentChange={handleAlignmentChange}
            selectedAlignment={selectedAlignment}
            offensePlayerCount={
              players.filter((p) => p.team === "offense").length
            }
            defensePlayerCount={
              players.filter((p) => p.team === "defense").length
            }
            totalPlayerCount={players.length}
            selectedPlayerId={useDiagramStore.getState().selectedPlayerId}
            formations={formations}
            onShowFormationPicker={() => setShowFormationPicker(true)}
            fieldPosition={fieldPosition}
            colorMode={colorMode}
            onFieldPositionChange={handleFieldPositionChange}
            onColorModeChange={handleColorModeChange}
            showHeatMap={showHeatMap}
            onToggleHeatMap={() => setShowHeatMap(!showHeatMap)}
            showVersionHistory={showVersionHistory}
            onToggleVersionHistory={() =>
              setShowVersionHistory(!showVersionHistory)
            }
            showAnalytics={showAnalytics}
            onToggleAnalytics={() => setShowAnalytics(!showAnalytics)}
            isDirty={isDirty}
            onSave={handleSave}
            saveStatus={saveStatus}
            lastSaved={lastSaved}
          />

          {/* User Presence Panel for Collaborative Editing */}
          {enableCollaboration && (
            <div className="flex justify-end px-4 py-2">
              <UserPresencePanel />
            </div>
          )}

          {/* Version History Panel */}
          {showVersionHistory && play?.id && (
            <div className="absolute top-20 right-4 z-40">
              <VersionHistoryPanel
                playId={play.id}
                onClose={() => setShowVersionHistory(false)}
              />
            </div>
          )}

          {/* Route Analytics Panel */}
          {showAnalytics && diagramId && (
            <div className="absolute top-20 left-4 z-40 max-w-md">
              <RouteAnalyticsDashboard
                diagramId={diagramId}
                className="max-h-96 overflow-y-auto"
              />
            </div>
          )}

          {/* Main Content: Responsive Layouts */}
          {breakpoint === "mobile" ? (
            <MobileLayout
              app={app}
              selectedAlignment={selectedAlignment}
              onAlignmentChange={handleAlignmentChange}
              onAddPlayer={handleAddSingleOffense}
              onAddFormation={() => alert("Formation picker coming soon!")}
              onClear={handleClearWhiteboard}
              onUndo={() => alert("Undo coming soon!")}
            >
              <PixiErrorBoundary>
                <DiagramCanvas
                  fieldWidth={53.333}
                  fieldHeight={35}
                  // No pixelsPerYard - will be calculated responsively
                  backgroundColor={0x222222}
                  onReady={handleReady}
                  routeType={selectedRouteType}
                >
                  {enableCollaboration && (
                    <CollaborativeCursors
                      coordinateToScreen={(x: number, y: number) => ({
                        x: x * 2,
                        y: y * 2,
                      })} // TODO: Implement proper coordinate conversion
                    />
                  )}
                  {enableHeatMap && showHeatMap && (
                    <ExecutionHeatMap
                      diagramId={diagramId}
                      routePositions={routePositions}
                      coordinateToScreen={(x: number, y: number) => ({
                        x: x * 2,
                        y: y * 2,
                      })} // TODO: Implement proper coordinate conversion
                    />
                  )}
                </DiagramCanvas>
              </PixiErrorBoundary>
            </MobileLayout>
          ) : breakpoint === "tablet" ? (
            <TabletLayout app={app} selectedAlignment={selectedAlignment}>
              <PixiErrorBoundary>
                <DiagramCanvas
                  fieldWidth={53.333}
                  fieldHeight={35}
                  // No pixelsPerYard - will be calculated responsively
                  backgroundColor={0x222222}
                  onReady={handleReady}
                  routeType={selectedRouteType}
                >
                  {enableCollaboration && (
                    <CollaborativeCursors
                      coordinateToScreen={(x: number, y: number) => ({
                        x: x * 2,
                        y: y * 2,
                      })} // TODO: Implement proper coordinate conversion
                    />
                  )}
                  {enableHeatMap && showHeatMap && (
                    <ExecutionHeatMap
                      diagramId={diagramId}
                      routePositions={routePositions}
                      coordinateToScreen={(x: number, y: number) => ({
                        x: x * 2,
                        y: y * 2,
                      })} // TODO: Implement proper coordinate conversion
                    />
                  )}
                </DiagramCanvas>
              </PixiErrorBoundary>
            </TabletLayout>
          ) : (
            <DesktopLayout app={app} selectedAlignment={selectedAlignment}>
              <PixiErrorBoundary>
                <DiagramCanvas
                  fieldWidth={53.333}
                  fieldHeight={35}
                  // No pixelsPerYard - will be calculated responsively
                  backgroundColor={0x222222}
                  onReady={handleReady}
                  routeType={selectedRouteType}
                >
                  {enableCollaboration && (
                    <CollaborativeCursors
                      coordinateToScreen={(x: number, y: number) => ({
                        x: x * 2,
                        y: y * 2,
                      })} // TODO: Implement proper coordinate conversion
                    />
                  )}
                  {enableHeatMap && showHeatMap && (
                    <ExecutionHeatMap
                      diagramId={diagramId}
                      routePositions={routePositions}
                      coordinateToScreen={(x: number, y: number) => ({
                        x: x * 2,
                        y: y * 2,
                      })} // TODO: Implement proper coordinate conversion
                    />
                  )}
                </DiagramCanvas>
              </PixiErrorBoundary>
            </DesktopLayout>
          )}

          {/* Status Bar */}
          <div className="px-4 py-2 bg-surface-card border-t border-border text-xs text-content-secondary">
            <div className="flex items-center justify-between gap-4">
              {/* Left side: Status indicators */}
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Icon name="check-circle" size="xs" />
                  Elite Pixi.js Rendering
                </span>
                <span className="flex items-center gap-1">
                  <Icon name="sparkles" size="xs" />
                  Mobile-First
                </span>
                <span className="flex items-center gap-1">
                  <Icon name="zap" size="xs" />
                  WebGL Accelerated
                </span>
                <span className="flex items-center gap-1">
                  <Icon name="target" size="xs" />
                  Single Coordinate System
                </span>

                {/* Autosave status indicator */}
                {play?.id && saveStatus === "saving" && (
                  <span className="text-info-500 flex items-center gap-1 animate-pulse">
                    <Icon name="clock" size="xs" />
                    Saving...
                  </span>
                )}
                {play?.id && saveStatus === "saved" && lastSaved && (
                  <span className="text-success-500 flex items-center gap-1">
                    <Icon name="check-circle" size="xs" />
                    Saved
                  </span>
                )}
                {play?.id && saveStatus === "error" && (
                  <span className="text-error-500 flex items-center gap-1">
                    <Icon name="alert" size="xs" />
                    Save failed
                  </span>
                )}

                {/* Show unsaved warning for new plays (no autosave) */}
                {!play?.id && isDirty && (
                  <span className="text-warning-500 flex items-center gap-1">
                    <Icon name="alert" size="xs" />
                    Unsaved changes
                  </span>
                )}
              </div>

              {/* Right side: Conditional Align/Distribute tools */}
              {(selectedPlayerCount >= 2 || selectedPlayerCount >= 3) && (
                <div className="flex items-center gap-2">
                  {/* Align tools (2+ players) */}
                  {selectedPlayerCount >= 2 && (
                    <>
                      <span className="text-content-tertiary">Align:</span>
                      <button
                        onClick={() => handleAlignPlayers("horizontal")}
                        className="px-3 py-1 text-xs bg-jade-600 text-white hover:bg-jade-700 rounded-full font-medium transition-colors flex items-center gap-1 shadow-sm"
                        title="Align Horizontally"
                      >
                        <Icon name="minus" size="xs" />
                        <span>Horizontal</span>
                      </button>
                      <button
                        onClick={() => handleAlignPlayers("vertical")}
                        className="px-3 py-1 text-xs bg-jade-600 text-white hover:bg-jade-700 rounded-full font-medium transition-colors flex items-center gap-1 shadow-sm"
                        title="Align Vertically"
                      >
                        <Icon name="grip-vertical" size="xs" />
                        <span>Vertical</span>
                      </button>
                    </>
                  )}

                  {/* Distribute tools (3+ players) */}
                  {selectedPlayerCount >= 3 && (
                    <>
                      <div className="w-px h-4 bg-border mx-1"></div>
                      <span className="text-content-tertiary">Distribute:</span>
                      <button
                        onClick={() => handleDistributePlayers("horizontal")}
                        className="px-3 py-1 text-xs bg-blue-600 text-white hover:bg-blue-700 rounded-full font-medium transition-colors flex items-center gap-1 shadow-sm"
                        title="Distribute Horizontally"
                      >
                        <Icon name="arrow-right" size="xs" />
                        <span>Horizontal</span>
                      </button>
                      <button
                        onClick={() => handleDistributePlayers("vertical")}
                        className="px-3 py-1 text-xs bg-blue-600 text-white hover:bg-blue-700 rounded-full font-medium transition-colors flex items-center gap-1 shadow-sm"
                        title="Distribute Vertically"
                      >
                        <Icon name="arrow-down" size="xs" />
                        <span>Vertical</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Save Dialog Modal */}
          {showSaveDialog && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
              <div className="bg-surface-card border border-border rounded-lg shadow-xl max-w-md w-full mx-4">
                <div className="p-6">
                  <h2 className="text-xl font-bold text-content-primary mb-4 flex items-center gap-2">
                    <Icon name="save" size="lg" />
                    Save Play
                  </h2>
                  <p className="text-content-secondary mb-4">
                    Give your play a name to save it:
                  </p>
                  <input
                    type="text"
                    value={playName}
                    onChange={(e) => setPlayName(e.target.value)}
                    placeholder="e.g., 4 Verts, Sluggo, Spider 2 Y Banana"
                    className="w-full px-4 py-2 rounded-md bg-surface-secondary border border-border text-content-primary placeholder-content-tertiary focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && playName.trim()) {
                        performSave(playName);
                      }
                      if (e.key === "Escape") {
                        setShowSaveDialog(false);
                      }
                    }}
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => performSave(playName || "Untitled Play")}
                      disabled={!playName.trim()}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                        playName.trim()
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "bg-surface-secondary text-content-tertiary cursor-not-allowed"
                      }`}
                    >
                      <Icon name="save" size="sm" />
                      Save
                    </button>
                    <button
                      onClick={handleClearWhiteboard}
                      className="flex-1 px-4 py-2 rounded-lg bg-error-600 hover:bg-error-700 text-white font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Icon name="delete" size="sm" />
                      Clear Whiteboard
                    </button>
                    <button
                      onClick={() => setShowSaveDialog(false)}
                      className="px-4 py-2 rounded-lg bg-surface-secondary hover:bg-surface-tertiary text-content-primary font-medium transition-colors flex items-center gap-2"
                    >
                      <Icon name="close" size="sm" />
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Alert Modal */}
          {showAlert && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md">
              <div className="bg-surface-primary border-2 border-stroke rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.4)] p-8 max-w-lg mx-4 animate-in fade-in zoom-in duration-200">
                <div className="flex items-start gap-4 mb-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-info-100 flex items-center justify-center">
                    <span className="text-3xl">
                      {alertTitle.includes("✅")
                        ? "✅"
                        : alertTitle.includes("❌")
                          ? "❌"
                          : "ℹ️"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold text-content-primary mb-2">
                      {alertTitle.replace(/✅|❌|⚠️|ℹ️/gu, "").trim()}
                    </h2>
                    <p className="text-base text-content-secondary whitespace-pre-line leading-relaxed">
                      {alertMessage}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleAlertClose}
                  className="w-full px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-150"
                >
                  OK
                </button>
              </div>
            </div>
          )}

          {/* Confirm Modal */}
          {showConfirm && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md">
              <div className="bg-surface-primary border-2 border-stroke rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.4)] p-8 max-w-lg mx-4 animate-in fade-in zoom-in duration-200">
                <div className="flex items-start gap-4 mb-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-warning-100 flex items-center justify-center">
                    <span className="text-3xl">⚠️</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold text-content-primary mb-2">
                      {confirmTitle}
                    </h2>
                    <p className="text-base text-content-secondary whitespace-pre-line leading-relaxed">
                      {confirmMessage}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleConfirmConfirm}
                    className="flex-1 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-150"
                  >
                    Yes, Continue
                  </button>
                  <button
                    onClick={handleConfirmClose}
                    className="flex-1 px-5 py-3 bg-surface-secondary hover:bg-surface-tertiary text-content-primary rounded-lg font-semibold border-2 border-stroke transform hover:scale-[1.02] transition-all duration-150"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Unsaved Changes Modal */}
          {showUnsavedChanges && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md">
              <div className="bg-surface-primary border-2 border-stroke rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.4)] p-8 max-w-lg mx-4 animate-in fade-in zoom-in duration-200">
                <div className="flex items-start gap-4 mb-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-info-100 flex items-center justify-center">
                    <span className="text-3xl">💾</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold text-content-primary mb-2">
                      Unsaved Changes
                    </h2>
                    <p className="text-base text-content-secondary leading-relaxed">
                      You have unsaved changes. What would you like to do?
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleSaveAndClose}
                    className="w-full px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-150 flex items-center justify-center gap-2"
                  >
                    <span>💾</span> Save and Close
                  </button>
                  <button
                    onClick={handleCloseWithoutSaving}
                    className="w-full px-5 py-3 bg-surface-secondary hover:bg-surface-tertiary text-content-primary rounded-lg font-semibold border-2 border-stroke transform hover:scale-[1.02] transition-all duration-150"
                  >
                    Close without Saving
                  </button>
                  <button
                    onClick={() => setShowUnsavedChanges(false)}
                    className="w-full px-5 py-3 bg-surface-secondary hover:bg-surface-tertiary text-content-secondary rounded-lg font-semibold border-2 border-stroke transform hover:scale-[1.02] transition-all duration-150"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Formation Picker Modal */}
          <FormationPickerModal
            isOpen={showFormationPicker}
            onClose={() => setShowFormationPicker(false)}
            formations={formations}
            onSelectFormation={handleLoadFormation}
            hasExistingContent={players.length > 0}
          />
        </>
      )}
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const DiagramEditor = React.memo(DiagramEditorComponent);

export default DiagramEditor;
