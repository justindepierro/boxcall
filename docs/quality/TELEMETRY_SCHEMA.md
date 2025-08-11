# Telemetry & Events Schema

Status: Draft

## 1. Event Categories

| Category   | Examples                                                                                                                                             | Notes                                |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| suggestion | suggestion:shown, suggestion:accept                                                                                                                  | Search autosuggest lifecycle         |
| vitals     | vital:cls, vital:inp, vital:lcp, vital:fcp, vital:ttfb                                                                                               | Core Web Vitals (web-vitals lib)     |
| search     | search:query, search:error                                                                                                                           | Structured latency + outcome metrics |
| activation | activation:first_play, activation:first_practice, activation:first_script_export, activation:checklist_step_complete, activation:checklist_completed | Onboarding & activation funnel       |
| error      | error:boundary, error:network                                                                                                                        | Future grouping + severity           |

## 2. Payload Shape

```ts
interface TelemetryEventBase {
  id: string;
  name: string;
  ts: number;
  session_id: string;
```

interface SuggestionShown extends TelemetryEventBase { /_ ... _/ }
interface SuggestionAccept extends TelemetryEventBase { /_ ... _/ }

interface SearchQueryEvent {
name: "search:query";
query: string;
count: number; // number of results returned
usedFuzzy: boolean; // whether fuzzy fallback executed
ftDurationMs: number; // full-text phase duration
fuzzyDurationMs?: number | null; // fuzzy phase duration if executed
totalDurationMs: number; // total end-to-end duration
}
interface SearchErrorEvent {
name: "search:error";
query: string;
message: string; // error message
ftDurationMs: number; // time spent before error surfaced
fuzzyTried: boolean; // whether we attempted fuzzy before failing
totalDurationMs: number;
}
interface ActivationFirstPlayEvent {
name: 'activation:first_play';
playId?: string;
timeFromSignupMs: number; // ms from local signup/start marker
}
interface ActivationFirstPracticeEvent {
name: 'activation:first_practice';
scheduleId?: string;
timeFromSignupMs: number;
}
interface ActivationFirstScriptExportEvent {
name: 'activation:first_script_export';
filename?: string;
timeFromSignupMs: number;
}
interface ActivationChecklistStepCompleteEvent {
name: 'activation:checklist_step_complete';
stepId: 'team' | 'first_play' | 'first_practice' | 'first_script_export';
}
interface ActivationChecklistCompletedEvent {
name: 'activation:checklist_completed';
totalMs: number; // ms from startedAt to completion
}

```

## 3. Storage (Supabase)

Table: events
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | client generated |
| name | text | event type |
| ts | timestamptz | indexed desc |
| session_id | text | session partition |
| payload | jsonb | arbitrary details |

Indexes: (name, ts DESC), (ts DESC)

## 4. Aggregation Scripts

- scripts/events_report.ts (acceptance rate, vitals percentiles)
- (Planned) scripts/inp_gate.ts (INP regression guard)

## 5. Roadmap

1. Error grouping & severity taxonomy
2. Search blend scoring metrics (rank vs similarity usage)
3. Latency buckets (suggestion response time) – IMPLEMENTED via search:query durations
4. Add percentile aggregation scripts for search latency

---

Update when adding new categories or indexes.
```
