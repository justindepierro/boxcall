# Telemetry & Events Schema
Status: Draft

## 1. Event Categories
| Category | Examples | Notes |
|---------|----------|-------|
| suggestion | suggestion:shown, suggestion:accept | Search autosuggest lifecycle |
| vitals | vitals:CLS, vitals:INP, vitals:LCP | Core Web Vitals (web-vitals lib) |
| error | error:boundary, error:network | Future grouping + severity |

## 2. Payload Shape
```ts
interface TelemetryEventBase { id: string; name: string; ts: number; session_id: string; }
interface SuggestionShown extends TelemetryEventBase { name: 'suggestion:shown'; query: string; rank: number; fuzzy: boolean; }
interface SuggestionAccept extends TelemetryEventBase { name: 'suggestion:accept'; query: string; rank: number; fuzzy: boolean; }
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
3. Latency buckets (suggestion response time)

---
Update when adding new categories or indexes.
