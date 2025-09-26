import React from "react";

import { UserPreferencesService } from "@services/userPreferencesService";
import { Button } from "../../../ui/Button";
import Icon from "../../../ui/Icon/Icon";
import { Tooltip } from "../../../ui/Tooltip/Tooltip";
import { useDiagramEditor } from "../context/useDiagramEditor";

export const ToolPalette: React.FC = () => {
  const { state, dispatch } = useDiagramEditor();
  const showTooltips = React.useMemo(
    () => UserPreferencesService.loadPreferences().ui.showTooltips,
    []
  );
  const Btn: React.FC<{
    active?: boolean;
    label: string;
    onClick: () => void;
    icon: React.ReactNode;
    tooltip?: React.ReactNode;
  }> = ({ active, label, onClick, icon, tooltip }) => (
    <Tooltip content={tooltip || label} disabled={!showTooltips}>
      <button
        onClick={onClick}
        aria-pressed={!!active}
        title={label}
        className={`w-10 h-10 rounded-md border-0 bg-transparent hover:bg-surface-secondary flex items-center justify-center overflow-hidden ${
          active ? "bg-surface-secondary" : ""
        }`}
      >
        {icon}
      </button>
    </Tooltip>
  );
  return (
    <div className="absolute left-3 right-3 top-3 z-20 pointer-events-none">
      <div className="mx-auto max-w-[1120px] pointer-events-auto flex flex-wrap items-center gap-4 panel-cupertino px-4 py-2">
        <div
          className="flex items-center gap-2 pr-3 border-r border-border-light"
          aria-label="Primary tools"
        >
          <Btn
            label="AI Suggest"
            active={state.ui.tool === "ai-suggest"}
            onClick={() => dispatch({ type: "SET_TOOL", tool: "ai-suggest" })}
            icon={<Icon name="sparkles" size={14} />}
            tooltip={
              <span>
                AI Play Recognition
                <span className="opacity-70 ml-1">• Smart suggestions</span>
              </span>
            }
          />
          <Btn
            label="Select"
            active={state.ui.tool === "select"}
            onClick={() => dispatch({ type: "SET_TOOL", tool: "select" })}
            icon={<Icon name="pointer" size={14} />}
            tooltip={
              <span>
                Select
                <span className="opacity-70 ml-1">• Shortcut: V</span>
              </span>
            }
          />
          <Btn
            label="Pan"
            active={state.ui.tool === "pan"}
            onClick={() => dispatch({ type: "SET_TOOL", tool: "pan" })}
            icon={<Icon name="move" size={14} />}
            tooltip={
              <span>
                Pan
                <span className="opacity-70 ml-1">• Hold Space</span>
              </span>
            }
          />
          <Btn
            label="Add Player"
            active={state.ui.tool === "add-player"}
            onClick={() => dispatch({ type: "SET_TOOL", tool: "add-player" })}
            icon={<Icon name="plus" size={14} />}
            tooltip={
              <span>
                Add Player
                <span className="opacity-70 ml-1">• Shortcut: P</span>
              </span>
            }
          />
          <Btn
            label="Route"
            active={state.ui.tool === "route"}
            onClick={() => dispatch({ type: "SET_TOOL", tool: "route" })}
            icon={<Icon name="arrow-right" size={14} />}
            tooltip={
              <span>
                Route
                <span className="opacity-70 ml-1">• Shortcut: R</span>
              </span>
            }
          />
          <Btn
            label="Motion"
            active={state.ui.tool === "motion"}
            onClick={() => dispatch({ type: "SET_TOOL", tool: "motion" })}
            icon={<Icon name="trending-up" size={14} />}
            tooltip={
              <span>
                Motion Path
                <span className="opacity-70 ml-1">• Player movement</span>
              </span>
            }
          />
          <Btn
            label="Blocking"
            active={state.ui.tool === "blocking"}
            onClick={() => dispatch({ type: "SET_TOOL", tool: "blocking" })}
            icon={<Icon name="shield" size={14} />}
            tooltip={
              <span>
                Blocking Assignment
                <span className="opacity-70 ml-1">• Protection schemes</span>
              </span>
            }
          />
          <Btn
            label="Draw"
            active={state.ui.tool === "draw"}
            onClick={() => dispatch({ type: "SET_TOOL", tool: "draw" })}
            icon={<Icon name="pen-tool" size={14} />}
            tooltip={
              <span>
                Draw
                <span className="opacity-70 ml-1">
                  • Enter to commit • Shift to 45°
                </span>
              </span>
            }
          />
        </div>
        <div
          className="flex items-center gap-2 pr-3 border-r border-border-light"
          aria-label="Formation library"
        >
          <select
            aria-label="Formation templates"
            value={state.ui.selectedFormation || ""}
            onChange={(e) => {
              if (e.target.value) {
                dispatch({
                  type: "APPLY_FORMATION",
                  formation: e.target.value,
                });
              }
            }}
            className="text-[12px] rounded px-2 py-1 bg-surface-card border border-border"
            title="Formation Templates"
          >
            <option value="">Formations</option>
            <option value="shotgun-11">Shotgun 11 Personnel</option>
            <option value="shotgun-12">Shotgun 12 Personnel</option>
            <option value="shotgun-13">Shotgun 13 Personnel</option>
            <option value="pistol-11">Pistol 11 Personnel</option>
            <option value="pistol-12">Pistol 12 Personnel</option>
            <option value="under-center">Under Center</option>
            <option value="wildcat">Wildcat</option>
            <option value="empty">Empty Backfield</option>
            <option value="bunch-left">Bunch Left</option>
            <option value="bunch-right">Bunch Right</option>
            <option value="trips-left">Trips Left</option>
            <option value="trips-right">Trips Right</option>
            <option value="stack-left">Stack Left</option>
            <option value="stack-right">Stack Right</option>
          </select>
        </div>

        <div
          className="flex items-center gap-2 pr-3 border-r border-border-light"
          aria-label="Formation library"
        >
          <select
            aria-label="Formation templates"
            value={state.ui.selectedFormation || ""}
            onChange={(e) => {
              if (e.target.value) {
                dispatch({
                  type: "APPLY_FORMATION",
                  formation: e.target.value,
                });
              }
            }}
            className="text-[12px] rounded px-2 py-1 bg-surface-card border border-border"
            title="Formation Templates"
          >
            <option value="">Formations</option>
            <option value="shotgun-11">Shotgun 11 Personnel</option>
            <option value="shotgun-12">Shotgun 12 Personnel</option>
            <option value="shotgun-13">Shotgun 13 Personnel</option>
            <option value="pistol-11">Pistol 11 Personnel</option>
            <option value="pistol-12">Pistol 12 Personnel</option>
            <option value="under-center">Under Center</option>
            <option value="wildcat">Wildcat</option>
            <option value="empty">Empty Backfield</option>
            <option value="bunch-left">Bunch Left</option>
            <option value="bunch-right">Bunch Right</option>
            <option value="trips-left">Trips Left</option>
            <option value="trips-right">Trips Right</option>
            <option value="stack-left">Stack Left</option>
            <option value="stack-right">Stack Right</option>
          </select>
        </div>

        {state.ui.tool === "draw" && (
          <div className="flex items-center gap-2" aria-label="Draw modes">
            <Btn
              label="Line"
              active={state.ui.drawMode === "line"}
              onClick={() => dispatch({ type: "SET_DRAW_MODE", mode: "line" })}
              icon={<Icon name="minus" size={14} />}
              tooltip={
                <span>
                  Line
                  <span className="opacity-70 ml-1">
                    • Enter to commit • Shift to 45°
                  </span>
                </span>
              }
            />
            <Btn
              label="Arrow"
              active={state.ui.drawMode === "arrow"}
              onClick={() => dispatch({ type: "SET_DRAW_MODE", mode: "arrow" })}
              icon={<Icon name="arrow-right" size={14} />}
              tooltip={
                <span>
                  Arrow
                  <span className="opacity-70 ml-1">• Enter to commit</span>
                </span>
              }
            />
            <Btn
              label="Dashed"
              active={state.ui.drawMode === "dashed"}
              onClick={() =>
                dispatch({ type: "SET_DRAW_MODE", mode: "dashed" })
              }
              icon={<Icon name="activity" size={14} />}
              tooltip={<span>Dashed</span>}
            />
            <Btn
              label="Dotted"
              active={state.ui.drawMode === "dotted"}
              onClick={() =>
                dispatch({ type: "SET_DRAW_MODE", mode: "dotted" })
              }
              icon={<Icon name="grid" size={14} />}
              tooltip={<span>Dotted</span>}
            />
            <Btn
              label="Curve"
              active={state.ui.drawMode === "curve"}
              onClick={() => dispatch({ type: "SET_DRAW_MODE", mode: "curve" })}
              icon={<Icon name="activity" size={14} />}
              tooltip={
                <span>
                  Curve
                  <span className="opacity-70 ml-1">
                    • Use last anchor as control • Enter to commit
                  </span>
                </span>
              }
            />
            <Btn
              label="Freehand"
              active={state.ui.drawMode === "freehand"}
              onClick={() =>
                dispatch({ type: "SET_DRAW_MODE", mode: "freehand" })
              }
              icon={<Icon name="edit" size={14} />}
              tooltip={
                <span>
                  Freehand
                  <span className="opacity-70 ml-1"> • Release to commit</span>
                </span>
              }
            />
            <Btn
              label="Connector"
              active={state.ui.drawMode === "connector"}
              onClick={() =>
                dispatch({ type: "SET_DRAW_MODE", mode: "connector" })
              }
              icon={<Icon name="link" size={14} />}
              tooltip={
                <span>
                  Connector
                  <span className="opacity-70 ml-1">
                    {" "}
                    • Click player → player • Esc to cancel
                  </span>
                </span>
              }
            />
            <Btn
              label="Zone"
              active={state.ui.drawMode === "zone"}
              onClick={() => dispatch({ type: "SET_DRAW_MODE", mode: "zone" })}
              icon={<Icon name="target" size={14} />}
              tooltip={
                <span>
                  Coverage Zone
                  <span className="opacity-70 ml-1">• Draw coverage areas</span>
                </span>
              }
            />
            <Btn
              label="Pressure"
              active={state.ui.drawMode === "pressure"}
              onClick={() =>
                dispatch({ type: "SET_DRAW_MODE", mode: "pressure" })
              }
              icon={<Icon name="zap" size={14} />}
              tooltip={
                <span>
                  Pressure Rush
                  <span className="opacity-70 ml-1">• Blitz paths</span>
                </span>
              }
            />
            <Btn
              label="Hot Route"
              active={state.ui.drawMode === "hot-route"}
              onClick={() =>
                dispatch({ type: "SET_DRAW_MODE", mode: "hot-route" })
              }
              icon={<Icon name="star" size={14} />}
              tooltip={
                <span>
                  Hot Route
                  <span className="opacity-70 ml-1">• Alert routes</span>
                </span>
              }
            />
            <div className="mx-1 w-px h-6 bg-border-light" />
            <select
              aria-label="Arrowhead"
              value={state.ui.drawArrowHead || "end"}
              onChange={(e) =>
                dispatch({
                  type: "SET_DRAW_ARROW_HEAD",
                  arrowHead: e.target.value as
                    | "none"
                    | "start"
                    | "end"
                    | "both",
                })
              }
              className="text-[12px] rounded px-2 py-1"
              title="Arrowhead"
            >
              <option value="none">Head: None</option>
              <option value="end">Head: End</option>
              <option value="start">Head: Start</option>
              <option value="both">Head: Both</option>
            </select>
            <input
              type="color"
              aria-label="Draw color"
              value={state.ui.drawColor || "#111827"}
              onChange={(e) =>
                dispatch({ type: "SET_DRAW_COLOR", color: e.target.value })
              }
              className="w-10 h-10 p-0 rounded"
              title="Stroke color"
            />
            <input
              type="range"
              aria-label="Draw width"
              min={1}
              max={10}
              step={1}
              value={state.ui.drawWidth || 3}
              onChange={(e) =>
                dispatch({
                  type: "SET_DRAW_WIDTH",
                  width: Number(e.target.value),
                })
              }
              className="w-32"
              title="Stroke width"
            />
            <span className="text-[12px] text-text-primary w-9 text-right">
              {state.ui.drawWidth || 3}px
            </span>
          </div>
        )}
        <div
          className="ml-auto flex items-center gap-2 pr-3 border-r border-border-light"
          aria-label="Align & distribute"
        >
          <Button
            variant="ghost"
            title="Align Left"
            className="w-11 h-11 p-0"
            onClick={() =>
              dispatch({ type: "ALIGN_SELECTION", axis: "x", align: "start" })
            }
          >
            <Icon name="chevron-left" />
          </Button>
          <Button
            variant="ghost"
            title="Align Center"
            className="w-11 h-11 p-0"
            onClick={() =>
              dispatch({ type: "ALIGN_SELECTION", axis: "x", align: "center" })
            }
          >
            <Icon name="target" />
          </Button>
          <Button
            variant="ghost"
            title="Align Right"
            className="w-11 h-11 p-0"
            onClick={() =>
              dispatch({ type: "ALIGN_SELECTION", axis: "x", align: "end" })
            }
          >
            <Icon name="chevron-right" />
          </Button>
          <span className="mx-1 w-px h-6 bg-border-light" />
          <Button
            size={14}
            variant="ghost"
            title="Align Top"
            className="w-11 h-11 p-0"
            onClick={() =>
              dispatch({ type: "ALIGN_SELECTION", axis: "y", align: "start" })
            }
          >
            <Icon name="chevron-up" />
          </Button>
          <Button
            size={14}
            variant="ghost"
            title="Align Middle"
            className="w-11 h-11 p-0"
            onClick={() =>
              dispatch({ type: "ALIGN_SELECTION", axis: "y", align: "center" })
            }
          >
            <Icon name="target" />
          </Button>
          <Button
            size={14}
            variant="ghost"
            title="Align Bottom"
            className="w-11 h-11 p-0"
            onClick={() =>
              dispatch({ type: "ALIGN_SELECTION", axis: "y", align: "end" })
            }
          >
            <Icon name="chevron-down" />
          </Button>
          <span className="mx-1 w-px h-6 bg-border-light" />
          <Button
            size={14}
            variant="ghost"
            title="Distribute Horizontally (even)"
            className="w-11 h-11 p-0"
            onClick={() =>
              dispatch({ type: "DISTRIBUTE_SELECTION", axis: "x" })
            }
          >
            <Icon name="grid" />
          </Button>
          <Button
            size={14}
            variant="ghost"
            title="Distribute Vertically (even)"
            className="w-11 h-11 p-0"
            onClick={() =>
              dispatch({ type: "DISTRIBUTE_SELECTION", axis: "y" })
            }
          >
            <Icon name="grid" />
          </Button>
          <span className="mx-1 w-px h-6 bg-border-light" />
          <span className="text-[11px] text-text-primary">Spacing</span>
          <input
            type="number"
            aria-label="Distribute spacing percent"
            value={state.ui.distributeSpacing ?? 5}
            min={0}
            max={100}
            step={0.5}
            onChange={(e) =>
              dispatch({
                type: "SET_DISTRIBUTE_SPACING",
                spacing: Number(e.target.value),
              })
            }
            className="w-16 text-[12px] rounded px-2 py-1"
            title="Fixed spacing (%)"
          />
          <Button
            size={14}
            variant="ghost"
            title="Distribute Fixed Horizontally"
            className="w-11 h-11 p-0"
            onClick={() =>
              dispatch({
                type: "DISTRIBUTE_SELECTION_FIXED",
                axis: "x",
                spacing: state.ui.distributeSpacing ?? 5,
              })
            }
          >
            <Icon name="arrow-left" />
          </Button>
          <Button
            size={14}
            variant="ghost"
            title="Distribute Fixed Vertically"
            className="w-11 h-11 p-0"
            onClick={() =>
              dispatch({
                type: "DISTRIBUTE_SELECTION_FIXED",
                axis: "y",
                spacing: state.ui.distributeSpacing ?? 5,
              })
            }
          >
            <Icon name="arrow-up" />
          </Button>
        </div>
        <div
          className="flex items-center gap-2 ml-auto"
          aria-label="Snap settings"
        >
          <label className="flex items-center gap-1 text-[11px] text-text-primary">
            <input
              type="checkbox"
              checked={state.ui.snap}
              onChange={(e) =>
                dispatch({ type: "SET_SNAP", enabled: e.target.checked })
              }
            />
            Snap
          </label>
          <select
            value={state.ui.snapGrid}
            onChange={(e) =>
              dispatch({ type: "SET_SNAP_GRID", size: Number(e.target.value) })
            }
            className="text-[11px] rounded px-2 py-1"
          >
            <option value={1}>1%</option>
            <option value={2}>2%</option>
            <option value={5}>5%</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ToolPalette;
