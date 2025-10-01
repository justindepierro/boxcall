import React, { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "../../ui/Button";
import { Card } from "../../ui";
import { Icon } from "../../ui/Icon";
import { Input } from "../../ui/Input";
import { Typography } from "../../design-system/Typography";
import type { Play } from "../../../types/play";
import { createEmptyDocument } from "./types/types";
import type {
  DiagramDocument,
  DiagramFieldConfig,
} from "./types/types";
import { DiagramEditorProvider } from "./context/DiagramEditorProvider";
import { useDiagramEditor } from "./context/useDiagramEditor";
import { ModernToolPalette } from "./components/ModernToolPalette";
import { ShapeManipulator } from "./components/ShapeManipulator";
import { FootballFieldCanvas } from "./components/FootballFieldCanvas";
import { PlayerPropertiesPanel } from "./components/PlayerPropertiesPanel";
import { RoutePropertiesPanel } from "./components/RoutePropertiesPanel";

export interface DiagramMetadata {
  play_name: string;
  formation: string;
  p_type?: string;
  personnel?: string;
  pref_front?: string;
}

export interface PlayDiagramBuilderProps {
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
  return (Object.entries(fieldSlicePresets) as Array<[
    keyof typeof fieldSlicePresets,
    (typeof fieldSlicePresets)["midfield"],
  ]>).find(([, preset]) => {
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
    <div className="space-y-5">
      <div>
        <Typography variant="label-lg" className="text-xs tracking-[0.2em]">
          Field Slice
        </Typography>
        <div className="mt-3 space-y-3">
          {(Object.keys(fieldSlicePresets) as Array<
            keyof typeof fieldSlicePresets
          >).map((key) => {
            const preset = fieldSlicePresets[key];
            return (
              <label
                key={key}
                className="flex items-center gap-2 text-sm text-text-secondary"
              >
                <input
                  type="radio"
                  name="field-slice"
                  value={key}
                  checked={activePreset === key}
                  onChange={() => handlePresetChange(key)}
                  className="accent-jade-600"
                />
                {preset.label}
              </label>
            );
          })}
        </div>
      </div>

      <div className="border-t border-slate-800 pt-4">
        <Typography variant="label-lg" className="text-xs tracking-[0.2em]">
          Display
        </Typography>
        <div className="mt-3 space-y-2">
          <label className="flex items-center gap-2 text-sm text-text-secondary">
            <input
              type="checkbox"
              checked={field.showPlayerLabels}
              onChange={() => toggleFlag("showPlayerLabels")}
              className="accent-jade-600"
            />
            Show Player Labels
          </label>
          <label className="flex items-center gap-2 text-sm text-text-secondary">
            <input
              type="checkbox"
              checked={field.showDefensePlayers}
              onChange={() => toggleFlag("showDefensePlayers")}
              className="accent-jade-600"
            />
            Show Defense
          </label>
          <label className="flex items-center gap-2 text-sm text-text-secondary">
            <input
              type="checkbox"
              checked={field.showRedZone ?? false}
              onChange={() => toggleFlag("showRedZone")}
              className="accent-jade-600"
            />
            Highlight Red Zone
          </label>
        </div>
      </div>

      <div className="border-t border-slate-800 pt-4 space-y-3">
        <div>
          <Typography variant="label-lg" className="text-xs tracking-[0.2em]">
            Ball Hash
          </Typography>
          <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
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
                className={`rounded-md border px-2 py-1 text-xs transition-colors ${
                  field.ballHash === option.id
                    ? "border-jade-500 bg-emerald-50 text-jade-800"
                    : "border-slate-700 bg-slate-900 text-slate-300 hover:border-jade-600"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Typography variant="label-lg" className="text-xs tracking-[0.2em]">
            Hash Layout
          </Typography>
          <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
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
                    layout: option.id as NonNullable<DiagramFieldConfig["hashLayout"]>,
                  })
                }
                className={`rounded-md border px-3 py-1 transition-colors ${
                  field.hashLayout === option.id
                    ? "border-jade-500 bg-emerald-50 text-jade-800"
                    : "border-slate-700 bg-slate-900 text-slate-300 hover:border-jade-600"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const DiagramCanvas: React.FC = () => {
  const { state } = useDiagramEditor();
  return (
    <div className="relative flex-1 overflow-hidden rounded-aurora bg-slate-900/40 border border-slate-800">
      <ShapeManipulator
        zoom={1}
        panX={0}
        panY={0}
        snapToGrid={true}
      >
        <FootballFieldCanvas />
      </ShapeManipulator>
      <ElementPropertiesPopup className="xl:hidden" />
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
      className={`absolute z-50 bg-slate-900/95 border border-slate-700 rounded-lg shadow-xl p-3 min-w-64 ${className}`}
      style={{ left: `${popupPosition.x}px`, top: `${popupPosition.y}px` }}
    >
      <div className="flex justify-between items-center mb-2">
        <Typography variant="body-sm" className="text-slate-200">
          {selectedPlayerId
            ? "Player Properties"
            : selectedRouteId
              ? "Route Properties"
              : "Properties"}
        </Typography>
        <button
          onClick={() => dispatch({ type: "CLEAR_SELECTION" })}
          className="text-slate-400 hover:text-slate-100 p-1"
          title="Close"
        >
          ×
        </button>
      </div>
      {selectedPlayerId && <PlayerPropertiesPanel />}
      {selectedRouteId && !selectedPlayerId && <RoutePropertiesPanel />}
      {!selectedPlayerId && !selectedRouteId && (
        <Typography variant="caption" className="text-slate-400">
          Select a player or route to edit settings
        </Typography>
      )}
    </div>
  );
};

const DiagramTopBar: React.FC<{
  formState: DiagramMetadata;
  onChange: (updates: Partial<DiagramMetadata>) => void;
}> = ({ formState, onChange }) => {
  return (
    <div className="flex flex-wrap items-center gap-4 bg-slate-900/90 border-b border-slate-800 px-5 py-4">
      <div className="flex flex-col gap-1 min-w-[220px]">
        <Typography variant="label-lg" className="text-xs tracking-[0.2em]">
          Play Name
        </Typography>
        <Input
          size="sm"
          value={formState.play_name}
          onChange={(e) => onChange({ play_name: e.target.value })}
        />
      </div>
      <div className="flex flex-col gap-1 min-w-[180px]">
        <Typography variant="label-lg" className="text-xs tracking-[0.2em]">
          Formation
        </Typography>
        <Input
          size="sm"
          value={formState.formation}
          onChange={(e) => onChange({ formation: e.target.value })}
        />
      </div>
      <div className="flex flex-col gap-1 min-w-[160px]">
        <Typography variant="label-lg" className="text-xs tracking-[0.2em]">
          Personnel
        </Typography>
        <Input
          size="sm"
          value={formState.personnel ?? ""}
          onChange={(e) => onChange({ personnel: e.target.value })}
        />
      </div>
      <div className="flex flex-col gap-1 min-w-[150px]">
        <Typography variant="label-lg" className="text-xs tracking-[0.2em]">
          Play Type
        </Typography>
        <select
          value={formState.p_type ?? ""}
          onChange={(e) => onChange({ p_type: e.target.value })}
          className="rounded-sm border border-slate-700 bg-slate-900 text-sm text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-jade-500"
        >
          <option value="">Select type</option>
          {playTypeOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1 min-w-[150px]">
        <Typography variant="label-lg" className="text-xs tracking-[0.2em]">
          VS Front
        </Typography>
        <Input
          size="sm"
          value={formState.pref_front ?? ""}
          onChange={(e) => onChange({ pref_front: e.target.value })}
        />
      </div>
    </div>
  );
};

const PlayDiagramBuilderInner: React.FC<PlayDiagramBuilderProps> = ({
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
          meta:
            parsed.meta ?? {
              createdAt: Date.now(),
              updatedAt: Date.now(),
            },
        };
      } catch (error) {
        console.warn("Failed to parse play diagram; falling back to template", error);
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
    <div className="flex h-full w-full bg-slate-950 text-slate-100">
      <aside className="hidden lg:block w-64 border-r border-slate-800 bg-slate-900/70 px-5 py-6 overflow-y-auto">
        <Typography variant="headline-sm" className="mb-4 text-slate-200">
          Field Settings
        </Typography>
        <FieldSettingsPanel />
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <DiagramTopBar formState={formState} onChange={handleMetadataChange} />

        <div className="flex-1 flex flex-col gap-4 px-5 py-4 overflow-hidden">
          <div className="flex flex-1 gap-4 min-h-0">
            <div className="flex-1 flex flex-col min-w-0">
              <DiagramCanvas />
            </div>
            <div className="hidden xl:block w-72 space-y-4">
              <Card className="p-4 space-y-4 bg-slate-900/80 border border-slate-800">
                <Typography variant="caption" className="uppercase tracking-[0.2em] text-slate-400">
                  Properties
                </Typography>
                <PlayerPropertiesPanel />
                <RoutePropertiesPanel />
              </Card>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 rounded-aurora px-4 py-3">
            <ModernToolPalette orientation="horizontal" className="bg-transparent p-0" />
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleUndo}>
                <Icon name="undo" size="sm" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleRedo}>
                <Icon name="refresh-cw" size="sm" />
              </Button>
              <Button
                variant="gradient"
                size="sm"
                onClick={handleSave}
                disabled={!canSave || saving}
              >
                {saving ? "Saving…" : "Save Diagram"}
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const PlayDiagramBuilder: React.FC<PlayDiagramBuilderProps> = (props) => {
  return (
    <DiagramEditorProvider>
      <PlayDiagramBuilderInner {...props} />
    </DiagramEditorProvider>
  );
};
