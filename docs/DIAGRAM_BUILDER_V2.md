## Diagram Builder v2 (Rewrite Plan & Status)

Goal: Replace the current MVP `DiagramEditorMVP` with a modular, extensible visual editor that matches professional play design tools (multi‑tab UI, zoom/pan, player role management, route authoring, settings, export/thumbnail, telemetry + complexity metrics).

Updated: Implementation has progressed beyond the original Phase 1 scope; this document now tracks what is DONE vs. REMAINING.

### Non‑Goals (Phase 1)

- Animation / motion playback
- Advanced curved routing / timing windows
- Defensive auto‑align heuristics
- Multi‑user real‑time collaboration

### Core User Stories

1. Coach can position offensive (and optionally defensive) players onto a normalized 53 1/3 × 120 yard field (including end zones) with hash marks & yard lines.
2. Coach can draw a multi‑segment route for a player (straight segments initially) and edit/remove segments.
3. Coach can zoom (wheel / pinch) & pan (drag in pan mode or space+drag) with reset.
4. Coach can toggle rendering layers: yard lines, hash marks, player labels, route arrows, numbering.
5. Saving the play persists diagram JSON + derived complexity metrics (player count, route segment count, distinct route types).
6. Export generates a PNG thumbnail (server or client rasterization) used in PlayGrid / exports.
7. Editor auto‑autosaves draft (merged with existing play builder draft system) including diagram state.

### High-Level Architecture

- `diagram-v2/` (new folder)
  - `types.ts`: Stable schema (DiagramDocument) versioned.
  - `context.tsx`: React context + reducer (pure, testable) for editor state.
  - `FieldCanvas.tsx`: Pure SVG canvas (no global side effects) exposing callbacks (onPlayerMove, onRouteAdd, onSelect).
  - `Toolbar.tsx`: Tool selection (select/move, route, player, pan, delete, settings) + contextual actions.
  - `PlayersPanel.tsx`: Table / list for editing player metadata (label, role, side, color) w/ add/remove.
  - `RoutesPanel.tsx`: List of routes per player; ability to clear or re-record.
  - `SettingsPanel.tsx`: Field rendering toggles + snapping grid resolution.
  - `VisualPlayBuilderV2.tsx`: Shell with tabs (Field View, Players, Routes, Settings) + side info card similar to screenshot.
  - `serialization.ts`: (de)serialize model + forward schema migrations.
  - `complexity.ts`: Deterministic complexity calculation (exported for reuse / testing).
  - `thumbnail.ts`: Utility to rasterize SVG to PNG (offscreen canvas) (Phase 2).

### Data Model (Initial)

```
interface DiagramPlayer { id: string; label: string; role?: string; side?: 'O'|'D'|'ST'; x: number; y: number; color?: string; locked?: boolean; }
interface RoutePoint { x: number; y: number; }
interface RouteSegment { id: string; points: RoutePoint[]; type: 'line'; }
interface PlayerRoute { id: string; playerId: string; segments: RouteSegment[]; color?: string; }
interface DiagramDocumentV1 { version: 1; field: { orientation: 'horizontal'|'vertical'; showYardLines: boolean; showHashMarks: boolean; showPlayerLabels: boolean; }; players: DiagramPlayer[]; routes: PlayerRoute[]; meta?: { createdAt: number; updatedAt: number; }; }
```

### Complexity Metric (v1)

Score = clamp( ceil( (routeSegments + uniquePlayersWithRoutes) / 3 ), 1, 5 )
Future: weight by intersections, motion shifts, formation spread index.

### Telemetry Events

Current (emitted via dispatcher):
- `play.diagram_player_add` { role }
- `play.diagram_route_add` { playerId, segments }
- `play.diagram_updated` { players, routes, segments, tool }
- `play.draft.autosave` { fields, hasDiagram, v2 }
- `play.draft.restore` { ageMs, hasDiagram, v2 }
- `play.draft.finalize` { hasDiagram, v2 }
- (Planned) `play.diagram_export_thumbnail` { w, h, durationMs }

Planned Additions:
- `play.diagram_flag_toggle` { flag, value }
- `play.diagram_history` { action: 'undo'|'redo', index, length }
- `play.diagram_player_update` { fields }

### Phased Delivery (Revised with Status)

| Phase | Deliverables (Original + Revisions)                                                                                              | Status        | Notes |
|-------|-----------------------------------------------------------------------------------------------------------------------------------|---------------|-------|
| 1     | Core shell, context, move players, single route drawing, zoom/pan, feature flag, autosave integration                            | DONE          | Landed with draft persistence + complexity seed |
| 2     | Multi‑segment routes, route listing + delete, complexity calc extraction, undo/redo history, snapping grid toggle & resolution   | DONE (expanded) | History + snapping pulled forward from later phases |
| 2b    | Player metadata panel (labels/roles/colors), field layer toggles UI, settings panel wiring                                       | IN PROGRESS   | Data model supports flags; UI pending |
| 3     | Thumbnail export (SVG→PNG), integrate into PlayGrid cards, telemetry for export                                                   | TODO          | Needs `thumbnail.ts` utility |
| 4     | Curved (quadratic) segments, segment editing handles (insert/remove), history size bounding                                       | TODO          | Refine reducer invariants |
| 5     | Defensive templates, preset formations, player role presets                                                                      | FUTURE        | Possibly separate spec |
| 6     | Advanced analytics (spread index, intersections), improved complexity model                                                       | FUTURE        | Extend computeComplexityScore |

Completed scope exceeds original Phase 1 (we fast‑tracked multi‑segment, delete, undo/redo, snapping, complexity integration).

### Feature Flag

`VITE_ENABLE_PLAY_DIAGRAM_V2` – when true, PlayBuilderCore now renders the experimental VisualPlayBuilderV2 in place of the legacy MVP diagram editor. (Implemented: feature flag check added in PlayBuilderCore.) Add `VITE_ENABLE_PLAY_DIAGRAM_V2=1` to your `.env.local` (or export in shell before `npm run dev`).

### Unified Entry Points (Implemented)

The top-level Playbook header "Diagram" button now routes to the same builder experience as the per-play card "Create diagram" action when `VITE_ENABLE_PLAY_DIAGRAM_V2` is enabled. Both navigate to `/playbook/diagram` (optionally with `?playId=<id>`). If the flag is off, play cards fall back to the legacy modal while the header button remains disabled/presenting a toast. This keeps free-draw sketches and play-linked diagrams aligned and reduces duplicate UI paths.

### Integration Plan (Updated)

1. (Done) Land scaffolding & feature flag.
2. (Done) Route integration from Playbook header & play cards → unified experience when flag enabled.
3. (Done) Local autosave persistence extended to store `diagram_v2` in unified draft payload.
4. (In Progress) Upstream persistence: add `diagram_v2` JSON field to backend Play entity (currently attached ad‑hoc via partial object on save).
5. (Todo) Replace MVP editor entirely once player metadata + field toggles + thumbnail export are delivered (ensuring parity + value add).
6. (Future) Remove legacy draft key (`bc_playbuilder_draft_v1`) after migration window.

### Current Implementation Details

Delivered Mechanics:
- Player add & drag (with snapping optional; grid resolution: 1,2,4,5,10%).
- Multi‑segment route drawing (double‑click to commit / ESC to cancel actively drawing route).
- Route listing with delete per route.
- Undo / Redo with bounded history stack (unbounded currently; needs cap) for discrete doc mutations (add/remove player, commit/delete route, update player, remove player).
- Pan & zoom (with reset) and tool switching (select, player, route, pan).
- Complexity scoring displayed live; stored into play on save (v2 doc path).
- Draft autosave & restore merged with existing PlayBuilder draft (stores diagram_v2 alongside legacy diagram when present).
- Telemetry for add player / add route / diagram updates + draft lifecycle + finalize.
- Upward doc propagation (onDocumentChange) integrated into `PlayBuilderCore` for live complexity + autosave.

Not Yet Implemented (UI placeholders or planned):
- Player metadata panel (edit label/role/color) & player delete via panel.
- Field layer toggles (hash marks, yard lines, labels visibility) – reducer flags exist but no settings panel UI.
- Thumbnail export & integration into grids / exports.
- History size cap & pruning strategy.
- Curved routes and segment editing handles.
- Defensive formation templates & presets.
- Enhanced complexity model (intersections, spread index, motion counts).

Technical Notes:
- History currently stores full document snapshots; optimize (structural sharing or patch compression) after size measurement.
- Complexity computation is pure & deterministic; exported from types for test coverage.
- Snapping performed during pointer move events; grid percent applies to field width/height scaling.
- ESC handler cancels active route capture without polluting history.

Immediate Next Steps:
1. Implement Player Metadata panel (CRUD + color selection, side/role tags) with related telemetry.
2. Add Settings panel with field layer toggles and snap controls (moving snap UI out of toolbar cluster) + telemetry for toggles.
3. Introduce history cap (e.g., 100 states) & telemetry for undo/redo events.
4. Add thumbnail export utility; surface save/export button & integrate into Play save flow (store reference / blob pipeline decision).
5. Backend schema extension for `diagram_v2` (JSONB) & migration path for existing plays.
6. Remove MVP diagram pathway post‑parity and cleanup dead code.

### Open Questions

- Backend persistence field name? (e.g., `diagram_json` JSONB)
- Should we normalize player roles for analytics (QB, RB, WR, TE, OL segments)?
- Do we require distinct offensive vs defensive color palette constraints? (Probably yes - future.)

### Risks & Mitigations

- Scope creep (animation, advanced route editing) → Phase gating & strict success criteria.
- Performance for large route sets → Use React.memo + shallow context slices; virtualization not needed initially.
- Draft size growth with embedded thumbnails → Keep thumbnails separate; limit route segments per player (soft cap warning).

---

This document will evolve; treat as living spec until Phase 2b is complete. Last updated after integrating undo/redo, snapping, and draft persistence (see Current Implementation Details).
