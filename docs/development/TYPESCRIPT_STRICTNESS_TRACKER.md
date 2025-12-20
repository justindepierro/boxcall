# TypeScript Strictness Tracker

Goal: keep TypeScript strictness improvements incremental and durable.

## Current Baseline (enforced)

This project already enforces `strict: true` along with additional hygiene options:

- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `noFallthroughCasesInSwitch: true`
- `noUncheckedSideEffectImports: true`
- `noImplicitOverride: true`

Configs:

- `tsconfig.app.json`
- `tsconfig.node.json`

## Next Candidates (not enabled yet)

These are intentionally not enabled yet because they tend to create larger refactors. When we enable one, we should do it as its own roadmap step with a focused commit.

- `useUnknownInCatchVariables`
- `noImplicitReturns`
- `noUncheckedIndexedAccess`
- `exactOptionalPropertyTypes`
- `noPropertyAccessFromIndexSignature`
