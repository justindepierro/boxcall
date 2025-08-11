# 03 Architecture Snapshot

(Extracted from MASTER_ROADMAP.md Section 2 and related layering sections.)

| Layer         | Current                       | Target Evolution                    | Actions                                  |
| ------------- | ----------------------------- | ----------------------------------- | ---------------------------------------- |
| Frontend      | React + TS + Vite             | Modular domain-driven slices        | Component extraction; enforce boundaries |
| Data Access   | Ad-hoc service objects        | Unified DataService + query hooks   | Introduce adapters + caching matrix      |
| State         | Local + (planned React Query) | React Query + thin view state       | Migrate play/game plan paths             |
| Normalization | Scattered utilities           | Single canonical pipeline           | Integrate canonical functions centrally  |
| Search        | Basic text                    | Weighted + fuzzy assist             | Build search doc & scoring logic         |
| Observability | Console/ad-hoc                | Telemetry events + vitals + tracing | Add lightweight event bus                |
| Security      | Draft RLS                     | Hardened RLS + audit + rate limits  | Review policies, add constraints         |
