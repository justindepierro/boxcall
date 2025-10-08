/**
 * DiagramEditor - Football Play Diagram Builder
 *
 * Design Philosophy:
 * - Uses Aurora design system with glass morphism
 * - Light theme with excellent readability
 * - Proper color tokens for maintainability
 * - WCAG AA compliant contrast ratios
 * - Consistent with rest of application
 *
 * Key Features:
 * - Visual play creation with drag-and-drop
 * - Player positioning and route drawing
 * - Field configuration (midfield, redzone, etc.)
 * - Real-time preview and manipulation
 */
import React, { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "../../ui/Button";
import { Card } from "../../ui";
import { Icon } from "../../ui/Icon";
import { Input } from "../../ui/Input";
import { Typography } from "../../design-system/Typography";
import type { Play } from "../../../types/play";
import { createEmptyDocument } from "./types/types";
import type { DiagramDocument, DiagramFieldConfig } from "./types/types";
import { DiagramEditorProvider } from "./context/DiagramEditorProvider";
import { useDiagramEditor } from "./context/useDiagramEditor";
import { ModernToolPalette } from "./components/ModernToolPalette";
import { ShapeManipulator } from "./components/ShapeManipulator";
import { FootballFieldCanvas } from "./components/FootballFieldCanvas";

import { ProgressiveComponent } from "./components/ProgressiveComponent";
import { DrawingLayer } from "./components/DrawingLayer";
import {
  LazyPlayerPropertiesPanel,
  LazyRoutePropertiesPanel,
} from "./components/LazyComponents";

export interface DiagramMetadata {
  play_name: string;
  formation: string;
  p_type?: string;
  personnel?: string;
  pref_front?: string;
}

export interface DiagramEditorProps {
  play: Play;
  onClose: () => void;
  onSave?: (payload: {
    doc: DiagramDocument;
    metadata: DiagramMetadata;
  }) => Promise<void>;
}

const playTypeOptions = [
  "Run",
  "Pass",
  "RPO",
  "Play Action",
  "Screen",
  "Special",
];

const fieldSlicePresets: Record<
  "midfield" | "redzone" | "goaline" | "backedup",
  { label: string; slice: Partial<DiagramFieldConfig> }
> = {
  midfield: {
    label: "Midfield",
    slice: { backYards: 10, forwardYards: 30, losYards: 20 },
  },
  redzone: {
    label: "Red Zone",
    slice: { backYards: 0, forwardYards: 25, losYards: 20 },
  },
  goaline: {
    label: "Goal Line",
    slice: { backYards: 0, forwardYards: 15, losYards: 7 },
  },
  backedup: {
    label: "Backed Up",
    slice: { backYards: 20, forwardYards: 25, losYards: 5 },
  },
};

const determineSlicePreset = (field: DiagramFieldConfig) => {
  return (
    Object.entries(fieldSlicePresets) as Array<
      [keyof typeof fieldSlicePresets, (typeof fieldSlicePresets)["midfield"]]
    >
  ).find(([, preset]) => {
    const { backYards, forwardYards, losYards } = preset.slice;
    if (
      backYards === undefined ||
      forwardYards === undefined ||
      losYards === undefined
    )
      return false;
    return (
      Math.abs((field.backYards ?? 0) - backYards) < 1 &&
      Math.abs((field.forwardYards ?? 0) - forwardYards) < 1 &&
      Math.abs((field.losYards ?? 0) - losYards) < 1
    );
  })?.[0];
};

const FieldSettingsPanel: React.FC = () => {
  const { state, dispatch } = useDiagramEditor();
  const { field } = state.doc;

  const activePreset = determineSlicePreset(field);

  const handlePresetChange = (key: keyof typeof fieldSlicePresets) => {
    dispatch({
      type: "SET_FIELD_SLICE",
      slice: fieldSlicePresets[key].slice,
    });
  };

  const toggleFlag = (flag: keyof DiagramFieldConfig) => {
    dispatch({ type: "TOGGLE_FIELD_FLAG", flag });
  };

  return (
    <div className="space-y-6">
      {/* Field Slice Section */}
      <div className="rounded-glass border border-subtle surface-card backdrop-blur-sm p-5">
        <Typography
          variant="label-lg"
          className="mb-4 text-xs uppercase tracking-[0.2em] text-muted"
        >
          Field Slice
        </Typography>
        <div className="space-y-3">
          {(
            Object.keys(fieldSlicePresets) as Array<
              keyof typeof fieldSlicePresets
            >
          ).map((key) => {
            const preset = fieldSlicePresets[key];
            return (
              <label
                key={key}
                className="flex items-center gap-3 text-sm text-secondary cursor-pointer hover:text-primary transition-colors"
              >
                <input
                  type="radio"
                  name="field-slice"
                  value={key}
                  checked={activePreset === key}
                  onChange={() => handlePresetChange(key)}
                  className="h-4 w-4 text-brand-primary focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 focus:ring-offset-surface-primary border-border bg-surface-secondary"
                />
                <span>{preset.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Display Options Section */}
      <div className="rounded-glass border border-subtle surface-card backdrop-blur-sm p-5">
        <Typography
          variant="label-lg"
          className="mb-4 text-xs uppercase tracking-[0.2em] text-muted"
        >
          Display
        </Typography>
        <div className="space-y-3">
          <label className="flex items-center gap-3 text-sm text-secondary cursor-pointer hover:text-primary transition-colors">
            <input
              type="checkbox"
              checked={field.showPlayerLabels}
              onChange={() => toggleFlag("showPlayerLabels")}
              className="h-4 w-4 rounded-lg text-brand-primary focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 focus:ring-offset-surface-primary border-border bg-surface-secondary"
            />
            <span>Show Player Labels</span>
          </label>
          <label className="flex items-center gap-3 text-sm text-secondary cursor-pointer hover:text-primary transition-colors">
            <input
              type="checkbox"
              checked={field.showDefensePlayers}
              onChange={() => toggleFlag("showDefensePlayers")}
              className="h-4 w-4 rounded-lg text-brand-primary focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 focus:ring-offset-surface-primary border-border bg-surface-secondary"
            />
            <span>Show Defense</span>
          </label>
          <label className="flex items-center gap-3 text-sm text-secondary cursor-pointer hover:text-primary transition-colors">
            <input
              type="checkbox"
              checked={field.showRedZone ?? false}
              onChange={() => toggleFlag("showRedZone")}
              className="h-4 w-4 rounded-lg text-brand-primary focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 focus:ring-offset-surface-primary border-border bg-surface-secondary"
            />
            <span>Highlight Red Zone</span>
          </label>
        </div>
      </div>

      {/* Ball Hash Section */}
      <div className="rounded-glass border border-subtle surface-card backdrop-blur-sm p-5">
        <Typography
          variant="label-lg"
          className="mb-4 text-xs uppercase tracking-[0.2em] text-muted"
        >
          Ball Hash
        </Typography>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: "left", label: "Left" },
            { id: "middle", label: "Middle" },
            { id: "right", label: "Right" },
          ].map((option) => (
            <button
              key={option.id}
              onClick={() =>
                dispatch({
                  type: "SET_BALL_HASH",
                  hash: option.id as DiagramFieldConfig["ballHash"],
                })
              }
              className={`rounded-xl border px-3 py-2.5 text-xs font-medium transition-all duration-200 ${
                field.ballHash === option.id
                  ? "border-jade-500 bg-jade-500/20 text-jade-100 shadow-lg shadow-jade-500/25"
                  : "border-border bg-surface-secondary text-secondary hover:border-brand-primary hover:bg-surface-secondary/80"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Hash Layout Section */}
      <div className="rounded-glass border border-subtle surface-card backdrop-blur-sm p-5">
        <Typography
          variant="label-lg"
          className="mb-4 text-xs uppercase tracking-[0.2em] text-muted"
        >
          Hash Layout
        </Typography>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: "highschool", label: "HS" },
            { id: "college", label: "NCAA" },
            { id: "nfl", label: "NFL" },
          ].map((option) => (
            <button
              key={option.id}
              onClick={() =>
                dispatch({
                  type: "SET_FIELD_HASH_LAYOUT",
                  layout: option.id as NonNullable<
                    DiagramFieldConfig["hashLayout"]
                  >,
                })
              }
              className={`rounded-xl border px-3 py-2.5 text-xs font-medium transition-all duration-200 ${
                field.hashLayout === option.id
                  ? "border-jade-500 bg-jade-500/20 text-jade-100 shadow-lg shadow-jade-500/25"
                  : "border-border bg-surface-secondary text-secondary hover:border-brand-primary hover:bg-surface-secondary/80"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const DiagramCanvas: React.FC = () => {
  const { state } = useDiagramEditor();

  // NFL Field dimensions for playbook view (looking down the field)
  const FIELD_WIDTH = 53.333; // 53.333 yards (standard NFL field width)
  const FIELD_HEIGHT = 35; // 35 yards of field length (typical playbook view)
  const CANVAS_WIDTH = 800; // Base canvas width for drawing
  const CANVAS_HEIGHT = 525; // Base canvas height for drawing
  const PIXELS_PER_YARD = Math.min(
    CANVAS_WIDTH / FIELD_WIDTH,
    CANVAS_HEIGHT / FIELD_HEIGHT
  );

  return (
    <div className="relative flex-1 overflow-hidden rounded-glass bg-surface-secondary/40 border border-border shadow-inner">
      <ShapeManipulator
        zoom={state.ui.zoom}
        panX={state.ui.panX}
        panY={state.ui.panY}
        snapToGrid={state.ui.snap}
        fieldWidth={FIELD_WIDTH}
        fieldHeight={FIELD_HEIGHT}
        pixelsPerYard={PIXELS_PER_YARD}
      >
        <FootballFieldCanvas />
        <DrawingLayer />
      </ShapeManipulator>
      <div className="absolute top-0 right-0 h-full p-4 overflow-y-auto">
        <ElementPropertiesPopup className="xl:hidden" />
      </div>
    </div>
  );
};

const ElementPropertiesPopup: React.FC<{ className?: string }> = ({
  className = "",
}) => {
  const { state, dispatch } = useDiagramEditor();

  if (!state.ui.selectedIds || state.ui.selectedIds.length === 0) {
    return null;
  }

  const selectedPlayerId = state.ui.selectedIds.find((id) =>
    state.doc.players.some((player) => player.id === id)
  );

  const selectedRouteId = state.ui.selectedIds.find((id) =>
    state.doc.routes.some((route) => route.id === id)
  );

  let popupPosition = { x: 160, y: 100 };

  if (selectedPlayerId) {
    const player = state.doc.players.find((p) => p.id === selectedPlayerId);
    if (player) {
      const baseX = player.x * 15 + 80;
      const baseY = player.y * 15 - 60;
      popupPosition = {
        x: Math.max(12, Math.min(baseX, window.innerWidth - 340)),
        y: Math.max(12, Math.min(baseY, window.innerHeight - 220)),
      };
    }
  } else if (selectedRouteId) {
    const route = state.doc.routes.find((r) => r.id === selectedRouteId);
    if (
      route &&
      route.segments.length > 0 &&
      route.segments[0].points.length > 0
    ) {
      const firstPoint = route.segments[0].points[0];
      const baseX = firstPoint.x * 15 + 80;
      const baseY = firstPoint.y * 15 - 60;
      popupPosition = {
        x: Math.max(12, Math.min(baseX, window.innerWidth - 340)),
        y: Math.max(12, Math.min(baseY, window.innerHeight - 220)),
      };
    }
  }

  return (
    <div
      className={`absolute z-50 surface-card/95 border border-subtle rounded-lg shadow-xl p-3 min-w-64 ${className}`}
      style={{ left: `${popupPosition.x}px`, top: `${popupPosition.y}px` }}
    >
      <div className="flex justify-between items-center mb-2">
        <Typography variant="body-sm" className="text-primary">
          {selectedPlayerId
            ? "Player Properties"
            : selectedRouteId
              ? "Route Properties"
              : "Properties"}
        </Typography>
        <button
          onClick={() => dispatch({ type: "CLEAR_SELECTION" })}
          className="text-muted hover:text-primary p-1"
          title="Close"
        >
          ×
        </button>
      </div>
      {selectedPlayerId && (
        <ProgressiveComponent
          lazyComponent={LazyPlayerPropertiesPanel}
          loadingOptions={{ loadOnInteraction: true, delay: 100 }}
        />
      )}
      {selectedRouteId && !selectedPlayerId && (
        <ProgressiveComponent
          lazyComponent={LazyRoutePropertiesPanel}
          loadingOptions={{ loadOnInteraction: true, delay: 100 }}
        />
      )}
      {!selectedPlayerId && !selectedRouteId && (
        <Typography variant="caption" className="text-muted">
          Select a player or route to edit settings
        </Typography>
      )}
    </div>
  );
};

const DiagramTopBar: React.FC<{
  formState: DiagramMetadata;
  onChange: (updates: Partial<DiagramMetadata>) => void;
  onToggleSidebar?: () => void;
  onToggleProperties?: () => void;
}> = ({ formState, onChange, onToggleSidebar, onToggleProperties }) => {
  return (
    <div className="flex flex-wrap items-center gap-4 bg-gradient-to-r from-surface-primary/95 via-surface-primary/90 to-surface-primary/95 backdrop-blur-xl border-b border-border px-6 py-5 shadow-glass">
      <div className="flex flex-col gap-1.5 min-w-56">
        <Typography
          variant="label-lg"
          className="text-xs uppercase tracking-[0.2em] text-muted"
        >
          Play Name
        </Typography>
        <Input
          size="sm"
          value={formState.play_name}
          onChange={(e) => onChange({ play_name: e.target.value })}
          className="bg-surface-secondary/60 border-border text-primary focus:border-brand-primary focus:ring-brand-primary/20"
        />
      </div>
      <div className="flex flex-col gap-1.5 min-w-44">
        <Typography
          variant="label-lg"
          className="text-xs uppercase tracking-[0.2em] text-muted"
        >
          Formation
        </Typography>
        <Input
          size="sm"
          value={formState.formation}
          onChange={(e) => onChange({ formation: e.target.value })}
          className="bg-surface-secondary/60 border-border text-primary focus:border-brand-primary focus:ring-brand-primary/20"
        />
      </div>
      <div className="flex flex-col gap-1.5 min-w-40">
        <Typography
          variant="label-lg"
          className="text-xs uppercase tracking-[0.2em] text-muted"
        >
          Personnel
        </Typography>
        <Input
          size="sm"
          value={formState.personnel ?? ""}
          onChange={(e) => onChange({ personnel: e.target.value })}
          className="bg-surface-secondary/60 border-border text-primary focus:border-brand-primary focus:ring-brand-primary/20"
        />
      </div>
      <div className="flex flex-col gap-1.5 min-w-36">
        <Typography
          variant="label-lg"
          className="text-xs uppercase tracking-[0.2em] text-muted"
        >
          Play Type
        </Typography>
        <select
          value={formState.p_type ?? ""}
          onChange={(e) => onChange({ p_type: e.target.value })}
          className="rounded-lg border border-border bg-surface-secondary/60 text-sm text-primary px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-colors"
        >
          <option value="">Select type</option>
          {playTypeOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1.5 min-w-36">
        <Typography
          variant="label-lg"
          className="text-xs uppercase tracking-[0.2em] text-muted"
        >
          VS Front
        </Typography>
        <Input
          size="sm"
          value={formState.pref_front ?? ""}
          onChange={(e) => onChange({ pref_front: e.target.value })}
          className="bg-surface-secondary/60 border-border text-primary focus:border-brand-primary focus:ring-brand-primary/20"
        />
      </div>

      {/* Mobile Controls */}
      <div className="flex items-center gap-2 ml-auto lg:hidden">
        {onToggleSidebar && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="text-secondary hover:text-primary hover:bg-surface-secondary/60"
            title="Field Settings"
          >
            <Icon name="settings" size="sm" />
          </Button>
        )}
        {onToggleProperties && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleProperties}
            className="text-secondary hover:text-primary hover:bg-surface-secondary/60"
            title="Properties"
          >
            <Icon name="edit" size="sm" />
          </Button>
        )}
      </div>
    </div>
  );
};

const DiagramEditorInner: React.FC<DiagramEditorProps> = ({
  play,
  onClose,
  onSave,
}) => {
  const { state, dispatch } = useDiagramEditor();
  const [formState, setFormState] = useState<DiagramMetadata>({
    play_name: play.play_name,
    formation: play.formation,
    p_type: play.p_type,
    personnel: play.personnel,
    pref_front: play.pref_front,
  });
  const [saving, setSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [propertiesOpen, setPropertiesOpen] = useState(false);

  useEffect(() => {
    setFormState({
      play_name: play.play_name,
      formation: play.formation,
      p_type: play.p_type,
      personnel: play.personnel,
      pref_front: play.pref_front,
    });
    let doc = createEmptyDocument();
    if (play.diagram_url) {
      try {
        const parsed = JSON.parse(play.diagram_url) as DiagramDocument;
        doc = {
          ...parsed,
          meta: parsed.meta ?? {
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        };
      } catch (error) {
        console.warn(
          "Failed to parse play diagram; falling back to template",
          error
        );
      }
    }
    dispatch({ type: "INIT", doc });
  }, [play, dispatch]);

  const dirtyMetadata = useMemo(() => {
    return (
      formState.play_name !== (play.play_name ?? "") ||
      formState.formation !== (play.formation ?? "") ||
      (formState.p_type || "") !== (play.p_type || "") ||
      (formState.personnel || "") !== (play.personnel || "") ||
      (formState.pref_front || "") !== (play.pref_front || "")
    );
  }, [formState, play]);

  const handleMetadataChange = (updates: Partial<DiagramMetadata>) => {
    setFormState((prev) => ({ ...prev, ...updates }));
  };

  const handleSave = useCallback(async () => {
    if (!onSave) return;
    try {
      setSaving(true);
      await onSave({ doc: state.doc, metadata: formState });
      dispatch({ type: "MARK_SAVED" });
    } finally {
      setSaving(false);
    }
  }, [onSave, state.doc, formState, dispatch]);

  const handleUndo = useCallback(() => dispatch({ type: "UNDO" }), [dispatch]);
  const handleRedo = useCallback(() => dispatch({ type: "REDO" }), [dispatch]);

  const canSave = state.dirty || dirtyMetadata;

  return (
    <div className="flex h-full w-full bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-primary">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Field Settings */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 border-r border-border bg-surface-primary/95 backdrop-blur-xl px-6 py-8 overflow-y-auto transform transition-transform duration-300 lg:transform-none ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${sidebarOpen ? "lg:translate-x-0" : ""}`}
      >
        <div className="flex items-center justify-between mb-6 lg:hidden">
          <Typography
            variant="headline-sm"
            className="text-primary font-semibold"
          >
            Field Settings
          </Typography>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
            className="text-muted hover:text-primary"
          >
            <Icon name="close" size="sm" />
          </Button>
        </div>
        <div className="mb-6 hidden lg:block">
          <Typography
            variant="headline-sm"
            className="text-primary font-semibold"
          >
            Field Settings
          </Typography>
          <Typography variant="caption" className="text-muted mt-1">
            Configure field view and display options
          </Typography>
        </div>
        <FieldSettingsPanel />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <DiagramTopBar
          formState={formState}
          onChange={handleMetadataChange}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onToggleProperties={() => setPropertiesOpen(!propertiesOpen)}
        />

        <div className="flex-1 flex flex-col gap-5 px-4 py-5 lg:px-6 overflow-hidden">
          <div className="flex flex-1 gap-5 min-h-0">
            <div className="flex-1 flex flex-col min-w-0">
              <DiagramCanvas />
            </div>

            {/* Properties Panel - Desktop */}
            <div className="hidden xl:block w-80 space-y-4">
              <Card className="p-5 space-y-5 surface-card border border-subtle backdrop-blur-xl rounded-glass shadow-glass">
                <Typography
                  variant="caption"
                  className="uppercase tracking-[0.2em] text-muted font-semibold"
                >
                  Properties
                </Typography>
                <ProgressiveComponent
                  lazyComponent={LazyPlayerPropertiesPanel}
                  loadingOptions={{ loadOnViewport: true, delay: 200 }}
                />
                <ProgressiveComponent
                  lazyComponent={LazyRoutePropertiesPanel}
                  loadingOptions={{ loadOnViewport: true, delay: 200 }}
                />
              </Card>
            </div>

            {/* Properties Panel - Mobile */}
            {propertiesOpen && (
              <div className="fixed inset-x-0 bottom-0 z-40 xl:hidden bg-surface-primary border-t border-border rounded-t-glass shadow-glass p-4 max-h-96 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <Typography
                    variant="headline-sm"
                    className="text-primary font-semibold"
                  >
                    Properties
                  </Typography>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPropertiesOpen(false)}
                    className="text-muted hover:text-primary"
                  >
                    <Icon name="close" size="sm" />
                  </Button>
                </div>
                <div className="space-y-4">
                  <ProgressiveComponent
                    lazyComponent={LazyPlayerPropertiesPanel}
                    loadingOptions={{ loadOnViewport: true, delay: 150 }}
                  />
                  <ProgressiveComponent
                    lazyComponent={LazyRoutePropertiesPanel}
                    loadingOptions={{ loadOnViewport: true, delay: 150 }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Bottom Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 surface-card border border-subtle backdrop-blur-xl rounded-glass px-5 py-4 shadow-glass">
            <ModernToolPalette
              orientation="horizontal"
              className="bg-transparent p-0"
            />
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUndo}
                className="text-secondary hover:text-primary hover:bg-surface-secondary/60"
              >
                <Icon name="undo" size="sm" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRedo}
                className="text-secondary hover:text-primary hover:bg-surface-secondary/60"
              >
                <Icon name="refresh-cw" size="sm" />
              </Button>
              <div className="h-5 w-px bg-border" />
              <Button
                variant="gradient"
                size="sm"
                onClick={handleSave}
                disabled={!canSave || saving}
                className="shadow-lg shadow-jade-500/25"
              >
                {saving ? "Saving…" : "Save Diagram"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-secondary hover:text-primary hover:bg-surface-secondary/60"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const DiagramEditor: React.FC<DiagramEditorProps> = (props) => {
  return (
    <DiagramEditorProvider>
      <DiagramEditorInner {...props} />
    </DiagramEditorProvider>
  );
};

// Legacy export for backward compatibility during transition
export const PlayDiagramBuilder = DiagramEditor;
