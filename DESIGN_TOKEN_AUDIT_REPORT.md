# Design Token Audit Report

**Generated**: 2025-10-05T20:31:25.808Z  
**Total Violations**: 559

---

## Summary by Type

| Type             | Count | Severity  |
| ---------------- | ----- | --------- |
| hex-color        | 203   | 🔴 High   |
| rgba-color       | 107   | 🔴 High   |
| px-spacing       | 89    | 🟡 Medium |
| tailwind-spacing | 72    | 🟡 Medium |
| border-radius    | 35    | 🟢 Low    |
| box-shadow       | 32    | 🟡 Medium |
| rgb-color        | 20    | ⚪ Info   |
| tailwind-hex     | 1     | 🔴 High   |

---

## Top 20 Files by Violation Count

1. **src/index.css**: 124 violations
2. **src/styles/team-dashboard.css**: 100 violations
3. **src/styles/mobile.css**: 41 violations
4. **src/components/ui/Badge/Badge.css**: 28 violations
5. **src/styles/responsive-dashboard.css**: 25 violations
6. **src/components/calendar/BoxCallCalendar.css**: 18 violations
7. **src/stories/page.css**: 16 violations
8. **src/styles/animations.css**: 16 violations
9. **src/components/ui/Button/Button.tsx**: 13 violations
10. **src/components/design-system/DesignSystemShowcase.tsx**: 10 violations
11. **src/services/pdf/styles.ts**: 9 violations
12. **src/types/practice.ts**: 9 violations
13. **src/components/accessibility/AccessibilityProvider.tsx**: 8 violations
14. **src/styles/overflow-prevention.css**: 7 violations
15. **src/components/playbook/diagram/components/PlayerSidebar.tsx**: 6 violations
16. **src/components/playbook/diagram/PlayDiagramBuilder.tsx**: 5 violations
17. **src/components/ui/AppIconTile.tsx**: 5 violations
18. **src/stories/button.css**: 5 violations
19. **src/components/layout/Footer.tsx**: 4 violations
20. **src/styles/density.css**: 4 violations

---

## Detailed Violations

### src/index.css (124 violations)

- **Line 64** (rgba-color): `rgba(255, 255, 255, 0.85)`
  - Context: `--panel-bg: rgba(255, 255, 255, 0.85);`

- **Line 65** (rgba-color): `rgba(60, 60, 67, 0.18)`
  - Context: `--panel-border: rgba(60, 60, 67, 0.18);`

- **Line 69** (rgba-color): `rgba(0, 0, 0, 0.06)`
  - Context: `0 1px 2px rgba(0, 0, 0, 0.06), 0 8px 20px rgba(0, 0, 0, 0.06);`

- **Line 69** (rgba-color): `rgba(0, 0, 0, 0.06)`
  - Context: `0 1px 2px rgba(0, 0, 0, 0.06), 0 8px 20px rgba(0, 0, 0, 0.06);`

- **Line 70** (border-radius): `4px`
  - Context: `--button-border-radius: 4px;`

- **Line 71** (rgba-color): `rgba(0, 0, 0, 0.06)`
  - Context: `--button-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);`

- **Line 102** (hex-color): `#ffffff`
  - 💡 Suggestion: `semanticTokens.textInverse`
  - Context: `background-color: #ffffff !important;`

- **Line 103** (hex-color): `#111827`
  - 💡 Suggestion: `colorTokens.gray[900]`
  - Context: `color: #111827 !important; /* gray-900 */`

- **Line 107** (rgb-color): `rgb(31, 41, 55)`
  - Context: `html:not(.dark) [style*="background-color: rgb(31, 41, 55)"],`

- **Line 108** (rgb-color): `rgb(17, 24, 39)`
  - Context: `html:not(.dark) [style*="background-color: rgb(17, 24, 39)"] {`

- **Line 110** (rgb-color): `rgb(17, 24, 39)`
  - Context: `color: rgb(17, 24, 39) !important;`

- **Line 115** (hex-color): `#1f2937`
  - 💡 Suggestion: `colorTokens.gray[800]`
  - Context: `background-color: #1f2937 !important; /* gray-800 */`

- **Line 116** (hex-color): `#f3f4f6`
  - 💡 Suggestion: `colorTokens.gray[100]`
  - Context: `color: #f3f4f6 !important; /* gray-100 */`

- **Line 120** (hex-color): `#f9fafb`
  - 💡 Suggestion: `colorTokens.gray[50]`
  - Context: `background-color: #f9fafb; /* gray-50 */`

- **Line 121** (hex-color): `#111827`
  - 💡 Suggestion: `colorTokens.gray[900]`
  - Context: `color: #111827; /* gray-900 */`

... and 109 more violations

### src/styles/team-dashboard.css (100 violations)

- **Line 20** (hex-color): `#ffffff`
  - 💡 Suggestion: `semanticTokens.textInverse`
  - Context: `background: #ffffff;`

- **Line 21** (hex-color): `#e2e8f0`
  - 💡 Suggestion: `colorTokens.navy[200]`
  - Context: `border: 1px solid #e2e8f0;`

- **Line 22** (border-radius): `16px`
  - Context: `border-radius: 16px;`

- **Line 24** (rgba-color): `rgba(0, 0, 0, 0.02)`
  - Context: `0 1px 3px rgba(0, 0, 0, 0.02),`

- **Line 25** (rgba-color): `rgba(0, 0, 0, 0.04)`
  - Context: `0 1px 2px rgba(0, 0, 0, 0.04);`

- **Line 31** (px-spacing): `280px`
  - Context: `min-height: 280px;`

- **Line 39** (hex-color): `#cbd5e1`
  - 💡 Suggestion: `colorTokens.navy[300]`
  - Context: `border-color: #cbd5e1;`

- **Line 41** (rgba-color): `rgba(0, 0, 0, 0.08)`
  - Context: `0 8px 25px rgba(0, 0, 0, 0.08),`

- **Line 42** (rgba-color): `rgba(0, 0, 0, 0.06)`
  - Context: `0 3px 10px rgba(0, 0, 0, 0.06);`

- **Line 59** (px-spacing): `4px`
  - 💡 Suggestion: `spacingTokens[1]`
  - Context: `height: 4px;`

- **Line 60** (hex-color): `#10b981`
  - 💡 Suggestion: `colorTokens.emerald[500]`
  - Context: `background: linear-gradient(135deg, #10b981 0%, #34d399 100%);`

- **Line 60** (hex-color): `#34d399`
  - 💡 Suggestion: `colorTokens.jade[400]`
  - Context: `background: linear-gradient(135deg, #10b981 0%, #34d399 100%);`

- **Line 61** (border-radius): `16px`
  - Context: `border-radius: 16px 16px 0 0;`

- **Line 77** (px-spacing): `4px`
  - 💡 Suggestion: `spacingTokens[1]`
  - Context: `height: 4px;`

- **Line 78** (hex-color): `#3b82f6`
  - 💡 Suggestion: `colorTokens.blue[500]`
  - Context: `background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);`

... and 85 more violations

### src/styles/mobile.css (41 violations)

- **Line 14** (px-spacing): `44px`
  - Context: `min-width: 44px;`

- **Line 15** (px-spacing): `44px`
  - Context: `min-height: 44px;`

- **Line 19** (px-spacing): `60px`
  - Context: `min-width: 60px;`

- **Line 20** (px-spacing): `60px`
  - Context: `min-height: 60px;`

- **Line 88** (rgba-color): `rgba(0, 0, 0, 0.1)`
  - Context: `box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);`

- **Line 88** (box-shadow): `box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1)`
  - Context: `box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);`

- **Line 116** (rgba-color): `rgba(255, 255, 255, 0.95)`
  - Context: `background-color: rgba(255, 255, 255, 0.95);`

- **Line 121** (rgba-color): `rgba(17, 24, 39, 0.95)`
  - Context: `background-color: rgba(17, 24, 39, 0.95);`

- **Line 152** (px-spacing): `640px`
  - Context: `@media (min-width: 640px) {`

- **Line 165** (px-spacing): `640px`
  - Context: `@media (min-width: 640px) {`

- **Line 197** (rgba-color): `rgba(0, 0, 0, 0.12)`
  - Context: `0 4px 8px rgba(0, 0, 0, 0.12),`

- **Line 198** (rgba-color): `rgba(0, 0, 0, 0.08)`
  - Context: `0 2px 4px rgba(0, 0, 0, 0.08),`

- **Line 199** (rgba-color): `rgba(0, 0, 0, 0.04)`
  - Context: `0 1px 2px rgba(0, 0, 0, 0.04);`

- **Line 204** (rgba-color): `rgba(0, 0, 0, 0.15)`
  - Context: `0 8px 16px rgba(0, 0, 0, 0.15),`

- **Line 205** (rgba-color): `rgba(0, 0, 0, 0.1)`
  - Context: `0 4px 8px rgba(0, 0, 0, 0.1),`

... and 26 more violations

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

### src/styles/responsive-dashboard.css (25 violations)

- **Line 35** (px-spacing): `768px`
  - Context: `@media (min-width: 768px) {`

- **Line 48** (px-spacing): `1024px`
  - Context: `@media (min-width: 1024px) {`

- **Line 57** (px-spacing): `1280px`
  - Context: `@media (min-width: 1280px) {`

- **Line 93** (px-spacing): `300px`
  - Context: `min-height: 300px; /* Ensure minimum height for feed */`

- **Line 110** (px-spacing): `400px`
  - Context: `min-height: 400px; /* Ensure calendar has adequate height */`

- **Line 125** (hex-color): `#e5e7eb`
  - 💡 Suggestion: `colorTokens.gray[200]`
  - Context: `border-top: 1px solid #e5e7eb;`

- **Line 130** (hex-color): `#1f2937`
  - 💡 Suggestion: `colorTokens.gray[800]`
  - Context: `background-color: #1f2937;`

- **Line 131** (hex-color): `#374151`
  - 💡 Suggestion: `colorTokens.gray[700]`
  - Context: `border-top-color: #374151;`

- **Line 134** (px-spacing): `1024px`
  - Context: `@media (min-width: 1024px) {`

- **Line 150** (px-spacing): `1024px`
  - Context: `@media (min-width: 1024px) {`

- **Line 178** (px-spacing): `300px`
  - Context: `min-height: 300px;`

- **Line 182** (px-spacing): `400px`
  - Context: `min-height: 400px;`

- **Line 190** (px-spacing): `768px`
  - Context: `@media (min-width: 768px) {`

- **Line 205** (px-spacing): `768px`
  - Context: `@media (min-width: 768px) {`

- **Line 218** (px-spacing): `640px`
  - Context: `@media (max-width: 640px) {`

... and 10 more violations

### src/components/calendar/BoxCallCalendar.css (18 violations)

- **Line 11** (hex-color): `#f9fafb`
  - 💡 Suggestion: `colorTokens.gray[50]`
  - Context: `--fc-neutral-bg-color: #f9fafb;`

- **Line 12** (hex-color): `#ffffff`
  - 💡 Suggestion: `semanticTokens.textInverse`
  - Context: `--fc-page-bg-color: #ffffff;`

- **Line 30** (border-radius): `0.375rem`
  - Context: `border-radius: 0.375rem;`

- **Line 36** (rgba-color): `rgba(0, 168, 107, 0.2)`
  - Context: `box-shadow: 0 4px 8px rgba(0, 168, 107, 0.2);`

- **Line 36** (box-shadow): `box-shadow: 0 4px 8px rgba(0, 168, 107, 0.2)`
  - Context: `box-shadow: 0 4px 8px rgba(0, 168, 107, 0.2);`

- **Line 41** (border-radius): `0.25rem`
  - Context: `border-radius: 0.25rem;`

- **Line 46** (rgba-color): `rgba(0, 0, 0, 0.1)`
  - Context: `box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);`

- **Line 46** (box-shadow): `box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1)`
  - Context: `box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);`

- **Line 52** (rgba-color): `rgba(0, 0, 0, 0.15)`
  - Context: `box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);`

- **Line 52** (box-shadow): `box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15)`
  - Context: `box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);`

- **Line 113** (px-spacing): `768px`
  - Context: `@media (max-width: 768px) {`

- **Line 140** (px-spacing): `480px`
  - Context: `@media (max-width: 480px) {`

- **Line 164** (box-shadow): `box-shadow: 0 0 0 2px var(--color-brand-jade)`
  - Context: `box-shadow: 0 0 0 2px var(--color-brand-jade);`

- **Line 178** (px-spacing): `32px`
  - 💡 Suggestion: `spacingTokens[8]`
  - Context: `width: 32px;`

- **Line 179** (px-spacing): `32px`
  - 💡 Suggestion: `spacingTokens[8]`
  - Context: `height: 32px;`

... and 3 more violations

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

- **Line 62** (rgba-color): `rgba(255, 255, 255, 0.9)`
  - Context: `background: rgba(255, 255, 255, 0.9);`

- **Line 63** (rgba-color): `rgba(255, 255, 255, 0.3)`
  - Context: `border-color: rgba(255, 255, 255, 0.3);`

- **Line 64** (rgba-color): `rgba(0, 0, 0, 0.15)`
  - Context: `box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);`

- **Line 64** (box-shadow): `box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15)`
  - Context: `box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);`

- **Line 75** (box-shadow): `box-shadow: var(--hover-glow)`
  - Context: `box-shadow: var(--hover-glow);`

- **Line 96** (rgba-color): `rgba(0, 168, 107, 0.1)`
  - Context: `rgba(0, 168, 107, 0.1),`

- **Line 97** (rgba-color): `rgba(0, 168, 107, 0.05)`
  - Context: `rgba(0, 168, 107, 0.05)`

- **Line 384** (rgba-color): `rgba(0, 0, 0, 0.1)`
  - Context: `box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);`

- **Line 384** (box-shadow): `box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1)`
  - Context: `box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);`

- **Line 388** (rgba-color): `rgba(0, 0, 0, 0.15)`
  - Context: `box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);`

- **Line 388** (box-shadow): `box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15)`
  - Context: `box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);`

- **Line 481** (rgba-color): `rgba(0, 0, 0, 0.1)`
  - Context: `box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);`

- **Line 481** (box-shadow): `box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1)`
  - Context: `box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);`

- **Line 498** (rgba-color): `rgba(0, 168, 107, 0.2)`
  - Context: `box-shadow: 0 0 0 3px rgba(0, 168, 107, 0.2);`

... and 1 more violations

### src/components/ui/Button/Button.tsx (13 violations)

- **Line 156** (tailwind-spacing): `h-[1.85rem]`
  - Context: `height: "h-[1.85rem]",`

- **Line 161** (tailwind-spacing): `w-[0.9rem]`
  - Context: `iconSize: "w-[0.9rem] h-[0.9rem]",`

- **Line 161** (tailwind-spacing): `h-[0.9rem]`
  - Context: `iconSize: "w-[0.9rem] h-[0.9rem]",`

- **Line 162** (tailwind-spacing): `h-[2.35rem]`
  - Context: `height: "h-[2.35rem]",`

- **Line 167** (tailwind-spacing): `w-[0.95rem]`
  - Context: `iconSize: "w-[0.95rem] h-[0.95rem]",`

- **Line 167** (tailwind-spacing): `h-[0.95rem]`
  - Context: `iconSize: "w-[0.95rem] h-[0.95rem]",`

- **Line 168** (tailwind-spacing): `h-[2.7rem]`
  - Context: `height: "h-[2.7rem]",`

- **Line 173** (tailwind-spacing): `w-[1.05rem]`
  - Context: `iconSize: "w-[1.05rem] h-[1.05rem]",`

- **Line 173** (tailwind-spacing): `h-[1.05rem]`
  - Context: `iconSize: "w-[1.05rem] h-[1.05rem]",`

- **Line 174** (tailwind-spacing): `h-[3rem]`
  - Context: `height: "h-[3rem]",`

- **Line 179** (tailwind-spacing): `w-[1.2rem]`
  - Context: `iconSize: "w-[1.2rem] h-[1.2rem]",`

- **Line 179** (tailwind-spacing): `h-[1.2rem]`
  - Context: `iconSize: "w-[1.2rem] h-[1.2rem]",`

- **Line 180** (tailwind-spacing): `h-[3.4rem]`
  - Context: `height: "h-[3.4rem]",`

### src/components/design-system/DesignSystemShowcase.tsx (10 violations)

- **Line 31** (hex-color): `#002244`
  - Context: `"New England Patriots": { primary: "#002244", secondary: "#C8102E" },`

- **Line 31** (hex-color): `#C8102E`
  - Context: `"New England Patriots": { primary: "#002244", secondary: "#C8102E" },`

- **Line 32** (hex-color): `#E31837`
  - Context: `"Kansas City Chiefs": { primary: "#E31837", secondary: "#FFB612" },`

- **Line 32** (hex-color): `#FFB612`
  - Context: `"Kansas City Chiefs": { primary: "#E31837", secondary: "#FFB612" },`

- **Line 33** (hex-color): `#AA0000`
  - Context: `"San Francisco 49ers": { primary: "#AA0000", secondary: "#B3995D" },`

- **Line 33** (hex-color): `#B3995D`
  - Context: `"San Francisco 49ers": { primary: "#AA0000", secondary: "#B3995D" },`

- **Line 34** (hex-color): `#203731`
  - Context: `"Green Bay Packers": { primary: "#203731", secondary: "#FFB612" },`

- **Line 34** (hex-color): `#FFB612`
  - Context: `"Green Bay Packers": { primary: "#203731", secondary: "#FFB612" },`

- **Line 35** (hex-color): `#003594`
  - Context: `"Dallas Cowboys": { primary: "#003594", secondary: "#869397" },`

- **Line 35** (hex-color): `#869397`
  - Context: `"Dallas Cowboys": { primary: "#003594", secondary: "#869397" },`

---

## Recommendations

### Immediate Actions (High Priority)

1. **Replace hardcoded hex colors** (203 violations)
   - Map to existing color tokens where possible
   - Add missing semantic tokens for common colors

2. **Standardize spacing** (89 violations)
   - Use spacing tokens (4px grid)
   - Replace all hardcoded px values

3. **Fix Tailwind arbitrary values** (73 violations)
   - Use Tailwind utility classes
   - Extend Tailwind config with design tokens

### Medium Priority

4. **Shadow standardization** (32 violations)
   - Define elevation tokens
   - Replace all box-shadow with tokens

5. **Border radius consistency** (35 violations)
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
