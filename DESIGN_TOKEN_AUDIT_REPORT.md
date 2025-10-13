# Design Token Audit Report

**Generated**: 2025-10-13T20:47:34.942Z  
**Total Violations**: 402

---

## Summary by Type

| Type | Count | Severity |
|------|-------|----------|
| px-spacing | 100 | 🟡 Medium |
| rgba-color | 96 | 🔴 High |
| hex-color | 77 | 🔴 High |
| box-shadow | 52 | 🟡 Medium |
| rgb-color | 49 | ⚪ Info |
| border-radius | 25 | 🟢 Low |
| tailwind-spacing | 3 | 🟡 Medium |

---

## Top 20 Files by Violation Count

1. **src/styles/team-dashboard.css**: 54 violations
2. **src/index.css**: 53 violations
3. **src/styles/mobile.css**: 40 violations
4. **src/styles/panels.css**: 34 violations
5. **src/components/ui/Badge/Badge.css**: 28 violations
6. **src/styles/component-utilities.css**: 26 violations
7. **src/styles/responsive-dashboard.css**: 20 violations
8. **src/stories/page.css**: 16 violations
9. **src/styles/animations.css**: 16 violations
10. **src/components/playbook/diagram-editor/components/PlayerControls.tsx**: 13 violations
11. **src/components/design-system/DesignSystemShowcase.tsx**: 10 violations
12. **src/types/practice.ts**: 9 violations
13. **src/styles/grid-flex-patterns.css**: 8 violations
14. **src/styles/overflow-prevention.css**: 7 violations
15. **src/stories/button.css**: 5 violations
16. **src/styles/transitions.css**: 5 violations
17. **src/components/playbook/diagram-editor/components/FormationIcon.tsx**: 4 violations
18. **src/styles/density.css**: 4 violations
19. **src/styles/layout-utilities.css**: 4 violations
20. **src/styles/page-layout.css**: 4 violations

---

## Detailed Violations

### src/styles/team-dashboard.css (54 violations)

- **Line 22** (border-radius): `16px`
  - Context: `border-radius: 16px;`

- **Line 24** (rgba-color): `rgba(0, 0, 0, 0.02)`
  - Context: `0 1px 3px rgba(0, 0, 0, 0.02),`

- **Line 25** (rgba-color): `rgba(0, 0, 0, 0.04)`
  - Context: `0 1px 2px rgba(0, 0, 0, 0.04);`

- **Line 31** (px-spacing): `280px`
  - Context: `min-height: 280px;`

- **Line 41** (rgba-color): `rgba(0, 0, 0, 0.08)`
  - Context: `0 8px 25px rgba(0, 0, 0, 0.08),`

- **Line 42** (rgba-color): `rgba(0, 0, 0, 0.06)`
  - Context: `0 3px 10px rgba(0, 0, 0, 0.06);`

- **Line 59** (px-spacing): `4px`
  - 💡 Suggestion: `spacingTokens[1]`
  - Context: `height: 4px;`

- **Line 65** (border-radius): `16px`
  - Context: `border-radius: 16px 16px 0 0;`

- **Line 81** (px-spacing): `4px`
  - 💡 Suggestion: `spacingTokens[1]`
  - Context: `height: 4px;`

- **Line 87** (border-radius): `16px`
  - Context: `border-radius: 16px 16px 0 0;`

- **Line 101** (px-spacing): `4px`
  - 💡 Suggestion: `spacingTokens[1]`
  - Context: `height: 4px;`

- **Line 107** (border-radius): `16px`
  - Context: `border-radius: 16px 16px 0 0;`

- **Line 121** (px-spacing): `4px`
  - 💡 Suggestion: `spacingTokens[1]`
  - Context: `height: 4px;`

- **Line 127** (border-radius): `16px`
  - Context: `border-radius: 16px 16px 0 0;`

- **Line 182** (hex-color): `#f3f4f6`
  - 💡 Suggestion: `colorTokens.gray[100]`
  - Context: `border-top: 1px solid #f3f4f6;`

... and 39 more violations

### src/index.css (53 violations)

- **Line 112** (box-shadow): `box-shadow: var(--elevation-card-resting)`
  - Context: `box-shadow: var(--elevation-card-resting);`

- **Line 117** (box-shadow): `box-shadow: var(--elevation-lg)`
  - Context: `box-shadow: var(--elevation-lg);`

- **Line 230** (box-shadow): `box-shadow: none !important`
  - Context: `box-shadow: none !important;`

- **Line 242** (box-shadow): `box-shadow: none !important`
  - Context: `box-shadow: none !important;`

- **Line 253** (box-shadow): `box-shadow: var(--tw-shadow) !important`
  - Context: `box-shadow: var(--tw-shadow) !important;`

- **Line 310** (border-radius): `9999px`
  - Context: `border-radius: 9999px;`

- **Line 332** (box-shadow): `box-shadow: var(--panel-shadow)`
  - Context: `box-shadow: var(--panel-shadow);`

- **Line 387** (border-radius): `0.5rem`
  - Context: `border-radius: 0.5rem;`

- **Line 404** (rgba-color): `rgba(4, 120, 87, 0.15)`
  - Context: `background: rgba(4, 120, 87, 0.15); /* jade 700 w/ alpha */`

- **Line 413** (px-spacing): `4px`
  - 💡 Suggestion: `spacingTokens[1]`
  - Context: `width: 4px;`

- **Line 414** (border-radius): `2px`
  - Context: `border-radius: 2px;`

- **Line 475** (hex-color): `#e5e7eb`
  - 💡 Suggestion: `colorTokens.gray[200]`
  - Context: `background: #e5e7eb;`

- **Line 478** (hex-color): `#374151`
  - 💡 Suggestion: `colorTokens.gray[700]`
  - Context: `background: #374151;`

- **Line 482** (hex-color): `#cbd5e1`
  - 💡 Suggestion: `colorTokens.navy[300]`
  - Context: `background: #cbd5e1;`

- **Line 485** (hex-color): `#475569`
  - 💡 Suggestion: `colorTokens.navy[600]`
  - Context: `background: #475569;`

... and 38 more violations

### src/styles/mobile.css (40 violations)

- **Line 14** (px-spacing): `44px`
  - Context: `min-width: 44px;`

- **Line 15** (px-spacing): `44px`
  - Context: `min-height: 44px;`

- **Line 19** (px-spacing): `60px`
  - Context: `min-width: 60px;`

- **Line 20** (px-spacing): `60px`
  - Context: `min-height: 60px;`

- **Line 88** (rgb-color): `rgb(var(--color-black-rgb)`
  - Context: `box-shadow: 0 2px 4px rgb(var(--color-black-rgb) / 0.1);`

- **Line 88** (box-shadow): `box-shadow: 0 2px 4px rgb(var(--color-black-rgb) / 0.1)`
  - Context: `box-shadow: 0 2px 4px rgb(var(--color-black-rgb) / 0.1);`

- **Line 116** (rgb-color): `rgb(var(--color-white-rgb)`
  - Context: `background-color: rgb(var(--color-white-rgb) / 0.95);`

- **Line 121** (rgb-color): `rgb(var(--color-gray-900-rgb)`
  - Context: `background-color: rgb(var(--color-gray-900-rgb) / 0.95);`

- **Line 152** (px-spacing): `640px`
  - Context: `@media (min-width: 640px) {`

- **Line 165** (px-spacing): `640px`
  - Context: `@media (min-width: 640px) {`

- **Line 197** (rgb-color): `rgb(var(--color-black-rgb)`
  - Context: `0 4px 8px rgb(var(--color-black-rgb) / 0.12),`

- **Line 198** (rgb-color): `rgb(var(--color-black-rgb)`
  - Context: `0 2px 4px rgb(var(--color-black-rgb) / 0.08),`

- **Line 199** (rgb-color): `rgb(var(--color-black-rgb)`
  - Context: `0 1px 2px rgb(var(--color-black-rgb) / 0.04);`

- **Line 204** (rgb-color): `rgb(var(--color-black-rgb)`
  - Context: `0 8px 16px rgb(var(--color-black-rgb) / 0.15),`

- **Line 205** (rgb-color): `rgb(var(--color-black-rgb)`
  - Context: `0 4px 8px rgb(var(--color-black-rgb) / 0.1),`

... and 25 more violations

### src/styles/panels.css (34 violations)

- **Line 10** (rgba-color): `rgba(255, 255, 255, 0.8)`
  - Context: `background: rgba(255, 255, 255, 0.8);`

- **Line 13** (rgba-color): `rgba(0, 0, 0, 0.1)`
  - Context: `border: 1px solid rgba(0, 0, 0, 0.1);`

- **Line 16** (rgba-color): `rgba(0, 0, 0, 0.1)`
  - Context: `0 4px 6px -1px rgba(0, 0, 0, 0.1),`

- **Line 17** (rgba-color): `rgba(0, 0, 0, 0.06)`
  - Context: `0 2px 4px -1px rgba(0, 0, 0, 0.06);`

- **Line 22** (rgba-color): `rgba(30, 41, 59, 0.85)`
  - Context: `background: rgba(30, 41, 59, 0.85);`

- **Line 23** (rgba-color): `rgba(255, 255, 255, 0.1)`
  - Context: `border-color: rgba(255, 255, 255, 0.1);`

- **Line 25** (rgba-color): `rgba(0, 0, 0, 0.3)`
  - Context: `0 4px 6px -1px rgba(0, 0, 0, 0.3),`

- **Line 26** (rgba-color): `rgba(0, 0, 0, 0.2)`
  - Context: `0 2px 4px -1px rgba(0, 0, 0, 0.2);`

- **Line 31** (rgba-color): `rgba(255, 255, 255, 0.9)`
  - Context: `background: rgba(255, 255, 255, 0.9);`

- **Line 34** (rgba-color): `rgba(0, 0, 0, 0.12)`
  - Context: `border: 1px solid rgba(0, 0, 0, 0.12);`

- **Line 37** (rgba-color): `rgba(0, 0, 0, 0.1)`
  - Context: `0 10px 15px -3px rgba(0, 0, 0, 0.1),`

- **Line 38** (rgba-color): `rgba(0, 0, 0, 0.05)`
  - Context: `0 4px 6px -2px rgba(0, 0, 0, 0.05);`

- **Line 42** (rgba-color): `rgba(15, 23, 42, 0.9)`
  - Context: `background: rgba(15, 23, 42, 0.9);`

- **Line 43** (rgba-color): `rgba(255, 255, 255, 0.12)`
  - Context: `border-color: rgba(255, 255, 255, 0.12);`

- **Line 45** (rgba-color): `rgba(0, 0, 0, 0.4)`
  - Context: `0 10px 15px -3px rgba(0, 0, 0, 0.4),`

... and 19 more violations

### src/components/ui/Badge/Badge.css (28 violations)

- **Line 52** (rgba-color): `rgba(0, 0, 0, 0.1)`
  - Context: `box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);`

- **Line 52** (box-shadow): `box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1)`
  - Context: `box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);`

- **Line 56** (rgba-color): `rgba(0, 0, 0, 0.15)`
  - Context: `box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);`

- **Line 56** (box-shadow): `box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15)`
  - Context: `box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);`

- **Line 77** (rgba-color): `rgba(139, 92, 246, 0.3)`
  - Context: `box-shadow: 0 0 5px rgba(139, 92, 246, 0.3);`

- **Line 77** (box-shadow): `box-shadow: 0 0 5px rgba(139, 92, 246, 0.3)`
  - Context: `box-shadow: 0 0 5px rgba(139, 92, 246, 0.3);`

- **Line 80** (rgba-color): `rgba(139, 92, 246, 0.5)`
  - Context: `box-shadow: 0 0 15px rgba(139, 92, 246, 0.5);`

- **Line 80** (box-shadow): `box-shadow: 0 0 15px rgba(139, 92, 246, 0.5)`
  - Context: `box-shadow: 0 0 15px rgba(139, 92, 246, 0.5);`

- **Line 117** (rgba-color): `rgba(0, 0, 0, 0.15)`
  - Context: `box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);`

- **Line 117** (box-shadow): `box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15)`
  - Context: `box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);`

- **Line 146** (rgba-color): `rgba(255, 255, 255, 0.3)`
  - Context: `rgba(255, 255, 255, 0.3),`

- **Line 166** (hex-color): `#f3f4f6`
  - 💡 Suggestion: `colorTokens.gray[100]`
  - Context: `background: linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 100%);`

- **Line 166** (hex-color): `#e5e7eb`
  - 💡 Suggestion: `colorTokens.gray[200]`
  - Context: `background: linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 100%);`

- **Line 174** (hex-color): `#22c55e`
  - 💡 Suggestion: `colorTokens.success[500]`
  - Context: `background: linear-gradient(90deg, #22c55e 0%, #16a34a 100%);`

- **Line 174** (hex-color): `#16a34a`
  - 💡 Suggestion: `colorTokens.success[600]`
  - Context: `background: linear-gradient(90deg, #22c55e 0%, #16a34a 100%);`

... and 13 more violations

### src/styles/component-utilities.css (26 violations)

- **Line 16** (box-shadow): `box-shadow: var(--component-button-primary-shadow)`
  - Context: `box-shadow: var(--component-button-primary-shadow);`

- **Line 38** (box-shadow): `box-shadow: var(--component-button-secondary-shadow)`
  - Context: `box-shadow: var(--component-button-secondary-shadow);`

- **Line 205** (rgb-color): `rgb(var(--color-jade-500-rgb, 0 168 107)`
  - Context: `border-color: rgb(var(--color-jade-500-rgb, 0 168 107) / 0.3);`

- **Line 209** (rgb-color): `rgb(var(--color-jade-500-rgb, 0 168 107)`
  - Context: `border-color: rgb(var(--color-jade-500-rgb, 0 168 107) / 0.4);`

- **Line 213** (rgb-color): `rgb(var(--color-jade-500-rgb, 0 168 107)`
  - Context: `border-color: rgb(var(--color-jade-500-rgb, 0 168 107) / 0.5);`

- **Line 217** (rgb-color): `rgb(var(--color-jade-500-rgb, 0 168 107)`
  - Context: `border-color: rgb(var(--color-jade-500-rgb, 0 168 107) / 0.6);`

- **Line 249** (rgb-color): `rgb(var(--color-jade-700-rgb, 5 95 70)`
  - Context: `color: rgb(var(--color-jade-700-rgb, 5 95 70) / 0.7);`

- **Line 253** (rgb-color): `rgb(var(--color-jade-300-rgb, 110 231 183)`
  - Context: `color: rgb(var(--color-jade-300-rgb, 110 231 183) / 0.7);`

- **Line 259** (rgb-color): `rgb(var(--color-jade-200-rgb, 167 243 208)`
  - Context: `border: 2px solid rgb(var(--color-jade-200-rgb, 167 243 208) / 1);`

- **Line 264** (rgb-color): `rgb(var(--color-jade-700-rgb, 5 95 70)`
  - Context: `border-color: rgb(var(--color-jade-700-rgb, 5 95 70) / 1);`

- **Line 268** (rgb-color): `rgb(var(--color-jade-50-rgb, 236 253 245)`
  - Context: `background-color: rgb(var(--color-jade-50-rgb, 236 253 245) / 1);`

- **Line 269** (rgb-color): `rgb(var(--color-jade-300-rgb, 110 231 183)`
  - Context: `border-color: rgb(var(--color-jade-300-rgb, 110 231 183) / 1);`

- **Line 273** (rgb-color): `rgb(var(--color-jade-900-rgb, 5 46 22)`
  - Context: `background-color: rgb(var(--color-jade-900-rgb, 5 46 22) / 0.2);`

- **Line 274** (rgb-color): `rgb(var(--color-jade-600-rgb, 4 120 87)`
  - Context: `border-color: rgb(var(--color-jade-600-rgb, 4 120 87) / 1);`

- **Line 286** (box-shadow): `box-shadow: 0 0 0 var(--component-focus-ring-width)`
  - Context: `box-shadow: 0 0 0 var(--component-focus-ring-width)`

... and 11 more violations

### src/styles/responsive-dashboard.css (20 violations)

- **Line 53** (px-spacing): `44px`
  - Context: `min-height: 44px;`

- **Line 54** (px-spacing): `44px`
  - Context: `min-width: 44px;`

- **Line 62** (px-spacing): `768px`
  - Context: `@media (min-width: 768px) {`

- **Line 75** (px-spacing): `1024px`
  - Context: `@media (min-width: 1024px) {`

- **Line 84** (px-spacing): `1280px`
  - Context: `@media (min-width: 1280px) {`

- **Line 120** (px-spacing): `300px`
  - Context: `min-height: 300px; /* Ensure minimum height for feed */`

- **Line 137** (px-spacing): `400px`
  - Context: `min-height: 400px; /* Ensure calendar has adequate height */`

- **Line 161** (px-spacing): `1024px`
  - Context: `@media (min-width: 1024px) {`

- **Line 177** (px-spacing): `1024px`
  - Context: `@media (min-width: 1024px) {`

- **Line 205** (px-spacing): `300px`
  - Context: `min-height: 300px;`

- **Line 209** (px-spacing): `400px`
  - Context: `min-height: 400px;`

- **Line 217** (px-spacing): `768px`
  - Context: `@media (min-width: 768px) {`

- **Line 232** (px-spacing): `768px`
  - Context: `@media (min-width: 768px) {`

- **Line 245** (px-spacing): `640px`
  - Context: `@media (max-width: 640px) {`

- **Line 272** (border-radius): `0.5rem`
  - Context: `border-radius: 0.5rem;`

... and 5 more violations

### src/stories/page.css (16 violations)

- **Line 3** (px-spacing): `48px`
  - 💡 Suggestion: `spacingTokens[12]`
  - Context: `padding: 48px 20px;`

- **Line 4** (px-spacing): `600px`
  - Context: `max-width: 600px;`

- **Line 5** (hex-color): `#333`
  - Context: `color: #333;`

- **Line 7** (px-spacing): `24px`
  - 💡 Suggestion: `spacingTokens[6]`
  - Context: `line-height: 24px;`

- **Line 34** (px-spacing): `8px`
  - 💡 Suggestion: `spacingTokens[2]`
  - Context: `margin-bottom: 8px;`

- **Line 42** (hex-color): `#e7fdd8`
  - Context: `background: #e7fdd8;`

- **Line 43** (px-spacing): `4px`
  - 💡 Suggestion: `spacingTokens[1]`
  - Context: `padding: 4px 12px;`

- **Line 44** (hex-color): `#357a14`
  - Context: `color: #357a14;`

- **Line 47** (px-spacing): `12px`
  - 💡 Suggestion: `spacingTokens[3]`
  - Context: `line-height: 12px;`

- **Line 51** (px-spacing): `40px`
  - 💡 Suggestion: `spacingTokens[10]`
  - Context: `margin-top: 40px;`

- **Line 52** (px-spacing): `40px`
  - 💡 Suggestion: `spacingTokens[10]`
  - Context: `margin-bottom: 40px;`

- **Line 54** (px-spacing): `20px`
  - 💡 Suggestion: `spacingTokens[5]`
  - Context: `line-height: 20px;`

- **Line 61** (px-spacing): `4px`
  - 💡 Suggestion: `spacingTokens[1]`
  - Context: `margin-right: 4px;`

- **Line 62** (px-spacing): `12px`
  - 💡 Suggestion: `spacingTokens[3]`
  - Context: `width: 12px;`

- **Line 63** (px-spacing): `12px`
  - 💡 Suggestion: `spacingTokens[3]`
  - Context: `height: 12px;`

... and 1 more violations

### src/styles/animations.css (16 violations)

- **Line 54** (box-shadow): `box-shadow: var(--glass-shadow)`
  - Context: `box-shadow: var(--glass-shadow);`

- **Line 62** (rgb-color): `rgb(var(--color-white-rgb)`
  - Context: `background: rgb(var(--color-white-rgb) / 0.9);`

- **Line 63** (rgb-color): `rgb(var(--color-white-rgb)`
  - Context: `border-color: rgb(var(--color-white-rgb) / 0.3);`

- **Line 64** (rgb-color): `rgb(var(--color-black-rgb)`
  - Context: `box-shadow: 0 12px 40px rgb(var(--color-black-rgb) / 0.15);`

- **Line 64** (box-shadow): `box-shadow: 0 12px 40px rgb(var(--color-black-rgb) / 0.15)`
  - Context: `box-shadow: 0 12px 40px rgb(var(--color-black-rgb) / 0.15);`

- **Line 75** (box-shadow): `box-shadow: var(--hover-glow)`
  - Context: `box-shadow: var(--hover-glow);`

- **Line 96** (rgb-color): `rgb(var(--color-jade-500-rgb)`
  - Context: `rgb(var(--color-jade-500-rgb) / 0.1),`

- **Line 97** (rgb-color): `rgb(var(--color-jade-500-rgb)`
  - Context: `rgb(var(--color-jade-500-rgb) / 0.05)`

- **Line 384** (rgb-color): `rgb(var(--color-black-rgb)`
  - Context: `box-shadow: 0 1px 3px rgb(var(--color-black-rgb) / 0.1);`

- **Line 384** (box-shadow): `box-shadow: 0 1px 3px rgb(var(--color-black-rgb) / 0.1)`
  - Context: `box-shadow: 0 1px 3px rgb(var(--color-black-rgb) / 0.1);`

- **Line 388** (rgb-color): `rgb(var(--color-black-rgb)`
  - Context: `box-shadow: 0 4px 8px rgb(var(--color-black-rgb) / 0.15);`

- **Line 388** (box-shadow): `box-shadow: 0 4px 8px rgb(var(--color-black-rgb) / 0.15)`
  - Context: `box-shadow: 0 4px 8px rgb(var(--color-black-rgb) / 0.15);`

- **Line 481** (rgb-color): `rgb(var(--color-black-rgb)`
  - Context: `box-shadow: 0 4px 12px rgb(var(--color-black-rgb) / 0.1);`

- **Line 481** (box-shadow): `box-shadow: 0 4px 12px rgb(var(--color-black-rgb) / 0.1)`
  - Context: `box-shadow: 0 4px 12px rgb(var(--color-black-rgb) / 0.1);`

- **Line 498** (rgb-color): `rgb(var(--color-jade-500-rgb)`
  - Context: `box-shadow: 0 0 0 3px rgb(var(--color-jade-500-rgb) / 0.2);`

... and 1 more violations

### src/components/playbook/diagram-editor/components/PlayerControls.tsx (13 violations)

- **Line 1284** (rgba-color): `rgba(229, 231, 235, 0.8)`
  - Context: `border: "1px solid rgba(229, 231, 235, 0.8)",`

- **Line 1286** (rgba-color): `rgba(0,0,0,0.6)`
  - Context: `"0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.1) inset",`

- **Line 1286** (rgba-color): `rgba(255,255,255,0.1)`
  - Context: `"0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.1) inset",`

- **Line 1294** (hex-color): `#FCD34D`
  - 💡 Suggestion: `colorTokens.amber[300]`
  - Context: `"linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)",`

- **Line 1294** (hex-color): `#F59E0B`
  - 💡 Suggestion: `colorTokens.warning[500]`
  - Context: `"linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)",`

- **Line 1295** (rgba-color): `rgba(245, 158, 11, 0.4)`
  - Context: `boxShadow: "0 8px 24px rgba(245, 158, 11, 0.4)",`

- **Line 1303** (hex-color): `#111827`
  - 💡 Suggestion: `colorTokens.gray[900]`
  - Context: `style={{ color: "#111827" }}`

- **Line 1309** (hex-color): `#374151`
  - 💡 Suggestion: `colorTokens.gray[700]`
  - Context: `style={{ color: "#374151" }}`

- **Line 1335** (hex-color): `#F3F4F6`
  - 💡 Suggestion: `colorTokens.gray[100]`
  - Context: `background: "#F3F4F6",`

- **Line 1336** (hex-color): `#111827`
  - 💡 Suggestion: `colorTokens.gray[900]`
  - Context: `color: "#111827",`

- **Line 1337** (hex-color): `#D1D5DB`
  - 💡 Suggestion: `colorTokens.gray[300]`
  - Context: `border: "1px solid #D1D5DB",`

- **Line 1340** (hex-color): `#E5E7EB`
  - 💡 Suggestion: `colorTokens.gray[200]`
  - Context: `e.currentTarget.style.background = "#E5E7EB";`

- **Line 1343** (hex-color): `#F3F4F6`
  - 💡 Suggestion: `colorTokens.gray[100]`
  - Context: `e.currentTarget.style.background = "#F3F4F6";`



---

## Recommendations

### Immediate Actions (High Priority)

1. **Replace hardcoded hex colors** (77 violations)
   - Map to existing color tokens where possible
   - Add missing semantic tokens for common colors

2. **Standardize spacing** (100 violations)
   - Use spacing tokens (4px grid)
   - Replace all hardcoded px values

3. **Fix Tailwind arbitrary values** (3 violations)
   - Use Tailwind utility classes
   - Extend Tailwind config with design tokens

### Medium Priority

4. **Shadow standardization** (52 violations)
   - Define elevation tokens
   - Replace all box-shadow with tokens

5. **Border radius consistency** (25 violations)
   - Use border radius tokens
   - Standardize corner styles

### Next Steps

1. Run this audit regularly (CI/CD integration)
2. Add ESLint rules to prevent new violations
3. Create migration scripts for automated fixes
4. Update documentation with token usage guidelines

---

## Token Gap Analysis

### Missing Color Tokens

Based on frequent hardcoded colors, consider adding:
- Blue system (blue-500, blue-600 for links/actions)
- Cyan system (cyan-400 for highlights)
- Amber system (amber-400, amber-500 for warnings)
- Emerald system (emerald-500 for success states)

### Missing Semantic Tokens

- `linkColor`: For all link elements
- `linkHoverColor`: For hover states
- `highlightColor`: For selection/focus highlights
- `diagr amColors`: Specific colors for diagram elements

### Missing Spacing Tokens

- Consider adding: 2px, 6px, 10px for fine-tuned layouts
- Add semantic spacing: `cardPadding`, `sectionGap`, `itemSpacing`

---

**End of Report**
