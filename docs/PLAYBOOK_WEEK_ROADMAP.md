# Playbook Week Roadmap (Aug 11–17, 2025)

Purpose: Accelerate the Playbook module from "solid refactor" to the best-in-class organizer + creator for coaches. This is an execution-focused 7‑day roadmap with 20 concrete, sequential steps. Each step lists Goal, Rationale, Success Criteria, and Dependencies.

---

## Guiding Principles

- Speed to value: Coaches should add / find / act on a play in < 5 seconds.
- Professional polish: Zero alert()s, consistent toasts, accessible components, smooth micro-interactions.
- Structured knowledge: Plays richly categorized (formation, tags, personnel, situations) with preset views.
- Trust & safety: Data loss impossible during creation; destructive actions confirm + recoverable.
- Insight & motivation: Progress, complexity, streaks and achievements reinforce usage.
- Extensibility: Each new capability isolated behind a service / hook / context boundary.

---

## Current Snapshot (Baseline)

- ✅ Refactored monolith into header, actions bar, view tabs, context-managed state.
- ✅ Alerts replaced with toasts (initial pass).
- ✅ Step 1 (Confirm Dialog + Undo for bulk delete) implemented (ConfirmProvider + UndoQueue; timed undo restore).
- ✅ Step 2 (PlayGrid: skeleton loaders, differentiated empty states, error retry + refresh).
- ✅ Step 3 (Autosave + draft recovery: debounced localStorage, restore banner, clear + telemetry events).
- ✅ Step 4 (Domain error mapper scaffold + integrated error→toast + telemetry for core actions).
- ❌ Diagram tool still placeholder; coverage metric still synthetic.
- ❌ Preset UX minimal (no grouping / sharing yet).
- ❌ No tagging assistant or batch tagging workflow.
- ❌ Complexity metrics static (hard‑coded examples only).

---

## Progress Update (Aug 12, 2025 - Evening)

Completed:

- Step 1: Confirm + Undo baseline (dialog + undo queue) ✅
- Step 2: PlayGrid skeleton, contextual empty states, retryable error block ✅
- Step 3: PlayBuilder autosave & draft recovery (debounced 1.2s, visibility flush, restore banner, clear draft) ✅
- Step 4: DomainErrorMapper scaffold + mapped save/add/export/create flows to uniform toasts & telemetry ✅

Phase 2 Progress:

- Step 5: Active filter chips (removable + clear-all + telemetry events) ✅

Upcoming:

- Step 6: Preset grouping (Recent, Cloud, Local) data shaping.
- Step 7: Bulk Tagging modal scaffold (data model + placeholder apply logic).
- Step 8: Export submenu (Selected / Current View / All) refinement.

Planned Adjustments (no scope change):

- Add undo telemetry events (DeleteInitiated/Undone/Committed) with unified schema (defer until Step 18 to avoid churn).
- Introduce play diagram presence flag into autosave finalize event once diagram MVP lands (Step 9).

Risk Notes / New:

- Undo: still limited to simple archive/restore; add exclusion guard for concurrent deletes (pending quick follow-up).
- Autosave storage growth: single draft key only (OK for now); multi-draft cleanup needed if edit mode adds version history (Step 14 linkage).

Immediate Focus (Next):

1. Restructure preset menu (group sections + recent list logic). (Step 6)
2. Bulk Tagging modal skeleton (UI + multi-select stub, no backend persistence yet). (Step 7)
3. Export submenu (current filters slice) + consistent filename convention. (Step 8)

---

## 20-Step Execution Plan (This Week)

### Phase 1: UX Foundation & Reliability (Day 1–2)

1. Replace confirm() with Reusable Confirm / Undo Pattern  
   Goal: Introduce `<ConfirmDialog />` + toast-based undo for deletions.  
   Rationale: Modern, forgiving UX; reduces fear of deletion.  
   Success: Bulk delete uses dialog; on delete success a toast offers Undo (restores via cached payload).  
   Dependencies: none.
2. PlayGrid Empty / Skeleton / Error States  
   Goal: Distinct states for: loading, no results (filters), totally empty (CTA), error retry.  
   Rationale: Coaches know what to do next instantly.  
   Success: Visual QA shows four states; CLS-free skeleton.  
   Dependencies: Step 1 optional.
3. Autosave + Draft Recovery in Play Builder  
   Goal: Local (IndexedDB or localStorage) diff sync every 2s or on blur.  
   Rationale: Prevent loss during browser crash / tab close.  
   Success: Refresh mid-creation and draft resurrects; clearing on successful save.  
   Dependencies: none.
4. Error Boundary + Toast Bridge for Play Creation / Bulk APIs  
   Goal: Centralize API exception → typed domain error → user message.  
   Rationale: Consistent language, analytics tagging.  
   Success: 100% of Playbook errors funneled through `DomainErrorMapper` producing uniform telemetry event.

### Phase 2: Power Organizer Enhancements (Day 2–3)

5. Advanced Filter Tokens & Quick Filter Chips  
   Goal: Visual chips for active filters with x-remove; keyboard-add via omni search.  
   Rationale: Reduce friction toggling context views.  
   Success: Add / remove formation filter without opening drawer; ARIA label coverage.
6. Saved View Preset Improvements (Grouping & Recent)  
   Goal: Categorize presets: Recent (5), My Cloud, Local (legacy), Shared (placeholder).  
   Rationale: Scale beyond flat list.  
   Success: Dropdown groups; telemetry for apply origin.
7. Bulk Tagging Workflow Modal  
   Goal: Select plays → "Add Tags" → searchable multi-select + preview count.  
   Rationale: Tag normalization increases retrieval quality.  
   Success: Adds tags to all selected; toast summarizing (# new tags, duplicates ignored).
8. Batch Export Enhancements (Filter → CSV / PDF stub)  
   Goal: Export respects active filters even w/o selection; unify naming & file metadata.  
   Rationale: Coaches often want current slice.  
   Success: Export button offers submenu: Selected / Current View / All.

### Phase 3: Creation Excellence (Day 3–4)

9. Diagram Maker Placeholder → MVP Canvas Integration  
   Goal: Embed a lightweight SVG / Fabric.js canvas to sketch route lines + player markers.  
   Rationale: Visual assets raise retention & complexity scoring.  
   Success: Save diagram JSON + generated PNG thumbnail linked to play record.
10. Complexity Metrics Engine (Dynamic)  
    Goal: Compute metrics from diagram JSON + play metadata.  
    Rationale: Authentic feedback loop (not hard-coded).  
    Success: Score updates live while editing; persists on save; badges thresholded.
11. Achievement & Streak Refinement  
    Goal: Distinguish creation vs edit; daily creation mark; add next milestone progress ring.  
    Rationale: Sustained engagement.  
    Success: Streak increments only once/day; next milestone ring % accurate.
12. Smart Tag Suggestions  
    Goal: Suggest tags from formation / routes / personnel via heuristic extraction (later ML).  
    Rationale: Lowers tagging friction.  
    Success: Accepting suggestion adds tag; 30%+ acceptance in dogfood.

### Phase 4: Collaboration & Sharing Seeds (Day 4–5)

13. Shareable Cloud Presets (Private Beta Flag)  
    Goal: Allow marking a server preset as shareable (team scope).  
    Rationale: Coaches align on common situational views.  
    Success: Toggle + team-scoped retrieval; non-owner read-only.
14. Play Version History (Lightweight)  
    Goal: Store prior JSON snapshots (max 5) on save; restore option.  
    Rationale: Safe experimentation.  
    Success: "History" button lists timestamps; restore rehydrates builder.
15. Inline Comment / Coach Notes Stub  
    Goal: Add per-play notes panel with future multi-user stub.  
    Rationale: Lays foundation for collaboration.  
    Success: Notes saved, reflected immediately; design isolates future threading.

### Phase 5: Performance, Polish, Analytics (Day 5–6)

16. Virtualized PlayGrid & Select Manager Hook  
    Goal: Replace existing list with react-virtualized / auto-sizer; selection decoupled.  
    Rationale: Scale to thousands with <50ms interactions.  
    Success: 2k mock plays scroll at 60fps in dev hardware; memory stable.
17. Code Split & Idle Prefetch (Builder / Import / Diagram)  
    Goal: Dynamic import heavy modals; prefetch on hover.  
    Rationale: Faster initial paint.  
    Success: Bundle stats: initial JS -15% vs baseline; no regression in Lighthouse TTI.
18. Unified Telemetry Schema for Playbook  
    Goal: Document & enforce event naming + required fields.  
    Rationale: Reliable product insight & experimentation readiness.  
    Success: Schema doc + runtime validator; 100% events pass.
19. Accessibility & Keyboard Audit  
    Goal: Tab order, ARIA roles, focus rings, escape to close modals.  
    Rationale: Inclusivity & professional standard.  
    Success: Axe scan: 0 critical / serious; manual keyboard pass list.

### Phase 6: Stretch / Nice-to-Have (Day 6–7)

20. AI Assist Pilot (Tag & Route Description Generator)  
    Goal: Generate draft description + situational recommendation given play metadata + diagram JSON (local mock or optional remote if allowed).  
    Rationale: Differentiation; speeds documentation.  
    Success: Button produces draft in under 2s (mock); acceptance editing tracked.

---

## Cross-Cutting Supporting Tasks

- Refactor: Extract `usePlaybookPresets` and `useBulkPlayActions` hooks (reused by toolbar & future contexts) – align with Steps 5–8.
- Testing: Add unit tests for reducer actions; integration test for autosave & undo delete.
- Documentation: Update `API.md` & `ARCHITECTURE.md` with diagram data model + complexity pipeline.
- Security: Sanitize diagram JSON & notes input (prevent script injection in SVG export).

---

## Risk & Mitigation

| Risk                                | Impact                       | Mitigation                                                         |
| ----------------------------------- | ---------------------------- | ------------------------------------------------------------------ |
| Diagram MVP over-scope              | Delays downstream steps      | Limit to lines + draggable circles; no advanced snapping this week |
| Complexity calc performance         | UI jank on large diagrams    | Debounce + worker offload if > N elements                          |
| Undo delete data race               | Data inconsistency           | Queue with TTL; block new delete on same IDs during undo window    |
| Autosave conflicts with manual save | Duplicate writes / confusion | Merge strategy: last-write-wins + visible "Draft saved" timestamp  |

---

## Success Snapshot by End of Week

- Coach can: Create play with diagram, see live complexity score + autosave, bulk tag & export, apply organized preset views, undo a deletion, restore prior version, and share a view with team.
- Metrics visible: Plays created, next milestone progress, complexity distribution, streak.
- Performance: Initial load lighter, large grid scroll snappy.
- Quality: 0 critical a11y issues, consistent toasts, robust error mapping.

---

## Immediate Next Actions (Tomorrow Morning)

1. Scaffold ConfirmDialog + Undo queue (Step 1).
2. Implement Empty / Loading skeleton variants in `PlayGrid` (Step 2).
3. Draft reducer additions for version history & autosave metadata (support Steps 3 & 14).

Let's execute.
