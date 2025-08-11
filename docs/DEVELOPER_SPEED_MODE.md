# Developer Speed Mode

Set `BC_LINT_MODE=relaxed` to temporarily disable or downgrade non-critical lint rules for rapid iteration.

## Usage

```bash
BC_LINT_MODE=relaxed npm run dev
# or
export BC_LINT_MODE=relaxed
npm run dev
```

## What Changes

- Style enforcement rules (custom boxcall-style/*, contrast/no-unsafe-white, raw button) disabled.
- Unused vars become warnings instead of errors.
- React refresh & TypeScript correctness still active.

## Rationale

Accelerate prototyping without deleting rules. CI / default local runs (without the env variable) remain strict.

## Reminder

Always run a strict pass before committing:

```bash
npm run lint && npm run type-check
```

