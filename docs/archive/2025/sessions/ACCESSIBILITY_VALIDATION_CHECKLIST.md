# Accessibility Validation Checklist

**Quick reference for testing accessibility before committing code.**

---

## 🔍 Quick Pre-Commit Checklist

Before committing any accessibility-related changes:

- [ ] **Keyboard Test:** Tab through the page without using mouse
- [ ] **Focus Visible:** All interactive elements show focus indicator
- [ ] **ARIA Labels:** Icon buttons have descriptive `aria-label`
- [ ] **Lighthouse:** Run accessibility audit (target 95+)
- [ ] **Build:** `npm run type-check` passes

---

## 📋 Component Validation

### When Creating a New Component

#### ✅ Interactive Elements

- [ ] Buttons use `<button>` not `<div onClick>`
- [ ] Links use `<a href>` not `<div onClick>`
- [ ] Icon-only buttons have `aria-label`
- [ ] All interactive elements keyboard-accessible

#### ✅ Focus Management

- [ ] Focus indicator visible (jade ring)
- [ ] Focus indicator high contrast (3:1 minimum)
- [ ] `:focus-visible` used, not `:focus`
- [ ] No focus traps

#### ✅ ARIA

- [ ] Decorative icons have `aria-hidden="true"`
- [ ] Status messages have `role="status"`
- [ ] Dialogs have `role="dialog"` and `aria-modal="true"`
- [ ] Form fields have labels

#### ✅ Semantic HTML

- [ ] Use `<button>` for buttons
- [ ] Use `<a>` for links
- [ ] Use `<main>`, `<header>`, `<nav>` for landmarks
- [ ] Use proper heading hierarchy (h1→h2→h3)

---

## 🧪 Page Validation

### When Creating or Updating a Page

#### ✅ Structure

- [ ] Page wrapped in `<PageLayout>`
- [ ] Page title is `<h1>`
- [ ] Heading hierarchy logical (no skipped levels)
- [ ] Skip links work (Tab from page load)

#### ✅ Navigation

- [ ] All links keyboard-accessible
- [ ] Current page indicated
- [ ] Tab order logical (follows visual layout)

#### ✅ Forms

- [ ] All fields have `<label>`
- [ ] Required fields indicated
- [ ] Error messages associated with fields (`aria-describedby`)
- [ ] Form submit works with Enter key

#### ✅ Dynamic Content

- [ ] Loading states announced (`role="status"`)
- [ ] Toasts announced (`aria-live="polite"`)
- [ ] Errors announced (`role="alert"`)

---

## 🎯 Feature Validation

### Modal/Dialog

- [ ] `role="dialog"` on container
- [ ] `aria-modal="true"` on container
- [ ] `aria-labelledby` points to title ID
- [ ] Focus moves to modal when opened
- [ ] Tab stays within modal (focus trap)
- [ ] Escape closes modal
- [ ] Focus returns to trigger when closed

### Dropdown/Menu

- [ ] Trigger has `aria-haspopup="true"`
- [ ] Trigger has `aria-expanded` (true/false)
- [ ] Menu has `role="menu"` (if menu) or `role="listbox"` (if selection)
- [ ] Items have `role="menuitem"` or `role="option"`
- [ ] Keyboard navigation works (Enter, Escape, Arrow keys if implemented)

### Toast Notification

- [ ] Container has `role="region"` and `aria-label="Notifications"`
- [ ] Individual toasts have `role="status"`
- [ ] Container has `aria-live="polite"`
- [ ] Icons have `aria-hidden="true"`

### Loading Spinner

- [ ] `role="status"` on container
- [ ] `aria-live="polite"` on container
- [ ] `aria-hidden="true"` on spinner animation
- [ ] `.sr-only` text describes loading state

### Search

- [ ] Container has `role="search"`
- [ ] Input has `type="search"`
- [ ] Input has `aria-label`
- [ ] Clear button works with keyboard

### Table

- [ ] Use `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>`
- [ ] `<th scope="col">` for column headers
- [ ] `<th scope="row">` for row headers
- [ ] Caption or `aria-label` describes table

---

## 🛠️ Testing Commands

### Automated Tests

```bash
# Type check
npm run type-check

# Build check
npm run build

# Lint check
npm run lint

# Unit tests
npm run test
```

### Manual Tests

```bash
# Start dev server
npm run dev

# Open http://localhost:5173
# Run Lighthouse in Chrome DevTools
# Target: 95+ accessibility score
```

---

## 📱 Device Testing

### Desktop

- [ ] Chrome (Lighthouse audit)
- [ ] Firefox
- [ ] Safari (VoiceOver test)
- [ ] Edge

### Mobile

- [ ] iOS Safari (VoiceOver)
- [ ] Android Chrome (TalkBack)
- [ ] Touch targets 44×44px minimum

---

## 🔧 Common Fixes

### Issue: Button has no label

```tsx
// ❌ Before
<button onClick={handleClick}>
  <Icon name="trash" />
</button>

// ✅ After
<IconButton aria-label="Delete play" onClick={handleClick}>
  <Icon name="trash" />
</IconButton>
```

### Issue: Icon announced to screen readers

```tsx
// ❌ Before
<Icon name="star" />

// ✅ After
<Icon name="star" aria-hidden="true" />
```

### Issue: Loading spinner silent

```tsx
// ❌ Before
<div className="spinner" />

// ✅ After
<div role="status" aria-live="polite">
  <div className="spinner" aria-hidden="true" />
  <span className="sr-only">Loading...</span>
</div>
```

### Issue: Modal missing ARIA

```tsx
// ❌ Before
<div className="modal">
  <h2>Title</h2>
</div>

// ✅ After
<div role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <h2 id="modal-title">Title</h2>
</div>
```

### Issue: No focus indicator

```css
/* ❌ Before */
button:focus {
  outline: none;
}

/* ✅ After */
button:focus-visible {
  outline: var(--focus-ring-width) solid var(--focus-ring-color);
  outline-offset: var(--focus-ring-offset);
}
```

---

## 📊 Score Targets

| Metric                   | Target  | Current |
| ------------------------ | ------- | ------- |
| Lighthouse Accessibility | 95+     | ⏳ TBD  |
| Keyboard Navigation      | 100%    | ✅ Pass |
| Focus Indicators         | 100%    | ✅ Pass |
| ARIA Labels              | 100%    | ✅ Pass |
| Semantic HTML            | 100%    | ✅ Pass |
| Color Contrast           | WCAG AA | ⏳ TBD  |

---

## ✅ Sign-Off Template

```markdown
## Accessibility Validation - [Feature Name]

**Date:** [Date]  
**Reviewer:** [Name]

### Automated Tests

- [ ] Lighthouse score: \_\_\_/100 (target: 95+)
- [ ] axe DevTools: \_\_\_ violations
- [ ] Type check passed
- [ ] Build passed

### Manual Tests

- [ ] Keyboard navigation tested
- [ ] Focus indicators visible
- [ ] Screen reader tested (VoiceOver/NVDA)
- [ ] ARIA labels verified
- [ ] Color contrast checked

### Issues Found

- [ ] None / [List issues]

### Status

- [ ] ✅ Approved
- [ ] ⚠️ Needs fixes: [Details]
```

---

## 🚀 CI/CD Integration

### GitHub Actions (Future)

```yaml
# .github/workflows/accessibility.yml
name: Accessibility Tests

on: [pull_request]

jobs:
  a11y:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - run: npm run test:a11y
      - name: Upload report
        uses: actions/upload-artifact@v3
        with:
          name: accessibility-report
          path: reports/a11y.json
```

---

**Last Updated:** October 2, 2025  
**Related:** [ACCESSIBILITY_TESTING_GUIDE.md](./ACCESSIBILITY_TESTING_GUIDE.md)
