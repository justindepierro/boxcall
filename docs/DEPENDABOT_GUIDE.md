# Dependabot Configuration Guide

## Overview

Dependabot is configured to automatically check for dependency updates and security vulnerabilities in the BoxCall project. This ensures the project stays up-to-date with the latest security patches and bug fixes.

## Configuration Details

**Location:** `.github/dependabot.yml`

### Update Schedule

- **Frequency:** Weekly (every Monday at 9:00 AM ET)
- **Package Ecosystem:** npm and GitHub Actions
- **Open PR Limit:** 10 concurrent PRs to avoid overwhelming the team

### Dependency Grouping

Dependencies are grouped into logical categories to make PRs easier to review:

#### 1. React Ecosystem

- `react`, `react-dom`, `react-router-dom`
- All `@types/react*` packages

**Rationale:** These packages should be updated together to maintain compatibility.

#### 2. Testing Dependencies

- `vitest`, `@vitest/*`
- `@testing-library/*`
- `@storybook/*`

**Rationale:** Testing tools can be updated as a group since they don't affect production code.

#### 3. Build Tools

- `vite`, `@vitejs/*`
- `typescript`
- `eslint`, `prettier`

**Rationale:** Build and development tools should be coordinated to avoid conflicts.

#### 4. Supabase Dependencies

- `@supabase/*`
- `supabase`

**Rationale:** Supabase client and related packages should stay in sync.

### Ignored Updates

**Major Version Updates** are ignored for critical dependencies:

- React (requires manual migration planning)
- TypeScript (breaking changes need review)
- Vite (build system changes need testing)

**Reason:** Major version updates can introduce breaking changes that require code modifications, testing, and team coordination.

### Security Updates

Security updates are handled with higher priority:

- Checked more frequently than regular updates
- Not subject to PR limits
- Automatically labeled with `security`

## Pull Request Workflow

### 1. PR Creation

When Dependabot creates a PR, it will:

- Include a clear title: `chore(deps): bump package-name from x.x.x to y.y.y`
- Add labels: `dependencies`, `automated`
- Assign to: `@justindepierro`
- Include changelog and compatibility notes

### 2. Review Process

**For Minor/Patch Updates:**

1. Review the changelog for breaking changes
2. Check if CI/CD passes (automated tests)
3. If tests pass, merge with confidence

**For Grouped Updates:**

1. Review all packages in the group
2. Check for any conflicts or breaking changes
3. Run `npm test` locally if needed
4. Merge when confident

**For Security Updates:**

1. Review severity level
2. Check for any workarounds needed
3. Merge ASAP (prioritize over features)

### 3. Auto-Merge Strategy

**Recommended Auto-Merge Rules** (configure in GitHub settings):

```yaml
# .github/workflows/dependabot-auto-merge.yml
name: Dependabot Auto-Merge

on:
  pull_request:
    types: [opened, reopened, synchronize]

jobs:
  auto-merge:
    runs-on: ubuntu-latest
    if: github.actor == 'dependabot[bot]'
    steps:
      - name: Enable auto-merge for patch updates
        if: |
          contains(github.event.pull_request.labels.*.name, 'dependencies') &&
          !contains(github.event.pull_request.title, 'major')
        run: gh pr merge --auto --squash "$PR_URL"
        env:
          PR_URL: ${{ github.event.pull_request.html_url }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**Auto-Merge Criteria:**

- ✅ All CI/CD checks pass
- ✅ Patch or minor version updates only
- ✅ Security updates (any version)
- ❌ Major version updates (manual review required)

## Monitoring and Alerts

### Email Notifications

- **New PR Created:** Team is notified
- **Security Alert:** High-priority notification
- **Failed Update:** Alert if PR creation fails

### GitHub Notifications

- PRs appear in the repository's Pull Requests tab
- Security alerts appear in the Security tab
- Dependabot alerts visible in Insights → Dependency graph

## Best Practices

### 1. Review Weekly Updates

- Set aside time every Monday (or Tuesday) to review Dependabot PRs
- Batch review grouped updates
- Prioritize security updates

### 2. Test Locally When Unsure

```bash
# Fetch the Dependabot branch
git fetch origin dependabot/npm_and_yarn/package-name-x.x.x

# Check out the branch
git checkout -b test-dependabot origin/dependabot/npm_and_yarn/package-name-x.x.x

# Run tests
npm install
npm test
npm run build

# If all passes, merge via GitHub UI
```

### 3. Monitor for Breaking Changes

- Review changelog links in PR description
- Check for migration guides
- Look for deprecation warnings in build output

### 4. Keep Dependabot Updated

- Dependabot itself updates automatically
- Configuration changes via `.github/dependabot.yml`
- GitHub provides deprecation notices for old config formats

## Troubleshooting

### Issue: Too Many PRs

**Solution:** Reduce `open-pull-requests-limit` in config

### Issue: Update Conflicts

**Solution:** Close conflicting PRs, Dependabot will recreate with latest base

### Issue: Failed CI/CD

**Solution:**

1. Review test failures
2. Check if it's a flaky test or real issue
3. Close PR if breaking change detected
4. Add package to ignore list if needed

### Issue: Security Vulnerability Not Fixed

**Solution:**

1. Check if vulnerability is in transitive dependency
2. Wait for upstream package to update
3. Consider alternative packages if critical
4. Use `npm audit fix` for immediate patches

## Configuration Updates

### Adding New Dependency Groups

Edit `.github/dependabot.yml`:

```yaml
groups:
  your-group-name:
    patterns:
      - "package-pattern*"
      - "another-package"
```

### Ignoring Specific Packages

```yaml
ignore:
  - dependency-name: "package-name"
    update-types: ["version-update:semver-major"]
```

### Changing Update Frequency

```yaml
schedule:
  interval: "daily" # or "weekly", "monthly"
  day: "monday" # only for weekly
  time: "09:00"
```

## Security Features

### 1. Security-Only Updates

Dependabot automatically creates PRs for security vulnerabilities even outside the regular schedule.

### 2. Vulnerability Alerts

GitHub sends immediate alerts for:

- Critical vulnerabilities
- High-severity issues
- Known exploits

### 3. Security Tab

Monitor all security issues at:
`https://github.com/justindepierro/boxcall/security`

## Metrics and Reporting

### Track Dependabot Performance

- **Average Time to Merge:** Target < 1 week
- **Security Update Response:** Target < 24 hours
- **Failed PRs:** Monitor for patterns
- **Ignored Updates:** Review quarterly

### Monthly Review Checklist

- [ ] Review all open Dependabot PRs
- [ ] Close stale PRs (over 2 months old)
- [ ] Check for ignored major updates
- [ ] Review security alerts backlog
- [ ] Update Dependabot config if needed

## Integration with CI/CD

Dependabot PRs trigger the same CI/CD pipeline as regular PRs:

- Type checking
- Linting
- Unit tests
- Build verification
- (Future) E2E tests

**Only merge when all checks pass** ✅

## Related Documentation

- [GitHub Dependabot Documentation](https://docs.github.com/en/code-security/dependabot)
- [npm Audit Guide](https://docs.npmjs.com/cli/v8/commands/npm-audit)
- [Semantic Versioning](https://semver.org/)

## Changelog

### 2025-01-09 - Initial Configuration

- ✅ Created Dependabot config with weekly updates
- ✅ Configured dependency grouping (React, Testing, Build, Supabase)
- ✅ Set up PR limits and assignees
- ✅ Ignored major version updates for critical packages
- ✅ Added GitHub Actions updates
- ✅ Documentation complete

## Support

**Questions or Issues?**

- Check GitHub's Dependabot logs in the Insights tab
- Review PR descriptions for error messages
- Consult GitHub Dependabot documentation
- Contact: @justindepierro
