# Migration 010 Counts Snapshot

Timestamp: 2025-08-11T12:17:55.734Z

## Table Row Counts

| Table | Count |
|-------|-------|
| teams | 0 |
| playbooks | 0 |
| plays | 0 |
| practice_scripts | 0 |
| practice_script_plays | 0 |
| game_plans | 0 |
| game_plan_situations | 0 |
| game_plan_plays | 0 |

## Integrity Checks

- Plays referencing non-existent playbook: 0
- Active plays missing duplicate_key: 0

## Notes
- Commit this file with the JSON snapshot before drafting SQL.
- Zero orphan or missing duplicate_key active rows expected before NOT NULL enforcement.

