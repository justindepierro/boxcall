import React from "react";

import { telemetry } from "../../../../telemetry/dispatcher";
import { TelemetryEventTypes } from "../../../../telemetry/events";
import { Button } from "../../../ui/Button";
import { useDiagramEditor } from "../context/useDiagramEditor";

import type { DiagramPlayer, DiagramDocument } from "../types/types";
import { colorTokens } from "../../../../design-system/tokens";

// PlayerSidebar: handles player stats, bulk edit controls and grouped player list (no routes panel)
export const PlayerSidebar: React.FC = () => {
  const { state, dispatch } = useDiagramEditor();
  const complexity = React.useMemo(() => {
    const doc = state.doc as DiagramDocument & { complexity_score?: number };
    const routesLength = Array.isArray(doc.routes) ? doc.routes.length : 0;
    const playersLength = Array.isArray(doc.players) ? doc.players.length : 0;
    return doc.complexity_score ?? routesLength + playersLength;
  }, [state.doc]);
  if (!state.doc) return null;
  const playersLength = Array.isArray(state.doc.players)
    ? state.doc.players.length
    : 0;
  const routesLength = Array.isArray(state.doc.routes)
    ? state.doc.routes.length
    : 0;
  return (
    <div data-testid="player-sidebar-root">
      <div className="text-xsssssssssssssssssss text-text-secondary">Complexity: {complexity}</div>
      <div className="text-xsssssssssssssssssss text-text-secondary">Players: {playersLength}</div>
      <div className="text-xsssssssssssssssssss text-text-secondary">Routes: {routesLength}</div>
      {playersLength > 0 && (
        <div>
          <div className="text-[11px] font-semibold text-text-xssssssssssssssssssrimary mt-3 mb-1 flex items-center justify-between">
            <span>PLAYERS</span>
            <span className="text-[10px] font-normal text-text-tertiary">
              {state.doc.players.filter((p) => p.side !== "D").length} O /{" "}
              {state.doc.players.filter((p) => p.side === "D").length} D
            </span>
          </div>
          {state.ui.selectedIds && state.ui.selectedIds.length > 1 && (
            <div className="mb-2 p-2 rounded-lg border border-text-warning bg-surface-warning/70 space-y-2">
              <div className="text-[10px] font-medium text-text-warning tracking-wide">
                {state.ui.selectedIds.length} selected – bulk edit
              </div>
              <div className="text-[10px] text-text-warning">
                Roles:{" "}
                {Array.from(
                  new Set(
                    state.doc.players
                      .filter((p) => state.ui.selectedIds?.includes(p.id))
                      .map((p) => p.role || "—")
                  )
                ).join(", ")}
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <label className="flex items-center gap-1 text-[10px]">
                  <input
                    type="color"
                    className="h-5 w-5 p-0 border border-subtle rounded-lg cursor-pointer"
                    onChange={(e) =>
                      dispatch({
                        type: "UPDATE_PLAYERS_BULK",
                        ids: state.ui.selectedIds || [],
                        patch: { color: e.target.value },
                      })
                    }
                  />
                  <span>Color</span>
                </label>
                <label className="flex items-center gap-1 text-[10px]">
                  <input
                    type="color"
                    className="h-5 w-5 p-0 border border-subtle rounded-lg cursor-pointer"
                    onChange={(e) =>
                      dispatch({
                        type: "UPDATE_PLAYERS_BULK",
                        ids: state.ui.selectedIds || [],
                        patch: { outlineColor: e.target.value },
                      })
                    }
                  />
                  <span>Outline</span>
                </label>
                <select
                  className="px-1 py-0.5 text-[11px] border border-subtle rounded-lg surface-card"
                  onChange={(e) => {
                    if (!e.target.value) return;
                    dispatch({
                      type: "UPDATE_PLAYERS_BULK",
                      ids: state.ui.selectedIds || [],
                      patch: { role: e.target.value },
                    });
                    e.target.value = "";
                  }}
                  defaultValue=""
                >
                  <option value="">Role…</option>
                  {[
                    "QB",
                    "RB",
                    "WR",
                    "TE",
                    "OL",
                    "DL",
                    "LB",
                    "CB",
                    "S",
                    "K",
                    "P",
                  ].map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() =>
                    dispatch({
                      type: "UPDATE_PLAYERS_BULK",
                      ids: state.ui.selectedIds || [],
                      patch: { outlineColor: undefined },
                    })
                  }
                  className="text-[10px]"
                >
                  Clear Outline
                </Button>
                {!state.ui.pendingBulkDelete && (
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() =>
                      dispatch({
                        type: "SET_PENDING_BULK_DELETE",
                        pending: true,
                      })
                    }
                    className="text-[10px] text-text-error"
                  >
                    Delete Selected
                  </Button>
                )}
                {state.ui.pendingBulkDelete && (
                  <div className="flex items-center gap-1">
                    <Button
                      size="xs"
                      variant="secondary"
                      onClick={() => {
                        dispatch({
                          type: "REMOVE_PLAYERS",
                          ids: state.ui.selectedIds || [],
                        });
                        dispatch({
                          type: "SET_PENDING_BULK_DELETE",
                          pending: false,
                        });
                      }}
                    >
                      Confirm Del ({state.ui.selectedIds.length})
                    </Button>
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() =>
                        dispatch({
                          type: "SET_PENDING_BULK_DELETE",
                          pending: false,
                        })
                      }
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
          <ul className="space-y-2">
            {(() => {
              interface Category {
                label: string;
                match: (p: DiagramPlayer) => boolean;
              }
              const categories: Category[] = [
                { label: "QUARTERBACK", match: (p) => p.role === "QB" },
                {
                  label: "SKILL",
                  match: (p) => ["RB", "WR", "TE"].includes(p.role || ""),
                },
                {
                  label: "OFFENSIVE LINE",
                  match: (p) =>
                    p.role === "OL" ||
                    ["LT", "LG", "C", "RG", "RT"].includes(p.label),
                },
                { label: "DEFENSE", match: (p) => p.side === "D" },
              ];
              const rendered: React.ReactNode[] = [];
              let remaining = [...state.doc.players];
              categories.forEach((cat) => {
                const group = remaining.filter(cat.match);
                if (!group.length) return;
                rendered.push(
                  <li key={cat.label + "_hdr"} className="mt-2 first:mt-0">
                    <div className="text-[10px] font-semibold tracking-wide text-text-secondary px-1">
                      {cat.label}
                    </div>
                  </li>
                );
                group.forEach((gp) => {
                  const i = state.doc.players.findIndex(
                    (pl) => pl.id === gp.id
                  );
                  const pending = state.ui.pendingDeleteId === gp.id;
                  rendered.push(
                    <li
                      key={gp.id}
                      className="surface-card/70 rounded-lg border border-subtle p-2 space-y-1"
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/player-id", gp.id);
                        e.dataTransfer.effectAllowed = "move";
                        (
                          e.dataTransfer as unknown as { _dragStartTs?: number }
                        )._dragStartTs = performance.now();
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = "move";
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        const id = e.dataTransfer.getData("text/player-id");
                        if (!id || id === gp.id) return;
                        const from = state.doc.players.findIndex(
                          (pl) => pl.id === id
                        );
                        if (from === -1) return;
                        const to = i;
                        const start =
                          (
                            e.dataTransfer as unknown as {
                              _dragStartTs?: number;
                            }
                          )._dragStartTs || performance.now();
                        dispatch({
                          type: "MOVE_PLAYER_INDEX",
                          id,
                          toIndex: to,
                        });
                        telemetry.enqueue({
                          type: TelemetryEventTypes.PlayDiagramPlayerReorder,
                          data: {
                            method: "drag",
                            playerId: id,
                            from,
                            to,
                            durMs: Math.round(performance.now() - start),
                          },
                        });
                        const listEl = document.querySelector("ul.space-y-2");
                        const listHeight = listEl
                          ? (listEl as HTMLElement).clientHeight
                          : undefined;
                        window.dispatchEvent(
                          new CustomEvent("diagram:player-reorder", {
                            detail: {
                              durMs: Math.round(performance.now() - start),
                              listHeight,
                            },
                          })
                        );
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          className="w-14 px-1 py-0.5 text-[11px] border border-subtle rounded-lg surface-card"
                          value={gp.label}
                          onChange={(e) =>
                            dispatch({
                              type: "UPDATE_PLAYER",
                              id: gp.id,
                              patch: {
                                label: e.target.value.toUpperCase().slice(0, 3),
                              },
                            })
                          }
                        />
                        <select
                          className="flex-1 px-1 py-0.5 text-[11px] border border-subtle rounded-lg surface-card"
                          value={gp.role || ""}
                          onChange={(e) =>
                            dispatch({
                              type: "UPDATE_PLAYER",
                              id: gp.id,
                              patch: { role: e.target.value || undefined },
                            })
                          }
                        >
                          <option value="">Role</option>
                          {[
                            "QB",
                            "RB",
                            "WR",
                            "TE",
                            "OL",
                            "DL",
                            "LB",
                            "CB",
                            "S",
                            "K",
                            "P",
                          ].map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                        <select
                          className="w-14 px-1 py-0.5 text-[11px] border border-subtle rounded-lg surface-card"
                          value={gp.side || "O"}
                          onChange={(e) =>
                            dispatch({
                              type: "UPDATE_PLAYER",
                              id: gp.id,
                              patch: {
                                side: e.target.value as "O" | "D" | "ST",
                              },
                            })
                          }
                        >
                          <option value="O">O</option>
                          <option value="D">D</option>
                          <option value="ST">ST</option>
                        </select>
                        <label className="flex items-center gap-1">
                          <input
                            type="color"
                            className="h-6 w-6 p-0 border border-subtle rounded-lg cursor-pointer"
                            value={
                              gp.color ||
                              (gp.side === "D" ? colorTokens.red[700] : colorTokens.blue[900])
                            }
                            onChange={(e) =>
                              dispatch({
                                type: "UPDATE_PLAYER",
                                id: gp.id,
                                patch: { color: e.target.value },
                              })
                            }
                          />
                        </label>
                        <div className="flex items-center gap-1">
                          <input
                            type="color"
                            className="h-6 w-6 p-0 border border-subtle rounded-lg cursor-pointer"
                            value={gp.outlineColor || "#ffffff"}
                            onChange={(e) =>
                              dispatch({
                                type: "UPDATE_PLAYER",
                                id: gp.id,
                                patch: { outlineColor: e.target.value },
                              })
                            }
                          />
                          <select
                            className="w-16 px-1 py-0.5 text-[11px] border border-subtle rounded-lg surface-card"
                            value={gp.outlineColor || ""}
                            onChange={(e) =>
                              dispatch({
                                type: "UPDATE_PLAYER",
                                id: gp.id,
                                patch: {
                                  outlineColor: e.target.value || undefined,
                                },
                              })
                            }
                          >
                            <option value="">Auto</option>
                            {[
                              "#ffffff",
                              "colorTokens.slate[50]",
                              colorTokens.gray[800],
                              colorTokens.gray[900],
                              "#000000",
                            ].map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center gap-1 ml-1">
                          <Button
                            size="xs"
                            variant="ghost"
                            disabled={i === 0}
                            onClick={() =>
                              dispatch({
                                type: "REORDER_PLAYER",
                                id: gp.id,
                                direction: "up",
                              })
                            }
                          >
                            ↑
                          </Button>
                          <Button
                            size="xs"
                            variant="ghost"
                            disabled={i === state.doc.players.length - 1}
                            onClick={() =>
                              dispatch({
                                type: "REORDER_PLAYER",
                                id: gp.id,
                                direction: "down",
                              })
                            }
                          >
                            ↓
                          </Button>
                          {!pending && (
                            <Button
                              size="xs"
                              variant="ghost"
                              onClick={() =>
                                dispatch({
                                  type: "SET_PENDING_DELETE",
                                  id: gp.id,
                                })
                              }
                            >
                              ✕
                            </Button>
                          )}
                          {pending && (
                            <div className="flex items-center gap-1">
                              <Button
                                size="xs"
                                variant="secondary"
                                onClick={() => {
                                  dispatch({
                                    type: "REMOVE_PLAYER",
                                    id: gp.id,
                                  });
                                  dispatch({
                                    type: "SET_PENDING_DELETE",
                                    id: undefined,
                                  });
                                }}
                              >
                                Del?
                              </Button>
                              <Button
                                size="xs"
                                variant="ghost"
                                onClick={() =>
                                  dispatch({
                                    type: "SET_PENDING_DELETE",
                                    id: undefined,
                                  })
                                }
                              >
                                Cancel
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                });
                remaining = remaining.filter((p) => !group.includes(p));
              });
              // Remaining uncategorized
              remaining.forEach((p) => {
                const i = state.doc.players.findIndex((pl) => pl.id === p.id);
                const pending = state.ui.pendingDeleteId === p.id;
                const startHandler = (e: React.DragEvent) => {
                  e.dataTransfer.setData("text/player-id", p.id);
                  e.dataTransfer.effectAllowed = "move";
                  (
                    e.dataTransfer as unknown as { _dragStartTs?: number }
                  )._dragStartTs = performance.now();
                };
                const dropHandler = (e: React.DragEvent) => {
                  e.preventDefault();
                  const id = e.dataTransfer.getData("text/player-id");
                  if (!id || id === p.id) return;
                  const from = state.doc.players.findIndex(
                    (pl) => pl.id === id
                  );
                  if (from === -1) return;
                  const to = i;
                  const start =
                    (e.dataTransfer as unknown as { _dragStartTs?: number })
                      ._dragStartTs || performance.now();
                  const dur = Math.round(performance.now() - start);
                  dispatch({ type: "MOVE_PLAYER_INDEX", id, toIndex: to });
                  telemetry.enqueue({
                    type: TelemetryEventTypes.PlayDiagramPlayerReorder,
                    data: {
                      method: "drag",
                      playerId: id,
                      from,
                      to,
                      durMs: dur,
                    },
                  });
                  const listEl = document.querySelector("ul.space-y-2");
                  const listHeight = listEl
                    ? (listEl as HTMLElement).clientHeight
                    : undefined;
                  window.dispatchEvent(
                    new CustomEvent("diagram:player-reorder", {
                      detail: { durMs: dur, listHeight },
                    })
                  );
                };
                rendered.push(
                  <li
                    key={p.id}
                    className="surface-card/80 rounded-lg border border-subtle p-2 space-y-1"
                    draggable
                    onDragStart={startHandler}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = "move";
                    }}
                    onDrop={dropHandler}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        className="w-14 px-1 py-0.5 text-[11px] border border-subtle rounded-lg surface-card"
                        value={p.label}
                        onChange={(e) =>
                          dispatch({
                            type: "UPDATE_PLAYER",
                            id: p.id,
                            patch: {
                              label: e.target.value.toUpperCase().slice(0, 3),
                            },
                          })
                        }
                      />
                      <select
                        className="flex-1 px-1 py-0.5 text-[11px] border border-subtle rounded-lg surface-card"
                        value={p.role || ""}
                        onChange={(e) =>
                          dispatch({
                            type: "UPDATE_PLAYER",
                            id: p.id,
                            patch: { role: e.target.value || undefined },
                          })
                        }
                      >
                        <option value="">Role</option>
                        {[
                          "QB",
                          "RB",
                          "WR",
                          "TE",
                          "OL",
                          "DL",
                          "LB",
                          "CB",
                          "S",
                          "K",
                          "P",
                        ].map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                      <select
                        className="w-14 px-1 py-0.5 text-[11px] border border-subtle rounded-lg surface-card"
                        value={p.side || "O"}
                        onChange={(e) =>
                          dispatch({
                            type: "UPDATE_PLAYER",
                            id: p.id,
                            patch: { side: e.target.value as "O" | "D" | "ST" },
                          })
                        }
                      >
                        <option value="O">O</option>
                        <option value="D">D</option>
                        <option value="ST">ST</option>
                      </select>
                      <label className="flex items-center gap-1">
                        <input
                          type="color"
                          className="h-6 w-6 p-0 border border-subtle rounded-lg cursor-pointer"
                          value={
                            p.color || (p.side === "D" ? colorTokens.red[700] : colorTokens.blue[900])
                          }
                          onChange={(e) =>
                            dispatch({
                              type: "UPDATE_PLAYER",
                              id: p.id,
                              patch: { color: e.target.value },
                            })
                          }
                        />
                      </label>
                      <div className="flex items-center gap-1">
                        <input
                          type="color"
                          className="h-6 w-6 p-0 border border-subtle rounded-lg cursor-pointer"
                          value={p.outlineColor || "#ffffff"}
                          onChange={(e) =>
                            dispatch({
                              type: "UPDATE_PLAYER",
                              id: p.id,
                              patch: { outlineColor: e.target.value },
                            })
                          }
                        />
                        <select
                          className="w-16 px-1 py-0.5 text-[11px] border border-subtle rounded-lg surface-card"
                          value={p.outlineColor || ""}
                          onChange={(e) =>
                            dispatch({
                              type: "UPDATE_PLAYER",
                              id: p.id,
                              patch: {
                                outlineColor: e.target.value || undefined,
                              },
                            })
                          }
                        >
                          <option value="">Auto</option>
                          {[
                            "#ffffff",
                            "colorTokens.slate[50]",
                            colorTokens.gray[800],
                            colorTokens.gray[900],
                            "#000000",
                          ].map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center gap-1 ml-1">
                        <Button
                          size="xs"
                          variant="ghost"
                          disabled={i === 0}
                          onClick={() =>
                            dispatch({
                              type: "REORDER_PLAYER",
                              id: p.id,
                              direction: "up",
                            })
                          }
                        >
                          ↑
                        </Button>
                        <Button
                          size="xs"
                          variant="ghost"
                          disabled={i === state.doc.players.length - 1}
                          onClick={() =>
                            dispatch({
                              type: "REORDER_PLAYER",
                              id: p.id,
                              direction: "down",
                            })
                          }
                        >
                          ↓
                        </Button>
                        {!pending && (
                          <Button
                            size="xs"
                            variant="ghost"
                            onClick={() =>
                              dispatch({ type: "SET_PENDING_DELETE", id: p.id })
                            }
                          >
                            ✕
                          </Button>
                        )}
                        {pending && (
                          <div className="flex items-center gap-1">
                            <Button
                              size="xs"
                              variant="secondary"
                              onClick={() => {
                                dispatch({ type: "REMOVE_PLAYER", id: p.id });
                                dispatch({
                                  type: "SET_PENDING_DELETE",
                                  id: undefined,
                                });
                              }}
                            >
                              Del?
                            </Button>
                            <Button
                              size="xs"
                              variant="ghost"
                              onClick={() =>
                                dispatch({
                                  type: "SET_PENDING_DELETE",
                                  id: undefined,
                                })
                              }
                            >
                              Cancel
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                );
              });
              return rendered;
            })()}
          </ul>
        </div>
      )}
    </div>
  );
};
