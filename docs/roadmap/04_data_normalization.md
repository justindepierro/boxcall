# 04. Data & Normalization Deep Dive

(Status: stub – to extract detailed plan from legacy content.)

Goals:

- Central canonical pipeline before DB persistence.
- duplicate_key generation & uniqueness enforcement.
- Retro normalization & diff reporting.

Next Actions:

1. Inventory all current play create/update call sites.
2. Introduce PlaysDomainService wrapper enforcing canonicalize + duplicate key.
3. Draft migration: add nullable duplicate_key column.
4. Backfill script (dry-run reports clusters) before unique index.
5. Retro analyzer producing JSON + markdown diff.

Metrics:

- Variant clusters >1 (baseline vs post-normalization)
- duplicate_key violations count (should stay 0 after index)
