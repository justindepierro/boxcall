## Playbook Diagram Platform Unified Roadmap (V2 Implementation + Competitive Positioning)

Updated: 2025-08-14 (post‑legacy removal & modular extraction pass complete – Toolbar, PlayerSidebar, RoutesPanel, CanvasPane, a11y, telemetry sampling; curved routes + thumbnail persistence delivered)
Status Legend: DONE (merged to main), PARTIAL (scaffold or partial UI), TODO (planned / prioritized), FUTURE (later phase / out-of-scope now)

### Current Sprint: 20 UX/Delight Improvements (Intuitive • Easy • Beautiful • Fun)

Scope: fast wins we can land in a day to increase usability, clarity, and delight without large refactors. Each item includes a simple Done definition.

1. [x] Spacebar pan (temporary tool)

- Done: Holding Space temporarily switches to Pan; releasing returns to previous tool; cursor updates.

2. [x] Alt-drag to duplicate selection

- Done: While dragging, holding Alt creates a duplicate of current selection; IDs regenerated; history entry created.

3. [x] Fit/Zoom presets + wheel focal zoom

- Done: Toolbar gets Fit, 100%, 200%; wheel zoom centers on cursor; smooth zoom easing.

4. [x] Quick help overlay (press ?)

- Done: Full-screen shortcut sheet with major tools/gestures; esc closes; first-run shows once with “Don’t show again”.

5. [x] Selection count badge on marquee

- Done: Drag-box shows a small badge with live count; snaps to top-right of marquee.

<!-- Items 6–20 moved to Priority Queue below for focused scheduling -->

Notes:

- All animations respect reduced-motion preference.
- Defaults are subtle and can be toggled in Settings → Accessibility & Effects.

### Priority Queue: Unimplemented (ordered by urgency)

P1

- Field Settings Panel (dedicated panel extraction from toolbar; telemetry for toggles)
- History telemetry: emit undo/redo events alongside cap/trim

P2

- Auto Formation Detection & Legality Assist (7 on LOS / ≤4 backfield; snap + highlight)
- Templates / Stencils MVP (save/apply selected subset; template events)
- Telemetry: selection events (method granularity) and export thumbnail metrics

P3

- Sidebar resize aria-live announcements (polite region)
- Route add/remove burst aggregation (PlayDiagramRouteBurst)
- Player reorder p95 metric in aggregated stats
- QB Progression Overlay (numbered read path markers)
- Offensive Line Technique Shading (gap technique overlay)
- Branding / Export Theming (team colors/logo on exports)
- Defensive templates (roles & color semantics)
- Enhanced analytics (spread/intersections)

From 20-step sprint (re-prioritized)

P1

6. [x] Snap halo + micro-bump animation

- Done: When a point snaps, show a brief glow pulse and slight easing to snap position; toggle in Settings; respects reduced motion.

7. [x] Sticky tooltips with shortcuts

- Done: All palette buttons show labels and shortcut hints on hover/focus; no layout shift; respects user tooltip preference setting.

8. [x] Inline label edit (double‑click player)

- Done: Double‑click a player opens an inline text field; Enter commits, Esc cancels; auto-selects text.

9. [x] Lock indicator and quick toggle

- Done: Locked players show a subtle lock glyph; click toggles; included in multi-select bulk lock.

10. [x] Grid overlay toggle + density

- Done: Keyboard G toggles a dashed percent grid; density follows Snap Grid (1% / 2% / 5%); respects theme colors; pointer‑events off; persisted in localStorage and restored on load.

P2

11. [x] Minimap navigator (corner overview)

- Done: Bottom-right minimap reflects the full field with a live viewport rectangle; click/drag pans the main canvas; auto-hides at 100% zoom; theme-aware and lightweight.

12. [x] Route endpoint affordances

- Done: Larger, contrast-aware endpoint handles; hover/drag shows dotted attach/snap preview to nearest player within threshold; respects theme and reduced-motion.

13. [x] Route/annotation quick style cycle (J/K)

- Done: J cycles stroke width presets (1,2,3,4,6,8); K cycles arrowhead (none/start/end/both). Applies to selected annotation if any, otherwise updates draw defaults; prevents default and is safe during draw/annotate.

14. [x] Contextual HUD for align/distribute

- Done: When multi-selecting ≥3, a small floating HUD near selection offers align (L/C/R, T/M/B) and distribute (H/V) actions; positioned above the selection box; non-interfering with canvas events.

15. [x] Better cursor states per tool

- Done: Pointer, crosshair (draw), hand/grab+grabbing (pan), pen (route via theme-aware SVG cursor), move (drag). High-DPI SVG cursors; player groups no longer force pointer so route pen is visible.

16. [x] Nudge granularity with Alt

- Done: Arrow = 0.5%; Shift+Arrow = 2%; Alt+Arrow = 0.1%; respects bounds; telemetry now includes step and modifier.

P3

17. [x] Confetti-on-first-save (daily)

- Done: First successful save of the day triggers a small confetti burst overlay; daily-gated via localStorage; respects prefers-reduced-motion; dismissible with an inline control to disable permanently via Settings → Effects.

18. [x] Gentle selection pulse

- Done: Selected players and annotations get a subtle, theme-aware breathing outline that respects reduced-motion and adds no pointer interference.

19. [x] Canvas center and edges guide polish

- Done: Center/edge guides fade in/out smoothly (live fade-in + brief fade-out trail); “Center” label appears briefly when snapping to center axes.

20. [x] On-canvas “Press H for help” hint

- Done: Tiny, low-contrast hint in bottom-right fades after ~5s and hides once help is viewed or dismissed; reduced-motion friendly; also opens help with H.

### 1. Vision

Deliver a professional-grade, fast play design & playbook management system that:

- Enables rapid creation & iteration of offensive (and later defensive / ST) plays.
- Produces consistent, high‑fidelity diagram assets (thumbnails, exports, printouts).
- Provides structured metadata & telemetry for analytics (complexity, usage, install readiness).
- Establishes an extensible foundation (formations, templates, motion, animation, collaboration) without accruing legacy drag.

Legacy MVP editor has been decommissioned; V2 is now the single source of truth (legacy /visual directory flagged for removal in chore/repo-cleanup branch).

### 2. Current Product Value vs. Competitors (Condensed Summary)

| Domain             | Key Competitor Strength           | Our Status                                               | Gap Focus                              |
| ------------------ | --------------------------------- | -------------------------------------------------------- | -------------------------------------- |
| Core Editing       | Curved routes, symbols, templates | Solid foundation (multi‑segment, mirror, undo, snapping) | Curves, symbols, templates UI          |
| Library Depth      | Massive pre‑drawn catalog (35k+)  | None yet                                                 | Seed curated sets + tagging            |
| Practice / Prep    | Cards, scripts, wristbands        | Not started                                              | Export engine (cards)                  |
| Media & Enrichment | Video pairing, coaching points    | Notes only                                               | Media attachment model                 |
| Collaboration      | Multi‑user roles, comments        | Basic ownership                                          | RBAC + comments                        |
| Export             | PNG, PDF, batch                   | PNG/SVG exports + thumbnail persisted to cards           | PDF pipeline + batch exports           |
| Mobile / Offline   | Native + offline                  | Web only                                                 | PWA + offline cache                    |
| Analytics          | Internal metrics tooling          | Telemetry base                                           | Enhanced complexity + adoption metrics |

See original detailed competitive matrix (superseded) in prior doc; this table reflects the distilled strategic gaps we will close in sequence.

### 3. Implementation Status (V2 Diagram Builder)

| Capability                                      | Status          | Notes                                                                                                   |
| ----------------------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------- |
| Player placement & dragging                     | DONE            | Snapping enabled; grid resolution supported                                                             |
| Multi‑segment route drawing                     | DONE            | Straight line segments; double‑click commit                                                             |
| Multi‑selection + keyboard nudge                | DONE            | Shift/Meta toggle, drag box, arrow move (0.5% / 2% w/ Shift)                                            |
| Group drag multi‑selection                      | DONE (new)      | Drag any selected moves all; centroid distance telemetry                                                |
| Player outline & curated color palette          | DONE (baseline) | 12 color palette + optional outlineColor + auto contrast                                                |
| Field themes (classic / mono‑light / mono‑dark) | DONE            | Themed background + adaptive hash/number colors                                                         |
| Realistic hashes + sideline hashes              | DONE            | HS/College/NFL spacing, widened, added sideline markers                                                 |
| Yard numbers rotation & placement               | DONE            | Split digits, correct 9 yd (27 ft) from sideline, rotated ±90°                                          |
| LOS bar customization (dark green @ yard)       | DONE            | Configurable losYards marker                                                                            |
| 11‑man default 2x2 formation seed               | DONE            | Accurate relative depths (QB shallow, RB deeper)                                                        |
| Undo / Redo history                             | DONE            | Needs cap + per‑action telemetry                                                                        |
| Complexity scoring                              | DONE            | Basic heuristic; extend later                                                                           |
| Zoom & Pan                                      | DONE            | Wheel + drag; add preset zoom shortcuts later                                                           |
| Autosave / Restore (draft)                      | DONE            | V2 only; legacy key soft‑retired (still read once)                                                      |
| Mirror (flip) play                              | DONE            | Reducer action + telemetry enriched (before/after spread/center metrics)                                |
| Ball hash selection & field hashes              | DONE (baseline) | Hash toggle + center reposition                                                                         |
| Formation apply (library)                       | DONE            | Library of 5 presets with idempotent apply (no duplicates)                                              |
| Automatic formation detection & legality assist | FUTURE          | Auto grid snap to legal alignment (7 on LOS, ≤4 backfield), highlight violations                        |
| Player metadata panel                           | DONE            | Grouped headers, inline color & outline pickers, bulk edit (roles/color/outline), drag & button reorder |
| Route list & deletion                           | DONE            | Per‑route removal                                                                                       |
| Field settings panel (consolidated controls)    | DONE            | Theme/hash/snap/formation/mirror + red zone toggle consolidated                                         |
| Field settings controls (in-toolbar baseline)   | DONE (baseline) | Theme/hash/snap/hash layout + mirror + formation + red zone toggle present (needs dedicated panel UX)   |
| History size bound                              | DONE            | 100 snapshot cap with trim telemetry                                                                    |
| Group move history commit (COMMIT_MOVE)         | DONE            | Debounced commit + drag commit snapshot                                                                 |
| Thumbnail export (PNG)                          | DONE            | Full-frame export wired; persisted to plays.diagram_url and rendered on PlayCard                        |
| Red zone field slice toggle                     | DONE            | Highlight overlay + slice switch (25yd view) w/ restore + telemetry                                     |
| Red zone field slice toggle                     | DONE            | Highlight overlay + slice switch (25yd view) w/ restore + telemetry                                     |
| Discard changes modal (custom)                  | DONE            | Replaced window.confirm with accessible modal + focus trap                                              |
| Keyboard-accessible sidebar resize              | DONE            | Separator now focusable ( Home / End / Arrow adjust + aria values )                                     |
| Nudge telemetry sampling & batch aggregation    | DONE            | Individual (sampled 20%) + 1.5s batch event                                                             |
| Curved / editable segments                      | DONE            | Quadratic segments + control handles; route mode toggle; preview supports curves                        |
| Motion tool                                     | FUTURE (spec)   | Distinct style + timing metadata                                                                        |
| Templates / Stencils                            | FUTURE (spec)   | Serialize selected subset + placement offset (elevated)                                                 |
| QB progression overlay                          | FUTURE          | Numbered read path markers (1‑2‑3)                                                                      |
| Offensive line technique shading                | FUTURE          | Click-through technique shading for OL gaps                                                             |
| Branding / export theming                       | FUTURE          | Team colors & logo injection on exports                                                                 |
| Defensive templates                             | FUTURE          | Extend player roles & color semantics                                                                   |
| Enhanced analytics (spread / intersections)     | FUTURE          | Build after route richness increases                                                                    |

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

- PlayDiagramPlayerAdd / Remove / Update
- PlayDiagramRouteAdd / Delete (implicit via updated)
- PlayDiagramUpdated
- PlayDiagramBallHash
- PlayDiagramFieldTheme
- PlayDiagramMirror (enriched spread metrics)
- PlayDiagramFormationApply (prototype)
- PlayDiagramPlayerReorder (per drag / button)
- PlayDiagramPlayerReorderStats (aggregated avg / max / listHeight)
- PlayDiagramPlayerBulkEdit
- PlayDiagramRedZoneToggle
- PlayDiagramNudge (sampled ~20%)
- PlayDiagramNudgeBatch (aggregated window)

Planned (next sprint additions / refinements):

- PlayDiagramHistory { action, index, length } (PARTIAL now – cap trim done; add undo/redo emit)
- PlayDiagramFlagToggle (field toggles consolidated; wire explicit flag event)
- PlayDiagramExportThumbnail { w, h, durationMs } (prototype button emits; add persistence context)
- PlayDiagramSelection (method: click/box/shift/meta, count, multi)
- PlayDiagramMoveGroup (count, mode, dist)
- PlayDiagramProgressionDefine { count }
- PlayDiagramOLShadingToggle { technique, enabled }
- PlayDiagramFormationLegality { valid, losCount, backfieldCount }
- PlayDiagramTemplateApply { templateId }
- PlayDiagramRouteBurst { added, removed, windowMs } (aggregation)

Telemetry Gaps (post recent enrichments):

- Add 95th percentile for reorder duration (have avg/max)
- Route add/remove burst aggregation (planned PlayDiagramRouteBurst)
- Selection event emission (method granularity)
- History undo/redo emit (currently only cap/trim tracked)
- Formation apply success / duplicate-skip metrics

### 7. Near-Term Priority Backlog (Next 4–6 Weeks)

Refactor / Cleanup Track (phase 1 complete – additional polish queued):

| Priority | Task                                      | Effort | Definition of Done                             |
| -------- | ----------------------------------------- | ------ | ---------------------------------------------- | --------------------------------------------------------------- |
| P1       | Remove legacy /visual directory           | 0.25d  | DONE (legacy files deleted; docs updated)      |
| P1       | Extract Toolbar from VisualPlayBuilderV2  | 0.5d   | Toolbar.tsx; no functional diff                |
| P1       | Extract PlayerSidebar component           | 1d     | PlayerSidebar.tsx; grouping & bulk edit intact |
| P2       | Extract RoutesPanel                       | 0.5d   | RoutesPanel.tsx isolated                       |
| P2       | Extract CanvasPane (Field wrapper)        | 0.5d   | DONE (CanvasPane.tsx with CaptureSvgRef)       |
| P2       | Add accessibility focus trap to modal     | 0.5d   | Tab cycling contained; escape preserved        |
| P3       | Component tests / stories                 | 1d     | Visual regression + interaction smoke tests    |
| Priority | Task                                      | Effort | Status                                         | Definition of Done / Notes                                      |
| -------- | ----------------------------------------- | ------ | -------                                        | --------------------------------------------------------------- |
| P1       | Remove legacy /visual directory           | 0.25d  | DONE                                           | Legacy files deleted; roadmap & doc updated                     |
| P1       | Extract Toolbar                           | 0.5d   | DONE                                           | Toolbar.tsx                                                     |
| P1       | Extract PlayerSidebar                     | 1d     | DONE                                           | PlayerSidebar.tsx (grouping, bulk edit, reorder telemetry)      |
| P2       | Extract RoutesPanel                       | 0.5d   | DONE                                           | RoutesPanel.tsx isolated                                        |
| P2       | Extract CanvasPane (Field wrapper)        | 0.5d   | DONE                                           | CanvasPane.tsx + CaptureSvgRef                                  |
| P2       | Add accessibility focus trap (modal)      | 0.5d   | DONE                                           | Discard modal traps focus & ESC closes                          |
| P2       | Keyboard resize handle (sidebar)          | 0.25d  | DONE                                           | Arrow/Home/End + aria-valuenow                                  |
| P2       | Nudge telemetry sampling & batch          | 0.5d   | DONE                                           | PlayDiagramNudge / NudgeBatch events                            |
| P3       | Component smoke tests (core)              | 0.5d   | PARTIAL                                        | Toolbar & PlayerSidebar tests; expand RoutesPanel next          |
| P3       | Field Settings standalone panel           | 1d     | TODO                                           | Move theme/hash/snap/mirror/formation/red zone out of toolbar   |
| P3       | Sidebar resize aria-live announcements    | 0.25d  | TODO                                           | Polite region announcing new width                              |
| P3       | Player reorder p95 metric                 | 0.25d  | TODO                                           | Compute per flush & emit in stats event                         |
| P3       | Route add/remove burst aggregation        | 0.5d   | TODO                                           | Windowed event PlayDiagramRouteBurst                            |

Feature Track:

| Priority | Feature                                 | Effort (est) | Definition of Done                                                                  |
| -------- | --------------------------------------- | ------------ | ----------------------------------------------------------------------------------- |
| P1       | Player Metadata Panel                   | 2d           | Edit labels/roles/colors, delete player, telemetry hooks                            |
| P1       | Field Settings Panel                    | 1.5d         | Move theme/hash/snap + red zone toggle, telemetry                                   |
| P1       | Field Settings Panel                    | 1.5d         | TODO (currently inline in Toolbar; extract dedicated panel)                         |
| P1       | History Cap + Telemetry                 | 0.5d         | Ring buffer (100), emits diagram_history events                                     |
| P1       | History Cap + Telemetry                 | 0.5d         | DONE (cap & trim). TODO: add undo/redo emit                                         |
| P1       | Red Zone Field Slice Toggle             | 0.5d         | Midfield ↔ red zone switch & red line, telemetry                                   |
| P1       | Red Zone Field Slice Toggle             | 0.5d         | DONE: slice toggle + overlay + telemetry                                            |
| P2       | Thumbnail Export + PlayCard Integration | 2d           | PNG stored + displayed; export event logged (button done)                           |
| P2       | Thumbnail Export + PlayCard Integration | 2d           | DONE: thumbnail generated on save, stored in diagram_url, and displayed in PlayCard |
| P2       | Mirror Telemetry & UI Polish            | 0.5d         | Spread metrics DONE; button clarity TBD                                             |
| P2       | Mirror Telemetry & UI Polish            | 0.5d         | DONE (spread metrics). UI label iteration TBD                                       |
| P2       | Formation Library (5–8 presets)         | 2d           | DONE: 5 presets implemented with idempotent apply + telemetry                       |
| P2       | Auto Formation Detection & Snap         | 2.5d         | Classify LOS/backfield, enforce 7 LOS / ≤4 backfield, snap                          |
| P2       | Curved Route Segments                   | 4d           | DONE: quadratic segments + control point handles + mode toggle                      |
| P2       | Templates / Stencils MVP                | 3d           | Save/apply subset; template events                                                  |
| P2       | Mirror Telemetry & UI Polish            | 0.5d         | Spread metrics DONE; button clarity TBD                                             |
| P3       | QB Progression Overlay                  | 1.5d         | Numbered read path markers + telemetry                                              |
| P3       | Offensive Line Technique Shading        | 1d           | Technique shading toggle + telemetry                                                |
| P3       | Branding / Export Theming               | 2d           | Team colors/logo on exports                                                         |
| P3       | Player / Route Color Picker UI          | 1d           | Integrated into metadata panel                                                      |

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

| Metric                          | Target (Post-P1) | Rationale                               |
| ------------------------------- | ---------------- | --------------------------------------- |
| Avg. time to first saved play   | < 3 min          | Onboarding effectiveness                |
| Undo/Redo latency               | < 16ms           | Smooth editing experience               |
| Thumbnail generation median     | < 150ms          | Snappy grid visuals                     |
| Multi-select drag/nudge latency | < 24ms frame     | Maintain fluid feedback during bulk ops |
| Draft restore success rate      | > 99%            | Data reliability                        |

### 13. Implementation Notes (Selective)

- History currently snapshot-based; acceptable until memory threshold measured (capture typical snapshot size—estimate pass after cap work).
- Mirror uses width-based x inversion; ensure formations respect chosen hash/ball alignment future.
- Formation application must become idempotent: prevent duplicate players via role + relative slot anchor.
- Complexity scoring pure; keep test harness once route curvature added.

### 14. Change Log (Recent)

| Date       | Change                                                                                                                                                                     |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2025-08-13 | Group drag multi-select, debounced COMMIT_MOVE history snapshots, move group telemetry w/ distance metric                                                                  |
| 2025-08-13 | Curved routes implemented (quadratic segments with control handles and mode toggle); preview and editing handles added                                                     |
| 2025-08-13 | Full-size PNG/SVG export wired via Toolbar; thumbnail generation persisted on save and rendered in PlayCard (plays.diagram_url)                                            |
| 2025-08-13 | Formation library (5 presets) added with idempotent apply to avoid duplicates; toolbar selector integrated                                                                 |
| 2025-08-13 | Legacy /visual directory removed; a11y focus trap & keyboard resize added; nudge sampling + batch telemetry; CanvasPane extraction                                         |
| 2025-08-13 | Group drag multi-select, debounced COMMIT_MOVE history snapshots, move group telemetry w/ distance metric                                                                  |
| 2025-08-13 | Roadmap: Added automatic formation detection & legality assist feature                                                                                                     |
| 2025-08-13 | Roadmap reprioritized (curved routes & templates elevated; added red zone toggle, progressions, OL shading, branding, legality telemetry events)                           |
| 2025-08-13 | Player panel enhancements: reorder (buttons + drag), delete confirmation, history cap telemetry, red zone slice switching                                                  |
| 2025-08-13 | Telemetry: player reorder (adjacent & drag) + bulk edit events wired                                                                                                       |
| 2025-08-12 | Multi-select (click / box), keyboard nudge, field themes, realistic hashes + sideline hashes, yard numbers, LOS, 11-man seed, palette & outlines, thumbnail utility/button |
| 2025-08-12 | Removed feature flag & legacy MVP editor; unified draft persistence (V2 only)                                                                                              |
| 2025-08-11 | Added mirror, formation apply placeholder, hash selection, LOS & yard markers enhancements                                                                                 |
| 2025-08-09 | Added undo/redo & snapping; integrated complexity score computation                                                                                                        |
| 2025-08-07 | Multi-segment routing implemented                                                                                                                                          |
| 2025-08-05 | Initial V2 shell & basic player/route placement landed                                                                                                                     |

---

This unified roadmap supersedes: `DIAGRAM_BUILDER_V2.md` and `PLAYBOOK_COMPETITIVE_ANALYSIS.md`.

### 15. Imminent Polish Queue (Next Pass)

| Item                                    | Status  | Notes / Acceptance                                                                             |
| --------------------------------------- | ------- | ---------------------------------------------------------------------------------------------- |
| Inline color picker (player color)      | DONE    | Native input[type=color] integrated alongside palette select                                   |
| Inline outline color picker             | DONE    | Color input + select; Auto option retained                                                     |
| Role grouping headers (QB / Skill / OL) | DONE    | Implemented grouped rendering with headers + drag reorder                                      |
| Keyboard Delete (selected players)      | DONE    | Global key listener triggers single or bulk confirm flows w/ telemetry                         |
| Multi-select role bulk set UX refine    | DONE    | Mixed role summary + inline bulk color/outline + role apply                                    |
| Drag reorder performance measure        | DONE    | Per-drag duration + aggregated avg/max + list height stats (rolling window + flush on unmount) |
| Auto contrast outline helper            | FUTURE  | Suggest outlineColor based on fill luminance                                                   |
| Formation apply idempotency             | PARTIAL | trips-right implementation: idempotent apply (create/update/remove duplicates)                 |

### 16. Tomorrow Sprint: 20 UX/Delight Improvements (Intuitive • Easy • Beautiful • Fun)

Scope: fast wins we can land in a day to increase usability, clarity, and delight without large refactors. Each item includes a simple Done definition.

1. [x] Spacebar pan (temporary tool)

- Done: Holding Space temporarily switches to Pan; releasing returns to previous tool; cursor updates.

2. [x] Alt-drag to duplicate selection

- Done: While dragging, holding Alt creates a duplicate of current selection; IDs regenerated; history entry created.

3. [x] Fit/Zoom presets + wheel focal zoom

- Done: Toolbar gets Fit, 100%, 200%; wheel zoom centers on cursor; smooth zoom easing.

4. [x] Quick help overlay (press ?)

- Done: Full-screen shortcut sheet with major tools/gestures; esc closes; first-run shows once with “Don’t show again”.

5. [x] Selection count badge on marquee

- Done: Drag-box shows a small badge with live count; snaps to top-right of marquee.

6. [ ] Snap halo + micro-bump animation

- Done: When a point snaps, show a brief glow pulse and slight easing to snap position; toggle in Settings.

7. [ ] Sticky tooltips with shortcuts

- Done: All palette buttons show labels and shortcut hints on hover/focus; no layout shift.

8. [ ] Inline label edit (double‑click player)

- Done: Double‑click a player opens an inline text field; Enter commits, Esc cancels; auto-selects text.

9. [ ] Lock indicator and quick toggle

- Done: Locked players show a subtle lock glyph; click toggles; included in multi-select bulk lock.

10. [ ] Grid overlay toggle + density

- Done: Keyboard G toggles grid overlay; small density selector (1%, 2%, 5%); persists per session.

11. [ ] Minimap navigator (corner overview)

- Done: Optional mini-map at bottom-right; drag the viewport rectangle; hides when fully zoomed out.

12. [ ] Route endpoint affordances

- Done: Larger, contrast-aware handles; hover shows attach/snap targets with dotted preview.

13. [ ] Route/annotation quick style cycle (J/K)

- Done: J cycles through stroke widths; K cycles arrowhead (none/start/end/both); emits style update.

14. [ ] Contextual HUD for align/distribute

- Done: When multi-selecting ≥3, a small floating HUD near selection offers align/distribute actions.

15. [ ] Better cursor states per tool

- Done: Pointer, crosshair (draw), hand (pan), pen (route), move (drag); high-DPI SVG cursors.

16. [ ] Nudge granularity with Alt

- Done: Arrow = 0.5%; Shift+Arrow = 2%; Alt+Arrow = 0.1%; respects bounds; telemetry notes granularity.

17. [ ] Confetti-on-first-save (daily)

- Done: First successful save of the day triggers a small confetti burst; can be disabled in Settings.

18. [ ] Gentle selection pulse

- Done: Selected items get a very subtle breathing outline to aid tracking without visual noise.

19. [ ] Canvas center and edges guide polish

- Done: Center/edge guides fade in/out smoothly; label “Center” appears briefly when snapping.

20. [ ] On-canvas “Press H for help” hint

- Done: Tiny, low-contrast hint in bottom-right fades after 5s and hides once help viewed.

Notes:

- All animations respect reduced-motion preference.
- Defaults are subtle and can be toggled in Settings → Accessibility & Effects.
