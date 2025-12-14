# Contributing to BoxCall

This project uses a strict quality & documentation policy to keep the codebase lean, discoverable, and production-ready.

## Documentation Policy

- Hard limit: **≤300 lines per Markdown file** (enforced by `npm run docs:validate`).
- Every doc must have a single H1 (`# Title`) on the first non-empty line.
- Empty or placeholder docs must include: `<!-- allow-empty -->` at top and a short purpose line.
- Long-form reference files (schema dumps, generated inventories) must include the `<!-- allow-empty -->` marker.
- To archive a large legacy doc: replace body with a concise summary + recovery commands:
  ```
  git log --follow -- docs/FILE.md
  git show <commit>:docs/FILE.md > /tmp/FILE_legacy.md
  ```

## Commit Conventions

Use conventional commits:

- `feat(scope): summary` – user-facing feature
- `fix(scope): summary` – bug fix
- `docs(scope): summary` – documentation only
- `chore(scope): summary` – tooling / maintenance
- `refactor(scope): summary` – non-behavioral code improvement
- `test(scope): summary` – tests only
- `perf(scope): summary` – performance improvement

Examples:

```
feat(search): add fuzzy trigram fallback
chore(docs): archive legacy component system doc
```

## Branching Model

- `main` – always deployable.
- Feature: `feat/<short-name>`
- Fix: `fix/<short-name>`
- Chore/cleanup: `chore/<short-name>`
- Refactor: `refactor/<short-name>`

Open PRs early; keep them < ~400 lines diff when possible.

## Project Structure

BoxCall maintains an industry-leading project structure optimized for team scaling:

### Root Directory

```
boxcall/
├── docs/                    # Documentation (organized by topic)
├── src/                     # Source code
├── scripts/                 # Build and automation scripts
│   ├── cli/                 # CLI tools (db-cli, migrate-cli)
│   ├── migrations/          # Database migration scripts
│   └── setup/               # Setup and installation scripts
├── tests/                   # E2E and integration tests
├── public/                  # Static assets
└── [config files]           # Root-level configs only
```

### Source Code Organization

```
src/
├── components/              # React components (atomic design)
├── features/                # Feature modules
├── services/                # Business logic & API clients
├── hooks/                   # Custom React hooks
├── utils/                   # Utility functions
├── types/                   # TypeScript types
├── design-system/           # Design tokens & components
└── lib/                     # Third-party integrations
```

### Documentation Structure

See [docs/README.md](docs/README.md) for complete documentation organization.

Key principles:

- **Topic-based** (not date/status-based)
- **Comprehensive indexes** in every directory
- **Active docs** in main folders
- **Historical docs** in archive/

## Code Quality Standards

BoxCall follows strict code quality standards for consistency and maintainability:

- **Code Style Guide**: See [CODE_STYLE_GUIDE.md](./CODE_STYLE_GUIDE.md)
- **Quality Checklist**: Use [CODE_QUALITY_CHECKLIST.md](./CODE_QUALITY_CHECKLIST.md) before commits
- **Design System**: All styling must use design tokens (enforced by ESLint)

### Quick Quality Checks

```bash
npm run validate           # Type-check + lint + test
npm run lint:fix-all       # Auto-fix linting + formatting
npm run check:consistency  # Full consistency check
```

### Code Standards Enforced

- ✅ **TypeScript**: Strict mode, no excessive `any`
- ✅ **Modern JS**: `const`/`let` only, template literals, arrow functions
- ✅ **Design tokens**: No raw colors, spacing, or typography
- ✅ **Function limits**: Max 200 lines, complexity <20
- ✅ **Formatting**: Prettier with consistent rules

## PR Checklist

Before requesting review:

**Automated checks:**

- [ ] `npm run type-check` - No TypeScript errors
- [ ] `npm run lint` - ESLint passes (<600 warnings)
- [ ] `npm run test` - All tests pass
- [ ] `npm run format:check` - Code properly formatted

**Manual checks:**

- [ ] No `console.log()` in production code
- [ ] No `@ts-ignore` without justification
- [ ] Design tokens used (no raw colors/spacing)
- [ ] Functions under 200 lines
- [ ] Error handling with user-friendly messages
- [ ] Documentation updated if needed

**Quick command:** `npm run validate`

**PR Description should include:**

- Purpose & scope (concise)
- Any migration steps (and verification)
- Rollback plan (if non-trivial)

## Testing Guidelines

- Prefer small, deterministic unit tests.
- Mock external services (Supabase) unless doing integration.
- For new domain logic: add at least 1 happy path + 1 edge/failure test.

## Telemetry & Logging

- Emit telemetry for new critical user actions via dispatcher (buffered events).
- Avoid console.log in production paths (use temporary logs only during development and remove before merge).

## Performance & Accessibility

- Keep initial bundle impact minimal (lazy load large feature areas).
- Maintain accessibility: semantic headings, focus management, aria labels.
- Run `npm run a11y:smoke` for new UI components with interactive states.

## Style & Tokens

- Use semantic classes / tokens instead of raw color utilities.
- Do not reintroduce `text-white` or raw gray backgrounds without tokens.

## Migrations

- Place SQL in `database/migrations/NNN_description.sql`.
- Add verification SQL or script if logic is complex.
- Document any destructive operation in the PR body with rollback notes.

## Adding Large Reference Data

If a reference doc must exceed 300 lines, add the `<!-- allow-empty -->` marker and a header explaining why it’s exempt.

## Quick Start (Local)

```
npm install
cp .env.example .env # fill in keys
npm run dev
```

## Questions

Open a draft PR or file an issue with `[question]` in the title.

Thanks for contributing! Keep it lean, tested, and documented.
