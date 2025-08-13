## Playbook Diagram Platform Unified Roadmap (V2 Implementation + Competitive Positioning)

Updated: 2025-08-13 (post group drag & move batching)
Status Legend: DONE (merged to main), PARTIAL (scaffold or partial UI), TODO (planned / prioritized), FUTURE (later phase / out-of-scope now)

### 1. Vision

Deliver a professional-grade, fast play design & playbook management system that:

- Enables rapid creation & iteration of offensive (and later defensive / ST) plays.
- Produces consistent, high‑fidelity diagram assets (thumbnails, exports, printouts).
- Provides structured metadata & telemetry for analytics (complexity, usage, install readiness).
- Establishes an extensible foundation (formations, templates, motion, animation, collaboration) without accruing legacy drag.

Legacy MVP editor has been decommissioned; V2 is now the single source of truth.

### 2. Current Product Value vs. Competitors (Condensed Summary)

| Domain             | Key Competitor Strength           | Our Status                                               | Gap Focus                              |
| ------------------ | --------------------------------- | -------------------------------------------------------- | -------------------------------------- |
| Core Editing       | Curved routes, symbols, templates | Solid foundation (multi‑segment, mirror, undo, snapping) | Curves, symbols, templates UI          |
| Library Depth      | Massive pre‑drawn catalog (35k+)  | None yet                                                 | Seed curated sets + tagging            |
| Practice / Prep    | Cards, scripts, wristbands        | Not started                                              | Export engine (cards)                  |
| Media & Enrichment | Video pairing, coaching points    | Notes only                                               | Media attachment model                 |
| Collaboration      | Multi‑user roles, comments        | Basic ownership                                          | RBAC + comments                        |
| Export             | PNG, PDF, batch                   | PNG (planned)                                            | Thumbnail + PDF pipeline               |
| Mobile / Offline   | Native + offline                  | Web only                                                 | PWA + offline cache                    |
| Analytics          | Internal metrics tooling          | Telemetry base                                           | Enhanced complexity + adoption metrics |

See original detailed competitive matrix (superseded) in prior doc; this table reflects the distilled strategic gaps we will close in sequence.

### 3. Implementation Status (V2 Diagram Builder)

| Capability                                      | Status              | Notes                                                               |
| ----------------------------------------------- | ------------------- | ------------------------------------------------------------------- |
| Player placement & dragging                     | DONE                | Snapping enabled; grid resolution supported                         |
| Multi‑segment route drawing                     | DONE                | Straight line segments; double‑click commit                         |
| Multi‑selection + keyboard nudge                | DONE                | Shift/Meta toggle, drag box, arrow move (0.5% / 2% w/ Shift)        |
| Group drag multi‑selection                      | DONE (new)          | Drag any selected moves all; centroid distance telemetry           |
| Player outline & curated color palette          | DONE (baseline)     | 12 color palette + optional outlineColor + auto contrast            |
| Field themes (classic / mono‑light / mono‑dark) | DONE                | Themed background + adaptive hash/number colors                     |
| Realistic hashes + sideline hashes              | DONE                | HS/College/NFL spacing, widened, added sideline markers              |
| Yard numbers rotation & placement               | DONE                | Split digits, correct 9 yd (27 ft) from sideline, rotated ±90°      |
| LOS bar customization (dark green @ yard)       | DONE                | Configurable losYards marker                                        |
| 11‑man default 2x2 formation seed               | DONE                | Accurate relative depths (QB shallow, RB deeper)                    |
| Undo / Redo history                             | DONE                | Needs cap + per‑action telemetry                                    |
| Complexity scoring                              | DONE                | Basic heuristic; extend later                                       |
| Zoom & Pan                                      | DONE                | Wheel + drag; add preset zoom shortcuts later                       |
| Autosave / Restore (draft)                      | DONE                | V2 only; legacy key soft‑retired (still read once)                  |
| Mirror (flip) play                              | DONE (baseline)     | Implemented reducer action; telemetry partial (improve payload)     |
| Ball hash selection & field hashes              | DONE (baseline)     | Hash toggle + center reposition                                     |
| Formation apply (example)                       | PARTIAL             | Single sample (trips-right); need library & idempotency             |
| Automatic formation detection & legality assist | FUTURE              | Auto grid snap to legal alignment (7 on LOS, ≤4 backfield), highlight violations |
| Player metadata panel                           | TODO                | Roles, colors, delete, ordering, bulk edit                          |
| Route list & deletion                           | DONE                | Per‑route removal                                                   |
| Field settings panel (consolidated controls)    | PARTIAL             | Theme/hash controls in toolbar; dedicated panel not built           |
| History size bound                              | TODO                | Target 100 snapshots ring buffer                                    |
| Group move history commit (COMMIT_MOVE)         | DONE                | Debounced commit + drag commit snapshot                            |
| Thumbnail export (PNG)                          | PARTIAL             | SVG→PNG utility + UI button; needs persistence + card integration   |
| Curved / editable segments                      | FUTURE              | Quadratic / handles; affects complexity weights                     |
| Motion tool                                     | FUTURE (spec)       | Distinct style + timing metadata                                    |
| Templates / Stencils                            | FUTURE (spec)       | Serialize selected subset + placement offset                        |
| Defensive templates                             | FUTURE              | Extend player roles & color semantics                               |
| Enhanced analytics (spread / intersections)     | FUTURE              | Build after route richness increases                                |

### 4. Data Model (Planned Evolution)

Current versioned doc: `DiagramDocument` (v1) plus interim extensions (hash, formations, mirror). Next formal version (v2) will introduce:

```ts
interface DiagramFieldSettings {
  variant: "pro" | "college" | "hs" | "flag";
  showYardLines: boolean;
  showHashMarks: boolean;
  showPlayerLabels: boolean;
  showRouteArrows: boolean;
}
interface DiagramDocumentV2 extends DiagramDocumentV1 {
  field: DiagramFieldSettings;
  // future: motion, annotations, templates metadata
}
```

Migration Path: On load, if `version===1`, inject default `field` block and set `version=2` lazily (in-memory) before save.

### 5. Complexity Metric Roadmap

Stage 1 (DONE): Segment & unique routed players (ceil / 3 capped at 5).
Stage 2: + Weight by curved segments & motion actions.
Stage 3: + Spread index (horizontal distribution), intersection count, formation diversity.
Stage 4: Predictive difficulty (historical success rates once data available).

### 6. Telemetry (Current & Additions)

Current events (emitted):
- PlayDiagramPlayerAdd
- PlayDiagramPlayerRemove
- PlayDiagramPlayerUpdate
- PlayDiagramRouteAdd
- PlayDiagramUpdated
- PlayDiagramBallHash
- PlayDiagramFieldTheme (new)
- PlayDiagramMirror
- PlayDiagramFormationApply (prototype)

Planned (next sprint additions / refinements):
- PlayDiagramHistory { action, index, length }
- PlayDiagramFlagToggle (partially in use for hash layout)
- PlayDiagramExportThumbnail { w, h, durationMs }
- PlayDiagramSelection (selectCount, multi: boolean, method: 'click'|'box'|'toggle'|'clear')
- PlayDiagramMoveGroup (count, mode: 'nudge'|'drag', dist)

Telemetry Gaps:
- Mirror event lacks before/after spread metrics
- No error channel around thumbnail failures
- Need sampling / throttling on rapid nudge sequences

### 7. Near-Term Priority Backlog (Next 4–6 Weeks)

| Priority | Feature                                 | Effort (est) | Definition of Done                                       |
| -------- | --------------------------------------- | ------------ | -------------------------------------------------------- |
| P1       | Player Metadata Panel                   | 2d           | Edit labels/roles/colors, delete player, telemetry hooks |
| P1       | Field Settings Panel                    | 1.5d         | Toggles + snap controls moved from toolbar, telemetry    |
| P1       | History Cap + Telemetry                 | 0.5d         | Ring buffer (100), emits diagram_history events          |
| P2       | Thumbnail Export + PlayCard Integration | 2d           | PNG stored + displayed; export event logged              |
| P2       | Formation Library (5–8 presets)         | 2d           | Apply w/out duplication; formation apply telemetry       |
| P2       | Auto Formation Detection & Snap         | 2.5d         | Classify LOS vs backfield, enforce 7-on-line & ≤4 backfield, grid snap, violation indicators |
| P2       | Mirror Telemetry & UI Polish            | 0.5d         | Event emission + button state/tooltip clarity            |
| P3       | Templates / Stencils MVP                | 3d           | Save/apply subset; template events                       |
| P3       | Curved Route Segments                   | 4d           | Quadratic segments + editing handles                     |
| P3       | Player / Route Color Picker UI          | 1d           | Integrated into metadata panel                           |

### 8. Longer-Horizon Initiatives

- Motion Authoring & Playback (animated timing lanes).
- Defensive / Special Teams layering & alignment presets.
- Collaborative Editing (multi-user presence + comments).
- Library Seeding & Search Index (tags, formation/personnel filters).
- Practice Card & Wristband PDF Exports.
- Video Clip Attachment & Time-coded Annotations.
- Advanced Analytics Dashboard (complexity vs. success, install readiness).

### 9. Acceptance Criteria (P1 Scope)

1. Saving a play persists `diagram_v2` JSON + updated complexity without legacy fields.
2. Autosave triggers within 1.5s idle; restore < 250ms from open.
3. History memory bounded (≤100 snapshots) and undo/redo round‑trip consistent.
4. Mirror action round‑trip (mirror→mirror) yields original geometry (id stability for players; new route ids acceptable).
5. Player metadata edits propagate live and are captured in complexity & telemetry.

### 10. Risks & Mitigations

| Risk                               | Impact                         | Mitigation                                      |
| ---------------------------------- | ------------------------------ | ----------------------------------------------- |
| Scope creep before parity polish   | Delays downstream exports      | Freeze P1 list; require RFC for additions       |
| History memory growth              | Perf regressions               | Implement cap early + measure snapshot size     |
| Schema drift (backend not updated) | Data loss / inconsistent saves | Prioritize backend `diagram_v2` field migration |
| Template clutter                   | UX noise                       | Naming + tagging + delete flow in MVP           |
| Thumbnail generation blocking UI   | Jank on save                   | Use OffscreenCanvas or defer to worker          |

### 11. Decommission Status (Legacy MVP)

Status: Legacy component & conditional flag removed; code references purged; draft persistence now V2-only (legacy key read once then ignored); docs updated to remove feature flag instructions.

Follow-ups:

- Remove legacy draft key read path after 2 releases.
- Add migration script if any stored legacy diagrams exist in DB (TBD when backend integration finalizes).

### 12. Operational Metrics (Initial Targets)

| Metric                         | Target (Post-P1) | Rationale                               |
| ------------------------------ | ---------------- | --------------------------------------- |
| Avg. time to first saved play  | < 3 min          | Onboarding effectiveness                |
| Undo/Redo latency              | < 16ms           | Smooth editing experience               |
| Thumbnail generation median    | < 150ms          | Snappy grid visuals                     |
| Multi-select drag/nudge latency| < 24ms frame     | Maintain fluid feedback during bulk ops |
| Draft restore success rate     | > 99%            | Data reliability                        |

### 13. Implementation Notes (Selective)

- History currently snapshot-based; acceptable until memory threshold measured (capture typical snapshot size—estimate pass after cap work).
- Mirror uses width-based x inversion; ensure formations respect chosen hash/ball alignment future.
- Formation application must become idempotent: prevent duplicate players via role + relative slot anchor.
- Complexity scoring pure; keep test harness once route curvature added.

### 14. Change Log (Recent)

| Date       | Change                                                                                                           |
| ---------- | ---------------------------------------------------------------------------------------------------------------- |
| 2025-08-13 | Group drag multi-select, debounced COMMIT_MOVE history snapshots, move group telemetry w/ distance metric |
| 2025-08-13 | Roadmap: Added automatic formation detection & legality assist feature                                      |
| 2025-08-12 | Multi-select (click / box), keyboard nudge, field themes, realistic hashes + sideline hashes, yard numbers, LOS, 11-man seed, palette & outlines, thumbnail utility/button |
| 2025-08-12 | Removed feature flag & legacy MVP editor; unified draft persistence (V2 only)                                    |
| 2025-08-11 | Added mirror, formation apply placeholder, hash selection, LOS & yard markers enhancements                       |
| 2025-08-09 | Added undo/redo & snapping; integrated complexity score computation                                              |
| 2025-08-07 | Multi-segment routing implemented                                                                                |
| 2025-08-05 | Initial V2 shell & basic player/route placement landed                                                           |

---

This unified roadmap supersedes: `DIAGRAM_BUILDER_V2.md` and `PLAYBOOK_COMPETITIVE_ANALYSIS.md`.
