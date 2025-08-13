# Playbook Feature Competitive Analysis

Competitor Reference: FirstDown PlayBook (public marketing site)
Date: 2025-08-12
Status Legend: DONE (in code), PARTIAL (scaffold exists), TODO (planned), FUTURE (later phase / out-of-scope now)

## 1. Core Diagram Editor

| Capability                                                  | Competitor Signals                | Our Current State                                   | Gap / Action                                               |
| ----------------------------------------------------------- | --------------------------------- | --------------------------------------------------- | ---------------------------------------------------------- |
| Add / move players                                          | Emphasized as quick & easy        | DONE (V2)                                           | -                                                          |
| Straight routes                                             | Baseline                          | DONE                                                | -                                                          |
| Curved / arced routes                                       | Supports curved lines             | TODO                                                | Add quadratic segment type + handles (Phase 4)             |
| Multi‑segment editing (insert/remove)                       | Implied advanced editing          | PARTIAL (create multi segments, delete whole route) | Segment-level edit UI                                      |
| Color selection per player/route                            | “Colorful” diagrams               | TODO                                                | Metadata panel color pickers                               |
| Symbols / annotations (text, cones, motion, blocking icons) | Listed (symbols, text)            | TODO                                                | Lightweight overlay layer + symbol palette                 |
| Layer toggles (hash, yard lines, labels)                    | Field backgrounds & customization | PARTIAL (flags in model, no UI)                     | Settings panel wiring                                      |
| Field backgrounds (HS/College/NFL, flag)                    | 10 backgrounds                    | TODO                                                | Add field variant prop + scale/orientation switch          |
| Zoom & specialized “Lineman view” (250%)                    | High zoom focus                   | DONE (zoom + pan)                                   | Add quick preset zooms + maybe focus rectangle             |
| Snap to grid                                                | Power feature                     | DONE                                                | Add visual grid overlay + configurable intensity           |
| Undo / redo history                                         | Expected                          | DONE                                                | Add history cap & telemetry                                |
| Flip / mirror play                                          | “Flip ANY play”                   | TODO                                                | Horizontal mirror transform + player route point inversion |
| Templates / stencils                                        | Save reusable formations/routes   | TODO                                                | Introduce snippet serialization + palette panel            |
| Complexity metric                                           | Not marketed but internal         | DONE (basic)                                        | Iterate weighting once advanced features land              |

## 2. Content Library / Play Assets

| Capability                                   | Competitor               | Our State                 | Action                                              |
| -------------------------------------------- | ------------------------ | ------------------------- | --------------------------------------------------- |
| Large pre‑drawn play library (35k+)          | Yes                      | FUTURE (no library)       | Decide on seed strategy: curated JSON set + tagging |
| Search / filter (formation, type, personnel) | Implied                  | BASIC (play list filters) | Expand index & add diagram attributes filters       |
| Mirrored variants auto‑generated             | Yes                      | TODO                      | Mirror on save or on-demand + caching               |
| Tagging & grouping                           | Likely (coaching points) | PARTIAL (tags system?)    | Confirm existing tagging infra / add diagram tags   |

## 3. Practice & Game Prep Tools

| Capability                       | Competitor | Our State | Action                                                        |
| -------------------------------- | ---------- | --------- | ------------------------------------------------------------- |
| Practice cards / install sheets  | Yes        | FUTURE    | Export templating engine (cards layout)                       |
| Practice schedules builder       | Yes        | FUTURE    | Separate module referencing plays                             |
| Script generation (ordered reps) | Yes        | FUTURE    | Table UI referencing play IDs + export                        |
| Wristband sheets (youth/adult)   | Yes        | FUTURE    | CSV→formatted PDF generator; integrate thumbnail or text only |
| Scouting reports                 | Yes        | FUTURE    | Data model + report DSL                                       |

## 4. Media & Enrichment

| Capability                          | Competitor         | Our State             | Action                                              |
| ----------------------------------- | ------------------ | --------------------- | --------------------------------------------------- |
| Video pairing (attach clip to play) | Yes                | FUTURE                | Add media attachments table + player/time indexing  |
| Coaching points text per play       | Yes                | PARTIAL (notes field) | Structured coaching points list with categories     |
| Motion / timing indicators          | Some visualization | TODO                  | Segment timing metadata + animation preview (later) |

## 5. Collaboration & Org

| Capability                                              | Competitor   | Our State                 | Action                                |
| ------------------------------------------------------- | ------------ | ------------------------- | ------------------------------------- |
| Multi-user team accounts w/ unlimited users (team plan) | Yes          | PARTIAL (basic ownership) | Role-based access + shared playbooks  |
| Feeder program hierarchy                                | Yes          | FUTURE                    | Org tree model                        |
| Version history / revisions                             | Implied need | TODO                      | Persisted snapshot log (diff or full) |
| Commenting / review workflow                            | Not explicit | FUTURE                    | Inline diagram comments               |

## 6. Export & Distribution

| Capability               | Competitor | Our State | Action                              |
| ------------------------ | ---------- | --------- | ----------------------------------- |
| PNG export / thumbnails  | Yes        | TODO      | thumbnail.ts + client canvas raster |
| PDF play cards           | Yes        | FUTURE    | PDF layout service                  |
| Batch export (playbooks) | Yes        | FUTURE    | Zip pipeline of rendered assets     |
| Wristband sheet printing | Yes        | FUTURE    | Specialized formatter               |
| Mirrored print variants  | Yes        | TODO      | Add mirror batch option             |

## 7. Mobile & Offline

| Capability               | Competitor | Our State | Action                                 |
| ------------------------ | ---------- | --------- | -------------------------------------- |
| Native iOS/Android apps  | Yes        | FUTURE    | Consider PWA first; measure engagement |
| Offline viewing (cached) | Likely     | FUTURE    | Service worker + local DB              |

## 8. Performance & Scale

| Area                  | Current Status      | Risk                | Planned Mitigation                                    |
| --------------------- | ------------------- | ------------------- | ----------------------------------------------------- |
| History memory growth | Unbounded snapshots | Memory bloat        | Cap (N=100) + diff strategy                           |
| Large library search  | Absent              | Latency when added  | Client index (Fuse.js / mini-Lucene) + server filters |
| Thumbnail generation  | Not built           | Jank on main thread | Offscreen canvas / worker                             |

## 9. Security & Data Integrity

| Concern                                | Action                                                |
| -------------------------------------- | ----------------------------------------------------- |
| Draft persistence collision (v1 vs v2) | Sunset v1 key after migration window                  |
| Unsaved loss on refresh                | Covered by autosave                                   |
| Broken schema on future migrations     | Add version field & migration map in serialization.ts |

## 10. Prioritized Near-Term Roadmap (Next 4–6 Weeks)

| Priority | Feature                                              | Effort (est) | Dependencies             | Telemetry Hook                      |
| -------- | ---------------------------------------------------- | ------------ | ------------------------ | ----------------------------------- |
| P1       | Player Metadata Panel (roles, colors, delete)        | 2d           | Existing reducer actions | player_update, player_delete        |
| P1       | Field Settings Panel (layer toggles + snap controls) | 1.5d         | Flags exist              | field_flag_toggle                   |
| P1       | History Cap & Metrics                                | 0.5d         | Current reducer          | history_event                       |
| P2       | Thumbnail Export & Integration                       | 2d           | SVG stable               | diagram_export_thumbnail            |
| P2       | Mirror Play Action                                   | 1d           | Completed doc model      | diagram_mirror                      |
| P2       | Templates / Stencils MVP                             | 3d           | Serialization util       | template_create/use                 |
| P3       | Curved Routes + Segment Editing                      | 4d           | Route editing infra      | route_curve_add, route_segment_edit |
| P3       | Player/Route Color UI                                | 1d           | Metadata panel           | player_update                       |
| P3       | Librarian / Search Enhancements                      | 3d           | Need indexing util       | search_query                        |

## 11. Technical Implementation Notes (Design Decisions)

- Mirror Operation: Pure transform: x' = fieldWidth - x; route segments remapped; maintain player order; treat origin (0,0) left-top.
- Templates (Stencils): Serialize subset (selected players + routes) into reusable JSON; apply with offset relative to first selected player.
- Curved Routes: Add segment type 'quad' with control point; complexity weight > line.
- Thumbnail: "Render minimal SVG" → clone diagram group, apply scale, pass to canvas via `drawImage` in an offscreen canvas, return Blob.
- History Optimization: Replace full document arrays with ring buffer; store structural-shared objects or patch diffs (Immer patches) after baseline delivered.
- Field Background Variants: Enum in document `field.variant` (hs|college|pro|flag); dimension mapping used for scaling hash marks.

## 12. Data Model Extensions (Proposed)

```ts
interface DiagramFieldSettings {
  variant: "hs" | "college" | "pro" | "flag";
  showYardLines: boolean;
  showHashMarks: boolean;
  showPlayerLabels: boolean;
  showRouteArrows: boolean;
}
interface DiagramPlayerMeta {
  id: string;
  label: string;
  role?: string;
  side?: "O" | "D" | "ST";
  x: number;
  y: number;
  color?: string;
  locked?: boolean;
}
interface DiagramDocumentV2 extends DiagramDocumentV1 {
  field: DiagramFieldSettings;
}
```

Migration: If `version===1`, add defaults for new `field.variant='pro'` & `showRouteArrows=true`.

## 13. Telemetry Additions (Spec)

```ts
// New events
play.diagram_flag_toggle { flag: string; value: boolean }
play.diagram_history { action: 'undo'|'redo'; index: number; length: number }
play.diagram_player_update { playerId: string; fields: string[] }
play.diagram_export_thumbnail { w: number; h: number; durationMs: number }
play.diagram_mirror { players: number; routes: number }
play.diagram_template_apply { players: number; routes: number }
```

## 14. Acceptance Criteria (Near Term)

- Saving a play with V2 includes `diagram_v2` JSON and updated complexity.
- Autosave writes within 1.5s idle; restore within 250ms of load.
- History (<=100 states) memory usage < 2MB for typical play (<10 players, <10 routes).
- Mirror action round-trips (mirror→mirror) yields original geometry (id stability except routes re-generated).
- Thumbnail generation < 150ms for median diagram on M1 MacBook Air.

## 15. Risks & Mitigations (Updated)

| Risk                                         | Impact           | Mitigation                            |
| -------------------------------------------- | ---------------- | ------------------------------------- |
| Feature creep delaying parity removal of MVP | Slows cleanup    | Lock P1 scope before adding P2+       |
| Large history memory                         | Perf regressions | Cap + measure; switch to diffs        |
| Schema divergence (diagram_v2 not persisted) | Data loss        | Back-end migration early              |
| Unbounded template proliferation             | Clutter          | Template naming + tagging + delete UI |

## 16. Decommission Plan for MVP

1. Reach P1 completion (metadata, settings, history cap).
2. Migrate any existing MVP diagrams to V2 (basic adapter ignoring advanced fields).
3. Remove `DiagramEditorMVP` imports and conditional branches.
4. Delete legacy draft key after 2 releases.
5. Update docs & README references.

---

This analysis will be updated as major milestones are achieved. PRs touching diagram-v2 should reference this document section numbers in their description for traceability.
