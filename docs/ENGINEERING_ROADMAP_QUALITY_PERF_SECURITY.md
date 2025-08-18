# Engineering Roadmap: Quality, Performance, and Security (12 weeks)

Pinned reference for elevating code quality, speed, and security without blocking feature work. Cadence: 6 sprints (2 weeks each). Keep CI green; ship value every sprint.

## Overview

- Objectives
  - Enforce structure and consistency; remove dead code
  - Optimize bundle size, runtime responsiveness, and caching
  - Harden supply chain, headers, RLS, and data validation
- Success criteria
  - CI stays green; budgets trend in the right direction
  - No developer friction spikes; clear docs and guardrails

---

## Sprint 1 (Weeks 1–2): Foundations & Guardrails

Goals: Enforce structure, kill dead code, and make envs deterministic.

Work

- Module boundaries/import hygiene rules (eslint-plugin-boundaries/import)
- Dead code & dep pruning in CI (knip, ts-prune)
- Typed, validated envs (vite-plugin-validate-env or @t3-oss/env-core + Zod) and ENVIRONMENT.md
- Commit discipline (commitlint) and Changesets scaffold

Outputs

- ESLint rules active; CI fails on boundary/import/unused violations
- Env schema validation gate; docs added
- Conventional commit PR titles; changesets ready (for future DS package)

Acceptance

- CI blocks on boundary/import/unused; dev setup unaffected

---

## Sprint 2 (Weeks 3–4): Security & Supply Chain

Goals: Harden supply chain, secrets, and headers; keep updates small and safe.

Work

- Renovate with pinned ranges and small PRs
- Secrets scanning (Gitleaks) and SAST (Semgrep with JS/React/Supabase rules)
- License scanning in CI
- CSP + modern security headers via deploy config (HSTS, COOP/COEP, Referrer-Policy, Permissions-Policy)
- Subresource Integrity (SRI) for any externals

Outputs

- Renovate PRs flowing; baseline Semgrep rules green
- Deploys send strict headers; SRI enabled where applicable
- CI fails on leaked secrets or insecure deps/licenses

Acceptance

- New builds pass with headers enforced; zero critical SAST/secrets findings

---

## Sprint 3 (Weeks 5–6): Performance – First Wave

Goals: Reduce JS/CSS payloads; keep main thread responsive.

Work

- Bundle size budgets with size-limit; PR comments on diffs
- Code splitting + suspense audit; finish prefetch heuristics (hover + idle, network-gated)
- Offload heavy tasks to Web Workers (PDF/CSV via Comlink)
- Image pipeline (vite-imagetools, srcset, width/height, loading=lazy)
- Font subsetting for WOFF2

Outputs

- Size budgets and analysis artifacts in CI
- Workers for PDF/CSV; improved INP under load
- Smaller images/fonts with measurable bundle savings

Acceptance

- No regressions in LCP/INP; chunk counts increase only where justified

---

## Sprint 4 (Weeks 7–8): Observability & A11y

Goals: Catch issues earlier; ensure accessible UI.

Work

- Lighthouse CI with budgets and trend reports
- Playwright + axe-core a11y checks on key flows (CI gate on critical violations)
- Error boundaries coverage; sourcemaps + Sentry/Supabase logs
- Web Vitals sampling rollout with privacy policy for telemetry payloads

Outputs

- PR comments for Lighthouse deltas
- Critical a11y violations block CI
- Error telemetry tied to releases; sourcemaps uploaded

Acceptance

- A11y checks pass; vitals events sampled with PII-scrubbed payloads

---

## Sprint 5 (Weeks 9–10): Data Integrity & RLS

Goals: Validate data at boundaries and lock down policies.

Work

- Zod schemas for API/row/URL/CSV boundaries with shared parsing utils
- Supabase RLS tests in CI (ephemeral DB) for policies
- Threat modeling + sanitization (DOMPurify) for any user-provided HTML

Outputs

- Runtime guards at boundaries; unified validation utilities
- RLS test suite green; CI blocks on regressions
- Sanitization in rendering/export paths

Acceptance

- Invalid inputs rejected early; no RLS regressions; no XSS vectors

---

## Sprint 6 (Weeks 11–12): Systemization & Polish

Goals: Package the design system; formalize perf/security policies.

Work

- Extract design system to an internal workspace package; Storybook/Ladle; typed props docs; semver
- Dependency allowlist + “no heavy libs” policy gate
- HTTP caching and precompression (br/gzip) verification in production

Outputs

- Versioned DS package with docs
- Policy gates flag large deps; caching headers verified

Acceptance

- DS changes versioned; cache hits confirmed; bundle size stable or smaller

---

## Ongoing (Every Sprint)

- Keep Renovate flowing; prioritize low-risk updates
- Monitor size limits and Lighthouse budgets
- Track and triage SAST/secret scans and license reports

## Dependencies & Sequencing

- Do Sprint 1 before 2–6 (guardrails first)
- Sprint 2 precedes 5 (security posture for policy tests)
- Sprint 3 informs 4 (perf telemetry clarifies budgets)
- Sprint 6 depends on 1 and 4 (lint/tests/docs pipelines in place)

## Quick Start (Week 1 Setup)

- Enable: import/boundaries ESLint, ts-prune/knip, env validation, commitlint
- Add CI jobs: size-limit (soft), SAST + secrets (report), Lighthouse (report-only)
- Document: ENVIRONMENT.md and SECURITY.md (triage + waiver process)

> Tip: Pin this file in your editor for quick reference. In VS Code: right-click the tab → "Pin" or add to the Workspace Trust/Start view per your setup.
