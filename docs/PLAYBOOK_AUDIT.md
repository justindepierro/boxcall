# Playbook Product Audit & Roadmap

_Date:_ 2025-08-11  
_Scope:_ Playbook UI, data model, workflow, telemetry, performance, and innovation opportunities.

---
## 1. UX & Information Architecture
**Strengths**
- Three-view toggle (Playbook / Practice Script / Game Plan) establishes extensibility.
- Glossary sidebar + Advanced Filters enable structured exploration.
- PlayCard progressive disclosure + workflow CTAs.
- One-word call toggle mirrors real coaching nomenclature.

**Gaps / Opportunities**
- Static access gate: lacks contextual upsell (sample plays, free tier progression).
- Glossary taxonomy is static; no personalization (usage weighting, recency, quick-add custom sets).
- No Saved Views / Smart Lists (e.g. "3rd & Medium", "Red Zone Package").
- AdvancedFilters require manual construction; needs preset templates.
- No density / list mode or virtualization; potential clutter at scale.
- Diagramming buried per card; need global diagram workspace & batch operations.
- Missing quick inline row actions; expansion cost is high.
- Practice / Game Plan views are placeholders → expectation mismatch.
- Lack of onboarding coachmarks for first-time actions (create, categorize, script).

---
## 2. Data Model & Taxonomy
**Current State**
- Plays mapped with many optional fields; category inference done client-side.
- Confidence / usage stats stubbed (constant values) → undermines trust.

**Improvements**
- Add `play_categories` (play_id, primary_category, subcategory, dimensions[]).
- Add `play_versions` (revision history & diagram json).
- Controlled Tag dimensions (concept / personnel / situation) for facets.
- `play_usage_events` to drive real times_called, success metrics.
- Introduce `install_phase` (Base / Week N / Experimental) to guide install planning.

---
## 3. Workflow Coverage
Design → Organize → Practice Script → Game Plan → Call Sheet → Execution Feedback → Optimization.

**Missing Links**
- Practice outcome loop (rep grading, drill success).
- Game plan → call sheet generator.
- Post-game tagging & adjustment suggestions.
- AI / heuristic feedback on underperforming concepts.

---
## 4. Performance & Scalability
**Risks**
- All plays rendered: no virtualization; scaling risk >500 plays.
- Heavy diagramming bundles not lazy enough.
- All filtering client-side (no indexed server query).

**Quick Wins**
- Add virtualization (react-window or react-virtualized) + skeleton rows.
- Code-split VisualPlayBuilder (already chunking PDF libs—extend pattern).
- Cache play queries with React Query; SWR for refresh.
- Server endpoint for query filters (formation, type, category, install_phase).

---
## 5. Collaboration & Access Control
**Needs**
- Role-based subset views (OC/DC/HC).
- Draft vs Published & approval flow.
- Audit log of edits.
- Inline comments / review suggestions (future multi-cursor).

---
## 6. Discoverability, Search & Intelligence
**Next Level**
- Semantic vector search for concept similarity.
- Duplicate detection (embedding clustering).
- Query grammar: `down:3 distance:short formation:Trips`.
- Rule-based recommendations (balance run/pass mix, inside/outside distribution).
- Evolving complexity scoring (multi-axis radar: formation variance, tag entropy, situational coverage).

---
## 7. Analytics & Telemetry Gaps
**Already**: search latency, activation events.

**Add**
- `play:create|edit|duplicate|diagram_updated`
- `filter:apply`, `glossary:navigate`
- `practice_script:add_play`, `gameplan:add_play`
- `view:saved_apply`, `play:bulk_add`
- Derived metrics: time_to_first_diagram, diagram_coverage%, categorized_rate%, saved_view_adoption.

---
## 8. Accessibility, Responsiveness, Offline
- Add `role="tablist"` & ARIA states to view toggle.
- Ensure `aria-expanded` & keyboard focus on expand buttons.
- Contrast review for orange/purple badges.
- Compact density mode for mobile.
- Offline caching (IndexedDB snapshot of last N plays + diagrams) + delta sync.

<!-- Contrast remediation in progress: adjusted yellow quick action button (bg-yellow-500 + white) to darker bg-yellow-600 with dark text for AA compliance. Additional token audit pending. -->

---
## 9. Reliability & Data Integrity
- Add optimistic concurrency (compare `updated_at`).
- Unique slug / normalized key for play naming.
- Server-side validation for core fields and category constraints.

---
## 10. Dev Experience & Maintainability
- Central domain layer for Play (value objects: Formation, Concept, InstallPhase).
- Deterministic filter/search pure function with tests.
- Config-driven enumerations (formation constants, play types) with version metadata.

---
## 11. Roadmap (Prioritized)
| Tier | Item | Effort | Impact |
|------|------|--------|--------|
| Quick (1–2w) | Virtualized PlayGrid | S | H |
| Quick | Code-split VisualPlayBuilder | S | M |
| Quick | Telemetry: play lifecycle + filter events | S | H |
| Quick | Saved Filter Presets (local) | S | M |
| Quick | A11y roles & aria-expanded | XS | M |
| Quick | Density toggle & diagram coverage metric | S | M |
| Medium (3–6w) | Server-side filtering endpoint | M | H |
| Medium | CategoryAssignment + install_phase migration | M | H |
| Medium | Saved Views (server) + sharing | M | H |
| Medium | Rule-based recommendations | M | M |
| Medium | Version history (play_versions) | M | H |
| Medium | Batch ops (multi-select add/tag/install phase) | M | M |
| Strategic (6–18w) | Semantic search & duplicate detection | L | H |
| Strategic | AI assisted play generation | L | H |
| Strategic | Real-time collaborative diagramming | L | H |
| Strategic | Call sheet generator | M | H |
| Strategic | Post-game outcome ingestion & adaptive scoring | L | H |

---
## 12. Data Layer Additions
**Tables**
- `play_versions(play_id, revision, diagram_json, changed_fields, author_id, created_at)`
- `play_categories(play_id, category, subcategory, confidence_score)`
- `play_usage_events(play_id, source, context_id, outcome, ts)`
- `saved_views(user_id, name, filter_json, created_at)`

**Indexes**
- plays(formation, p_type)  
- play_categories(category, subcategory)  
- play_usage_events(play_id, ts DESC)  
- saved_views(user_id)

---
## 13. Telemetry Event Specs
```ts
play:create { playId, source: 'builder', hasDiagram: boolean }
play:edit { playId, fieldsChanged: string[], hasDiagram: boolean }
play:diagram_updated { playId, shapeCount, routeCount, formationHash }
play:bulk_add { count, target: 'practice_script' | 'game_plan' }
filter:apply { activeCount, types: string[] }
view:saved_apply { viewId }
recommendation:shown { ruleId }
recommendation:accept { ruleId }
```
**Key Product Metrics**: time_to_first_diagram, diagram_coverage%, categorized_rate%, saved_view_adoption%, recommendation_accept_rate.

---
## 14. Innovation Concepts
- **Formation Genome**: canonical structural hash → coverage map & similarity.
- **Concept Similarity Heatmap**: embedding 2D map to expose gaps.
- **Adaptive Install Planner**: upcoming opponent profile → recommended install mix.
- **Progressive Confidence Scoring**: recency-weighted performance model.
- **Collaborative Canvas**: multi-user live diagram editing.

---
## 15. Immediate Implementation Slice (Recommended)
**Phase 1 (This Sprint)**
1. Virtualized PlayGrid (react-window) + fallback skeleton. ✅
2. Code-split VisualPlayBuilder (dynamic import). ✅
3. Telemetry events: play:create, play:diagram_updated, filter:apply. ✅ (filter.apply & play.create/diagram updated emitted)
4. Saved Filter Presets (localStorage). ✅ (basic create/apply/delete)
5. Accessibility enhancements (roles, aria-expanded). ✅
6. Diagram coverage metric in Playbook header. ✅ (placeholder %)

**Success Criteria**
- Grid renders <16ms frame on 1k mock plays.
- 90%+ of newly created plays produce a `play:create` event.
- Diagram coverage visible & updates on save.
- At least one saved filter preset persisted across reload.

---
## 16. Open Questions
- Source of truth for install_phase (coach input vs inference)?
- Minimum dataset needed for meaningful recommendations? (target 50+ plays)
- Diagram data structure standardization (vector vs raster export)?

---
## 17. Next Step Choice
Select starting focus: (A) Performance & Telemetry (Phase 1) (B) Data Model Migration (categories/install_phase) (C) Saved Views & Batch Ops foundation.

> Pick A, B, or C (or customize) to proceed with implementation.
