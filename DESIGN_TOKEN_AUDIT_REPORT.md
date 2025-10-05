# Design Token Audit Report

**Generated**: 2025-10-05T20:03:24.418Z  
**Total Violations**: 1118

---

## Summary by Type

| Type | Count | Severity |
|------|-------|----------|
| hex-color | 654 | 🔴 High |
| rgba-color | 161 | 🔴 High |
| px-spacing | 89 | 🟡 Medium |
| tailwind-spacing | 73 | 🟡 Medium |
| rgb-color | 71 | ⚪ Info |
| border-radius | 37 | 🟢 Low |
| box-shadow | 32 | 🟡 Medium |
| tailwind-hex | 1 | 🔴 High |

---

## Top 20 Files by Violation Count

1. **src/design-system/tokens.ts**: 169 violations
2. **src/styles/generated-themes.css**: 140 violations
3. **src/index.css**: 124 violations
4. **src/styles/team-dashboard.css**: 100 violations
5. **src/themes/registry.ts**: 67 violations
6. **src/lib/colorGeneration.ts**: 53 violations
7. **src/styles/mobile.css**: 41 violations
8. **src/styles/tailwind/auroraTheme.js**: 30 violations
9. **src/components/ui/Badge/Badge.css**: 28 violations
10. **src/styles/responsive-dashboard.css**: 25 violations
11. **src/hooks/useColorTheme.ts**: 22 violations
12. **src/styles/generated-tokens.css**: 22 violations
13. **src/components/calendar/BoxCallCalendar.css**: 18 violations
14. **src/stories/page.css**: 16 violations
15. **src/styles/animations.css**: 16 violations
16. **src/components/ui/Button/Button.tsx**: 13 violations
17. **src/dev/contrastDebug.ts**: 12 violations
18. **src/components/design-system/DesignSystemShowcase.tsx**: 10 violations
19. **src/components/pdf/PracticeScriptPDF.tsx**: 10 violations
20. **src/services/pdf/styles.ts**: 9 violations

---

## Detailed Violations

### src/design-system/tokens.ts (169 violations)

- **Line 15** (hex-color): `#ECFDF5`
  - 💡 Suggestion: `colorTokens.jade[50]`
  - Context: `50: "#ECFDF5",`

- **Line 16** (hex-color): `#D1FAE5`
  - 💡 Suggestion: `colorTokens.jade[100]`
  - Context: `100: "#D1FAE5",`

- **Line 17** (hex-color): `#A7F3D0`
  - 💡 Suggestion: `colorTokens.jade[200]`
  - Context: `200: "#A7F3D0",`

- **Line 18** (hex-color): `#6EE7B7`
  - 💡 Suggestion: `colorTokens.jade[300]`
  - Context: `300: "#6EE7B7",`

- **Line 19** (hex-color): `#34D399`
  - 💡 Suggestion: `colorTokens.jade[400]`
  - Context: `400: "#34D399",`

- **Line 20** (hex-color): `#00A86B`
  - 💡 Suggestion: `colorTokens.jade[500]`
  - Context: `500: "#00A86B", // PRIMARY brand color`

- **Line 21** (hex-color): `#047857`
  - 💡 Suggestion: `colorTokens.jade[600]`
  - Context: `600: "#047857", // MAIN interaction color (hover, focus, icons)`

- **Line 22** (hex-color): `#065F46`
  - 💡 Suggestion: `colorTokens.jade[700]`
  - Context: `700: "#065F46",`

- **Line 23** (hex-color): `#064E3B`
  - 💡 Suggestion: `colorTokens.jade[800]`
  - Context: `800: "#064E3B",`

- **Line 24** (hex-color): `#052E16`
  - 💡 Suggestion: `colorTokens.jade[900]`
  - Context: `900: "#052E16",`

- **Line 29** (hex-color): `#F8FAFC`
  - 💡 Suggestion: `colorTokens.navy[50]`
  - Context: `50: "#F8FAFC",`

- **Line 30** (hex-color): `#F1F5F9`
  - 💡 Suggestion: `colorTokens.navy[100]`
  - Context: `100: "#F1F5F9",`

- **Line 31** (hex-color): `#E2E8F0`
  - 💡 Suggestion: `colorTokens.navy[200]`
  - Context: `200: "#E2E8F0",`

- **Line 32** (hex-color): `#CBD5E1`
  - 💡 Suggestion: `colorTokens.navy[300]`
  - Context: `300: "#CBD5E1",`

- **Line 33** (hex-color): `#94A3B8`
  - 💡 Suggestion: `colorTokens.navy[400]`
  - Context: `400: "#94A3B8",`

... and 154 more violations

### src/styles/generated-themes.css (140 violations)

- **Line 2** (hex-color): `#00a86b`
  - 💡 Suggestion: `colorTokens.jade[500]`
  - Context: `--semantic-primary: #00a86b;`

- **Line 3** (hex-color): `#047857`
  - 💡 Suggestion: `colorTokens.jade[600]`
  - Context: `--semantic-primary-hover: #047857;`

- **Line 4** (hex-color): `#065f46`
  - 💡 Suggestion: `colorTokens.jade[700]`
  - Context: `--semantic-primary-active: #065f46;`

- **Line 5** (hex-color): `#111827`
  - 💡 Suggestion: `colorTokens.gray[900]`
  - Context: `--semantic-text-primary: #111827;`

- **Line 6** (hex-color): `#4b5563`
  - 💡 Suggestion: `colorTokens.gray[600]`
  - Context: `--semantic-text-secondary: #4b5563;`

- **Line 7** (hex-color): `#6b7280`
  - 💡 Suggestion: `colorTokens.gray[500]`
  - Context: `--semantic-text-muted: #6b7280;`

- **Line 8** (hex-color): `#ffffff`
  - 💡 Suggestion: `semanticTokens.textInverse`
  - Context: `--semantic-text-inverse: #ffffff;`

- **Line 9** (hex-color): `#047857`
  - 💡 Suggestion: `colorTokens.jade[600]`
  - Context: `--semantic-text-brand: #047857;`

- **Line 10** (hex-color): `#00a86b`
  - 💡 Suggestion: `colorTokens.jade[500]`
  - Context: `--semantic-text-accent: #00a86b;`

- **Line 11** (hex-color): `#475569`
  - 💡 Suggestion: `colorTokens.navy[600]`
  - Context: `--semantic-text-accent-secondary: #475569;`

- **Line 12** (hex-color): `#7c3aed`
  - 💡 Suggestion: `colorTokens.purple[700]`
  - Context: `--semantic-text-accent-electric: #7c3aed;`

- **Line 13** (hex-color): `#ffffff`
  - 💡 Suggestion: `semanticTokens.textInverse`
  - Context: `--semantic-bg-primary: #ffffff;`

- **Line 14** (hex-color): `#f9fafb`
  - 💡 Suggestion: `colorTokens.gray[50]`
  - Context: `--semantic-bg-secondary: #f9fafb;`

- **Line 15** (hex-color): `#f3f4f6`
  - 💡 Suggestion: `colorTokens.gray[100]`
  - Context: `--semantic-bg-muted: #f3f4f6;`

- **Line 16** (hex-color): `#f3f4f6`
  - 💡 Suggestion: `colorTokens.gray[100]`
  - Context: `--semantic-surface-subtle-hover: #f3f4f6;`

... and 125 more violations

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

### src/themes/registry.ts (67 violations)

- **Line 11** (hex-color): `#00A86B`
  - 💡 Suggestion: `colorTokens.jade[500]`
  - Context: `primary: "#00A86B",`

- **Line 17** (hex-color): `#ffffff`
  - 💡 Suggestion: `semanticTokens.textInverse`
  - Context: `textInverse: "#ffffff",`

- **Line 19** (hex-color): `#ffffff`
  - 💡 Suggestion: `semanticTokens.textInverse`
  - Context: `bgPrimary: "#ffffff",`

- **Line 26** (hex-color): `#00A86B`
  - 💡 Suggestion: `colorTokens.jade[500]`
  - Context: `borderFocus: "#00A86B",`

- **Line 30** (hex-color): `#F0FDF4`
  - 💡 Suggestion: `colorTokens.success[50]`
  - Context: `successBg: "#F0FDF4",`

- **Line 45** (hex-color): `#00A86B`
  - 💡 Suggestion: `colorTokens.jade[500]`
  - Context: `primary: "#00A86B",`

- **Line 56** (rgba-color): `rgba(55,65,81,0.85)`
  - Context: `surfaceSubtleHover: "rgba(55,65,81,0.85)",`

- **Line 60** (hex-color): `#00A86B`
  - 💡 Suggestion: `colorTokens.jade[500]`
  - Context: `borderFocus: "#00A86B",`

- **Line 62** (hex-color): `#00A86B`
  - 💡 Suggestion: `colorTokens.jade[500]`
  - Context: `focusRing: "#00A86B",`

- **Line 66** (hex-color): `#78350F`
  - 💡 Suggestion: `colorTokens.amber[900]`
  - Context: `warningBg: "#78350F",`

- **Line 68** (hex-color): `#7F1D1D`
  - 💡 Suggestion: `colorTokens.red[900]`
  - Context: `errorBg: "#7F1D1D",`

- **Line 80** (hex-color): `#00A86B`
  - 💡 Suggestion: `colorTokens.jade[500]`
  - Context: `primaryHover: "#00A86B",`

- **Line 82** (hex-color): `#000000`
  - 💡 Suggestion: `black / semanticTokens.textPrimary`
  - Context: `textPrimary: "#000000",`

- **Line 85** (hex-color): `#ffffff`
  - 💡 Suggestion: `semanticTokens.textInverse`
  - Context: `textInverse: "#ffffff",`

- **Line 87** (hex-color): `#ffffff`
  - 💡 Suggestion: `semanticTokens.textInverse`
  - Context: `bgPrimary: "#ffffff",`

... and 52 more violations

### src/lib/colorGeneration.ts (53 violations)

- **Line 56** (hex-color): `#00A86B`
  - 💡 Suggestion: `colorTokens.jade[500]`
  - Context: `primary: '#00A86B',`

- **Line 57** (hex-color): `#1E293B`
  - 💡 Suggestion: `colorTokens.navy[800]`
  - Context: `secondary: '#1E293B',`

- **Line 59** (hex-color): `#F0FDF4`
  - 💡 Suggestion: `colorTokens.success[50]`
  - Context: `background: '#F0FDF4',`

- **Line 60** (hex-color): `#ffffff`
  - 💡 Suggestion: `semanticTokens.textInverse`
  - Context: `surface: "#ffffff",`

- **Line 61** (hex-color): `#052E16`
  - 💡 Suggestion: `colorTokens.jade[900]`
  - Context: `text: '#052E16',`

- **Line 65** (hex-color): `#FF6B6B`
  - Context: `secondary: '#FF6B6B',`

- **Line 66** (hex-color): `#00A86B`
  - 💡 Suggestion: `colorTokens.jade[500]`
  - Context: `accent: '#00A86B',`

- **Line 68** (hex-color): `#ffffff`
  - 💡 Suggestion: `semanticTokens.textInverse`
  - Context: `surface: "#ffffff",`

- **Line 69** (hex-color): `#4C1D95`
  - 💡 Suggestion: `colorTokens.violet[900]`
  - Context: `text: '#4C1D95',`

- **Line 72** (hex-color): `#009688`
  - Context: `primary: '#009688',`

- **Line 73** (hex-color): `#7CB342`
  - Context: `secondary: '#7CB342',`

- **Line 74** (hex-color): `#00A86B`
  - 💡 Suggestion: `colorTokens.jade[500]`
  - Context: `accent: '#00A86B',`

- **Line 75** (hex-color): `#F0F9FF`
  - Context: `background: '#F0F9FF',`

- **Line 76** (hex-color): `#ffffff`
  - 💡 Suggestion: `semanticTokens.textInverse`
  - Context: `surface: "#ffffff",`

- **Line 77** (hex-color): `#0F766E`
  - Context: `text: '#0F766E',`

... and 38 more violations

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

### src/styles/tailwind/auroraTheme.js (30 violations)

- **Line 10** (hex-color): `#FEF3C7`
  - 💡 Suggestion: `colorTokens.amber[100]`
  - Context: `"#FEF3C7 0%",`

- **Line 11** (hex-color): `#FFF7ED`
  - Context: `"#FFF7ED 50%",`

- **Line 12** (hex-color): `#FFE4E6`
  - Context: `"#FFE4E6 100%",`

- **Line 15** (hex-color): `#D1FAE5`
  - 💡 Suggestion: `colorTokens.jade[100]`
  - Context: `"#D1FAE5 0%",`

- **Line 16** (hex-color): `#ECFDF5`
  - 💡 Suggestion: `colorTokens.jade[50]`
  - Context: `"#ECFDF5 55%",`

- **Line 17** (hex-color): `#CCFBF1`
  - Context: `"#CCFBF1 100%",`

- **Line 20** (hex-color): `#E0E7FF`
  - Context: `"#E0E7FF 0%",`

- **Line 21** (hex-color): `#F0F9FF`
  - Context: `"#F0F9FF 55%",`

- **Line 22** (hex-color): `#F3E8FF`
  - 💡 Suggestion: `colorTokens.purple[100]`
  - Context: `"#F3E8FF 100%",`

- **Line 25** (hex-color): `#EDE9FE`
  - 💡 Suggestion: `colorTokens.violet[100]`
  - Context: `"#EDE9FE 0%",`

- **Line 26** (hex-color): `#FAF5FF`
  - 💡 Suggestion: `colorTokens.purple[50]`
  - Context: `"#FAF5FF 55%",`

- **Line 27** (hex-color): `#DBEAFE`
  - 💡 Suggestion: `colorTokens.blue[100]`
  - Context: `"#DBEAFE 100%",`

- **Line 30** (hex-color): `#CCFBF1`
  - Context: `"#CCFBF1 0%",`

- **Line 31** (hex-color): `#ECFDF5`
  - 💡 Suggestion: `colorTokens.jade[50]`
  - Context: `"#ECFDF5 55%",`

- **Line 32** (hex-color): `#D1FAE5`
  - 💡 Suggestion: `colorTokens.jade[100]`
  - Context: `"#D1FAE5 100%",`

... and 15 more violations

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



---

## Recommendations

### Immediate Actions (High Priority)

1. **Replace hardcoded hex colors** (654 violations)
   - Map to existing color tokens where possible
   - Add missing semantic tokens for common colors

2. **Standardize spacing** (89 violations)
   - Use spacing tokens (4px grid)
   - Replace all hardcoded px values

3. **Fix Tailwind arbitrary values** (74 violations)
   - Use Tailwind utility classes
   - Extend Tailwind config with design tokens

### Medium Priority

4. **Shadow standardization** (32 violations)
   - Define elevation tokens
   - Replace all box-shadow with tokens

5. **Border radius consistency** (37 violations)
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
