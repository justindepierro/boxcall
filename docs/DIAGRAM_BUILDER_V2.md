## Diagram Builder v2 (Rewrite Plan)

Goal: Replace the current MVP `DiagramEditorMVP` with a modular, extensible visual editor that matches professional play design tools (multi‑tab UI, zoom/pan, player role management, route authoring, settings, export/thumbnail, telemetry + complexity metrics).

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

- `play.diagram_updated` { players, routes, segments, tool }
- `play.diagram_route_add` { playerId, segments }
- `play.diagram_player_add` { role }
- `play.diagram_export_thumbnail` { w, h, durationMs }

### Phased Delivery

| Phase | Deliverables                                                                                   | Notes                           |
| ----- | ---------------------------------------------------------------------------------------------- | ------------------------------- |
| 1     | Core shell + context + move players + draw single line route + zoom/pan + autosave integration | Replace MVP behind feature flag |
| 2     | Multiple segments per route, delete route, player metadata panel, complexity calc extracted    | Remove MVP code                 |
| 3     | Thumbnail export + PNG integration into PlayGrid + CSV/PDF exports                             | Adds raster utility             |
| 4     | Curved routes (quadratic), route editing handles, snapping                                     | UX polish                       |
| 5     | Defensive templates + preset formations                                                        | Future                          |

### Feature Flag

`VITE_ENABLE_PLAY_DIAGRAM_V2` – when true, PlayBuilderCore now renders the experimental VisualPlayBuilderV2 in place of the legacy MVP diagram editor. (Implemented: feature flag check added in PlayBuilderCore.) Add `VITE_ENABLE_PLAY_DIAGRAM_V2=1` to your `.env.local` (or export in shell before `npm run dev`).

### Integration Plan

1. Land scaffolding (this commit) inert (not referenced) → zero regression risk.
2. Add feature flag gating and route to open full-screen VisualPlayBuilderV2.
3. Wire serialization into Play save payload (store JSON in placeholder field or local-only until backend schema ready).
4. Replace MVP once Phase 1 parity achieved.

### Open Questions

- Backend persistence field name? (e.g., `diagram_json` JSONB)
- Should we normalize player roles for analytics (QB, RB, WR, TE, OL segments)?
- Do we require distinct offensive vs defensive color palette constraints? (Probably yes - future.)

### Risks & Mitigations

- Scope creep (animation, advanced route editing) → Phase gating & strict success criteria.
- Performance for large route sets → Use React.memo + shallow context slices; virtualization not needed initially.
- Draft size growth with embedded thumbnails → Keep thumbnails separate; limit route segments per player (soft cap warning).

---

This document will evolve; treat as living spec until Phase 2 locked.
