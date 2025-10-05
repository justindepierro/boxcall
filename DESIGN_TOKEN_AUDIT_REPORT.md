# Design Token Audit Report

**Generated**: 2025-10-05T13:20:36.735Z  
**Total Violations**: 1554

---

## Summary by Type

| Type | Count | Severity |
|------|-------|----------|
| hex-color | 1087 | 🔴 High |
| rgba-color | 161 | 🔴 High |
| px-spacing | 89 | 🟡 Medium |
| tailwind-spacing | 76 | 🟡 Medium |
| rgb-color | 71 | ⚪ Info |
| border-radius | 37 | 🟢 Low |
| box-shadow | 32 | 🟡 Medium |
| tailwind-hex | 1 | 🔴 High |

---

## Top 20 Files by Violation Count

1. **src/design-system/tokens.ts**: 169 violations
2. **src/styles/generated-themes.css**: 140 violations
3. **src/themes/registry.ts**: 132 violations
4. **src/index.css**: 124 violations
5. **src/styles/team-dashboard.css**: 100 violations
6. **src/hooks/useColorTheme.ts**: 64 violations
7. **src/lib/colorGeneration.ts**: 62 violations
8. **src/styles/mobile.css**: 41 violations
9. **src/styles/tailwind/auroraTheme.js**: 30 violations
10. **src/components/ui/Badge/Badge.css**: 28 violations
11. **src/components/playbook/diagram-v2/FieldCanvas.tsx**: 25 violations
12. **src/styles/responsive-dashboard.css**: 25 violations
13. **src/themes/dark.ts**: 24 violations
14. **src/themes/highContrast.ts**: 24 violations
15. **src/themes/light.ts**: 24 violations
16. **src/styles/generated-tokens.css**: 22 violations
17. **src/components/playbook/diagram-v2/components/FieldPlayers.tsx**: 20 violations
18. **src/components/calendar/BoxCallCalendar.css**: 18 violations
19. **src/components/pdf/PracticeScriptPDF.tsx**: 18 violations
20. **src/components/dashboard/AdaptiveChart.tsx**: 16 violations

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

### src/themes/registry.ts (132 violations)

- **Line 10** (hex-color): `#00A86B`
  - 💡 Suggestion: `colorTokens.jade[500]`
  - Context: `primary: "#00A86B",`

- **Line 11** (hex-color): `#047857`
  - 💡 Suggestion: `colorTokens.jade[600]`
  - Context: `primaryHover: "#047857",`

- **Line 12** (hex-color): `#065F46`
  - 💡 Suggestion: `colorTokens.jade[700]`
  - Context: `primaryActive: "#065F46",`

- **Line 13** (hex-color): `#111827`
  - 💡 Suggestion: `colorTokens.gray[900]`
  - Context: `textPrimary: "#111827",`

- **Line 14** (hex-color): `#4B5563`
  - 💡 Suggestion: `colorTokens.gray[600]`
  - Context: `textSecondary: "#4B5563",`

- **Line 15** (hex-color): `#6B7280`
  - 💡 Suggestion: `colorTokens.gray[500]`
  - Context: `textMuted: "#6B7280",`

- **Line 16** (hex-color): `#FFFFFF`
  - 💡 Suggestion: `semanticTokens.textInverse`
  - Context: `textInverse: "#FFFFFF",`

- **Line 17** (hex-color): `#047857`
  - 💡 Suggestion: `colorTokens.jade[600]`
  - Context: `textBrand: "#047857",`

- **Line 18** (hex-color): `#FFFFFF`
  - 💡 Suggestion: `semanticTokens.textInverse`
  - Context: `bgPrimary: "#FFFFFF",`

- **Line 19** (hex-color): `#F9FAFB`
  - 💡 Suggestion: `colorTokens.gray[50]`
  - Context: `bgSecondary: "#F9FAFB",`

- **Line 20** (hex-color): `#F3F4F6`
  - 💡 Suggestion: `colorTokens.gray[100]`
  - Context: `bgMuted: "#F3F4F6",`

- **Line 21** (hex-color): `#F3F4F6`
  - 💡 Suggestion: `colorTokens.gray[100]`
  - Context: `surfaceSubtleHover: "#F3F4F6",`

- **Line 22** (hex-color): `#111827`
  - 💡 Suggestion: `colorTokens.gray[900]`
  - Context: `surfaceInverse: "#111827",`

- **Line 23** (hex-color): `#374151`
  - 💡 Suggestion: `colorTokens.gray[700]`
  - Context: `surfaceInverseAlt: "#374151",`

- **Line 24** (hex-color): `#E5E7EB`
  - 💡 Suggestion: `colorTokens.gray[200]`
  - Context: `border: "#E5E7EB",`

... and 117 more violations

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

### src/hooks/useColorTheme.ts (64 violations)

- **Line 40** (hex-color): `#00A86B`
  - 💡 Suggestion: `colorTokens.jade[500]`
  - Context: `primary: '#00A86B',`

- **Line 41** (hex-color): `#1E293B`
  - 💡 Suggestion: `colorTokens.navy[800]`
  - Context: `secondary: '#1E293B',`

- **Line 42** (hex-color): `#7C3AED`
  - 💡 Suggestion: `colorTokens.purple[700]`
  - Context: `accent: '#7C3AED',`

- **Line 43** (hex-color): `#F8FAFC`
  - 💡 Suggestion: `colorTokens.navy[50]`
  - Context: `background: '#F8FAFC',`

- **Line 44** (hex-color): `#FFFFFF`
  - 💡 Suggestion: `semanticTokens.textInverse`
  - Context: `surface: '#FFFFFF',`

- **Line 45** (hex-color): `#1E293B`
  - 💡 Suggestion: `colorTokens.navy[800]`
  - Context: `text: '#1E293B',`

- **Line 46** (hex-color): `#22C55E`
  - 💡 Suggestion: `colorTokens.success[500]`
  - Context: `success: '#22C55E',`

- **Line 47** (hex-color): `#F59E0B`
  - 💡 Suggestion: `colorTokens.warning[500]`
  - Context: `warning: '#F59E0B',`

- **Line 48** (hex-color): `#EF4444`
  - 💡 Suggestion: `colorTokens.error[500]`
  - Context: `error: '#EF4444',`

- **Line 49** (hex-color): `#3B82F6`
  - 💡 Suggestion: `colorTokens.blue[500]`
  - Context: `info: '#3B82F6',`

- **Line 111** (hex-color): `#22C55E`
  - 💡 Suggestion: `colorTokens.success[500]`
  - Context: `primary: '#22C55E', // Green for trust`

- **Line 112** (hex-color): `#F0FDF4`
  - 💡 Suggestion: `colorTokens.success[50]`
  - Context: `background: '#F0FDF4',`

- **Line 113** (hex-color): `#DCFCE7`
  - Context: `surface: '#DCFCE7',`

- **Line 119** (hex-color): `#EF4444`
  - 💡 Suggestion: `colorTokens.error[500]`
  - Context: `primary: '#EF4444', // Red for energy`

- **Line 120** (hex-color): `#F59E0B`
  - 💡 Suggestion: `colorTokens.warning[500]`
  - Context: `accent: '#F59E0B', // Orange accent`

... and 49 more violations

### src/lib/colorGeneration.ts (62 violations)

- **Line 54** (hex-color): `#00A86B`
  - 💡 Suggestion: `colorTokens.jade[500]`
  - Context: `primary: '#00A86B',`

- **Line 55** (hex-color): `#1E293B`
  - 💡 Suggestion: `colorTokens.navy[800]`
  - Context: `secondary: '#1E293B',`

- **Line 56** (hex-color): `#7C3AED`
  - 💡 Suggestion: `colorTokens.purple[700]`
  - Context: `accent: '#7C3AED',`

- **Line 57** (hex-color): `#F0FDF4`
  - 💡 Suggestion: `colorTokens.success[50]`
  - Context: `background: '#F0FDF4',`

- **Line 58** (hex-color): `#FFFFFF`
  - 💡 Suggestion: `semanticTokens.textInverse`
  - Context: `surface: '#FFFFFF',`

- **Line 59** (hex-color): `#052E16`
  - 💡 Suggestion: `colorTokens.jade[900]`
  - Context: `text: '#052E16',`

- **Line 62** (hex-color): `#7C3AED`
  - 💡 Suggestion: `colorTokens.purple[700]`
  - Context: `primary: '#7C3AED',`

- **Line 63** (hex-color): `#FF6B6B`
  - Context: `secondary: '#FF6B6B',`

- **Line 64** (hex-color): `#00A86B`
  - 💡 Suggestion: `colorTokens.jade[500]`
  - Context: `accent: '#00A86B',`

- **Line 65** (hex-color): `#F5F3FF`
  - 💡 Suggestion: `colorTokens.violet[50]`
  - Context: `background: '#F5F3FF',`

- **Line 66** (hex-color): `#FFFFFF`
  - 💡 Suggestion: `semanticTokens.textInverse`
  - Context: `surface: '#FFFFFF',`

- **Line 67** (hex-color): `#4C1D95`
  - 💡 Suggestion: `colorTokens.violet[900]`
  - Context: `text: '#4C1D95',`

- **Line 70** (hex-color): `#009688`
  - Context: `primary: '#009688',`

- **Line 71** (hex-color): `#7CB342`
  - Context: `secondary: '#7CB342',`

- **Line 72** (hex-color): `#00A86B`
  - 💡 Suggestion: `colorTokens.jade[500]`
  - Context: `accent: '#00A86B',`

... and 47 more violations

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



---

## Recommendations

### Immediate Actions (High Priority)

1. **Replace hardcoded hex colors** (1087 violations)
   - Map to existing color tokens where possible
   - Add missing semantic tokens for common colors

2. **Standardize spacing** (89 violations)
   - Use spacing tokens (4px grid)
   - Replace all hardcoded px values

3. **Fix Tailwind arbitrary values** (77 violations)
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
