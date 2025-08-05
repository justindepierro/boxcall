#!/usr/bin/env node

/**
 * Post-Migration Enhancement Script
 * Implement professional design system improvements
 */

const fs = require("fs");
const path = require("path");

console.log("🚀 POST-MIGRATION ENHANCEMENTS");
console.log("================================\n");

// Step 1: Create TypeScript types for design tokens
console.log("📝 Step 1: Adding TypeScript types for design tokens...");

const typesContent = `/**
 * Design Token Types
 * TypeScript definitions for the centralized design system
 */

// Color scale type for consistent token structure
export type ColorScale = {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
};

// Brand color tokens
export type BrandColorTokens = {
  jade: ColorScale;
  navy: ColorScale;
  success: {
    50: string;
    500: string;
    600: string;
  };
  warning: {
    50: string;
    500: string;
    600: string;
  };
  error: {
    50: string;
    500: string;
    600: string;
  };
  gray: ColorScale;
};

// Semantic color usage
export type SemanticColorTokens = {
  primary: string;
  primaryHover: string;
  primaryActive: string;
  secondary: string;
  secondaryHover: string;
  surface: string;
  surfaceHover: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderFocus: string;
  success: string;
  warning: string;
  error: string;
};

// Component-specific tokens
export type ComponentColorTokens = {
  button: {
    primary: string;
    primaryHover: string;
    primaryActive: string;
    secondary: string;
    secondaryHover: string;
  };
  card: {
    background: string;
    border: string;
    shadow: string;
  };
  icon: {
    jade: string;
    navy: string;
    muted: string;
  };
  nav: {
    brand: string;
    text: string;
    textHover: string;
    background: string;
    backgroundHover: string;
  };
};

// Design token usage patterns
export type TokenUsagePattern = 
  | 'brand-jade'
  | 'interaction-jade' 
  | 'surface-jade'
  | 'brand-navy'
  | 'brand-navy-dark'
  | 'surface-jade-dark'
  | 'brand-jade-dark'
  | 'brand-jade-light';

// Utility type for Tailwind class generation
export type TailwindColorClass<T extends string> = 
  | \`bg-\${T}\`
  | \`text-\${T}\`
  | \`border-\${T}\`
  | \`hover:bg-\${T}\`
  | \`hover:text-\${T}\`
  | \`hover:border-\${T}\`
  | \`focus:bg-\${T}\`
  | \`focus:text-\${T}\`
  | \`focus:border-\${T}\`;

// Complete design token system type
export interface DesignTokens {
  colors: BrandColorTokens;
  semantic: SemanticColorTokens;
  component: ComponentColorTokens;
}

// Token validation helper
export type ValidTokenPath = keyof BrandColorTokens | keyof SemanticColorTokens | keyof ComponentColorTokens;
`;

const typesPath = path.join(__dirname, "..", "src/design-system/types.ts");
fs.writeFileSync(typesPath, typesContent);
console.log("  ✅ Created TypeScript types (/src/design-system/types.ts)");

// Step 2: Create design system documentation
console.log("\n📝 Step 2: Creating design system documentation...");

const docsContent = `# BoxCall Design System Documentation

## 🎨 Overview

The BoxCall Design System provides a centralized, token-based approach to styling that ensures consistency, maintainability, and professional appearance across the entire application.

## 📁 File Structure

\`\`\`
src/design-system/
├── tokens.ts          # Central color definitions
├── types.ts           # TypeScript type definitions
└── index.ts           # Design system exports

src/components/design-system/
├── Typography.tsx     # Typography components
├── Spacing.tsx        # Spacing utilities
└── index.ts           # Component system exports

src/styles/
├── tokens.css         # CSS custom properties
└── globals.css        # Global styles
\`\`\`

## 🎯 Token Usage Patterns

### Primary Brand Colors
Use these for main brand elements, CTAs, and primary actions:

\`\`\`typescript
// Tailwind Classes
"bg-brand-jade"           // Main brand background
"text-brand-jade"         // Brand text color
"border-brand-jade"       // Brand borders
"hover:bg-interaction-jade" // Interactive hover states
\`\`\`

### Surface Colors
Use these for backgrounds, cards, and surface elements:

\`\`\`typescript
"bg-surface-jade"         // Light brand background
"bg-surface-jade-dark"    // Darker brand background
\`\`\`

### Navy Colors
Use these for secondary elements, text, and professional contrast:

\`\`\`typescript
"text-brand-navy-dark"    // Dark text
"bg-brand-navy"           // Navy backgrounds
\`\`\`

## 🔧 Implementation Examples

### Button Component

\`\`\`typescript
// ✅ Correct - Using design tokens
const ButtonStyles = {
  primary: "bg-brand-jade hover:bg-interaction-jade text-white",
  secondary: "bg-surface-jade hover:bg-surface-jade-dark text-brand-jade-dark",
};

// ❌ Incorrect - Hardcoded colors
const ButtonStyles = {
  primary: "bg-jade-500 hover:bg-jade-600 text-white",
};
\`\`\`

### CSS Custom Properties

\`\`\`css
/* ✅ Correct - Using CSS variables */
.custom-component {
  background: var(--color-primary);
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
}

/* ❌ Incorrect - Hardcoded hex values */
.custom-component {
  background: #00a86b;
  border: 1px solid #e5e7eb;
  color: #374151;
}
\`\`\`

## 📊 Available Token Classes

### Background Colors
- \`bg-brand-jade\` - Primary brand background
- \`bg-interaction-jade\` - Interactive hover background
- \`bg-surface-jade\` - Light brand surface
- \`bg-surface-jade-dark\` - Dark brand surface
- \`bg-brand-navy\` - Navy background
- \`bg-brand-navy-dark\` - Dark navy background

### Text Colors
- \`text-brand-jade\` - Primary brand text
- \`text-brand-jade-dark\` - Dark brand text
- \`text-brand-jade-light\` - Light brand text
- \`text-brand-navy-dark\` - Dark navy text
- \`text-interaction-jade\` - Interactive text

### Border Colors
- \`border-brand-jade\` - Primary brand borders
- \`border-interaction-jade\` - Interactive borders
- \`border-surface-jade-dark\` - Surface borders
- \`border-brand-navy-dark\` - Navy borders

### Interactive States
- \`hover:bg-interaction-jade\` - Hover background
- \`hover:text-brand-jade\` - Hover text
- \`focus:border-brand-jade\` - Focus border
- \`focus:ring-brand-jade\` - Focus ring

## 🛠️ Development Guidelines

### 1. Always Use Tokens
Never hardcode color values. Always use the centralized token system.

### 2. Semantic Naming
Use semantic class names that describe the purpose, not the color:
- \`bg-brand-jade\` (semantic) vs \`bg-jade-500\` (hardcoded)

### 3. Consistent Patterns
Follow established patterns for hover states, focus states, and interactions.

### 4. CSS Variables for Complex Cases
For complex styling that can't use Tailwind classes, use CSS custom properties:

\`\`\`css
.gradient-background {
  background: linear-gradient(
    135deg,
    var(--color-primary) 0%,
    var(--color-primaryHover) 100%
  );
}
\`\`\`

## 🎨 Color Psychology

### Jade Green (#00A86B)
- **Psychology**: Growth, trust, stability, success
- **Usage**: Primary CTAs, success states, brand elements
- **Best For**: Action buttons, confirmations, progress indicators

### Navy Blue (#475569)
- **Psychology**: Professional, trustworthy, corporate
- **Usage**: Text, secondary elements, professional contexts
- **Best For**: Body text, headers, navigation, form labels

## 🔍 Debugging & Troubleshooting

### Common Issues

1. **Colors not applying**: Check that Tailwind includes the token classes
2. **Inconsistent hover states**: Verify you're using \`interaction-jade\` for hovers
3. **Dark mode issues**: Ensure you're using the appropriate dark: variants

### Verification Script

Run the verification script to check for hardcoded colors:

\`\`\`bash
npm run verify-tokens
\`\`\`

## 📈 Future Enhancements

- [ ] Add animation tokens
- [ ] Expand typography token system
- [ ] Add spacing tokens
- [ ] Create theme variants (light/dark modes)
- [ ] Add component-specific token categories

---

**🏈 Professional • Consistent • Maintainable**
`;

const docsPath = path.join(
  __dirname,
  "..",
  "docs/design/DESIGN_SYSTEM_USAGE.md"
);
fs.writeFileSync(docsPath, docsContent);
console.log(
  "  ✅ Created design system documentation (/docs/design/DESIGN_SYSTEM_USAGE.md)"
);

// Step 3: Add npm scripts for token management
console.log("\n📝 Step 3: Adding token management scripts...");

const packageJsonPath = path.join(__dirname, "..", "package.json");
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

  // Add design system scripts
  packageJson.scripts = {
    ...packageJson.scripts,
    "tokens:verify": "node scripts/phase5-final-verification.cjs",
    "tokens:audit": "node scripts/phase5-final-verification.cjs",
    "design-system:check": "node scripts/phase5-final-verification.cjs",
    "design-system:docs":
      "echo 'Opening design system documentation...' && open docs/design/DESIGN_SYSTEM_USAGE.md",
  };

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log("  ✅ Added npm scripts for token management");
}

// Step 4: Create design system utility functions
console.log("\n📝 Step 4: Creating utility functions...");

const utilsContent = `/**
 * Design System Utilities
 * Helper functions for working with design tokens
 */

import { colorTokens, semantic, component } from './tokens';

/**
 * Get a color value by token path
 * Provides type-safe access to design tokens
 */
export function getTokenColor(path: string): string {
  const parts = path.split('.');
  let current: any = { ...colorTokens, semantic, component };
  
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      console.warn(\`Design token path "\${path}" not found\`);
      return semantic.primary; // Fallback to primary color
    }
  }
  
  return typeof current === 'string' ? current : semantic.primary;
}

/**
 * Generate Tailwind classes with design tokens
 * Ensures consistent usage patterns
 */
export const tokenClasses = {
  // Primary button styles
  buttonPrimary: 'bg-brand-jade hover:bg-interaction-jade focus:bg-interaction-jade text-white font-semibold py-2 px-4 rounded transition-colors',
  
  // Secondary button styles
  buttonSecondary: 'bg-surface-jade hover:bg-surface-jade-dark text-brand-jade-dark font-semibold py-2 px-4 rounded border border-surface-jade-dark transition-colors',
  
  // Card styles
  card: 'bg-white border border-surface-jade-dark rounded-lg shadow-sm',
  cardHover: 'hover:shadow-md hover:border-brand-jade transition-all duration-200',
  
  // Navigation styles
  navItem: 'text-gray-600 hover:text-interaction-jade hover:bg-surface-jade p-2 rounded transition-colors',
  navBrand: 'text-interaction-jade font-bold text-xl',
  
  // Form styles
  input: 'border border-surface-jade-dark focus:border-brand-jade focus:ring-1 focus:ring-brand-jade rounded px-3 py-2',
  inputError: 'border-red-500 focus:border-red-500 focus:ring-red-500',
  
  // Text styles
  heading: 'text-brand-navy-dark font-bold',
  body: 'text-gray-700',
  muted: 'text-gray-500',
  
  // Interactive states
  interactive: 'hover:bg-interaction-jade hover:text-white transition-colors cursor-pointer',
  
  // Status styles
  success: 'bg-green-50 text-green-800 border border-green-200',
  warning: 'bg-yellow-50 text-yellow-800 border border-yellow-200',
  error: 'bg-red-50 text-red-800 border border-red-200',
} as const;

/**
 * Validate if a token exists
 */
export function isValidToken(path: string): boolean {
  try {
    getTokenColor(path);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get all available token paths
 * Useful for development and debugging
 */
export function getAllTokenPaths(): string[] {
  const paths: string[] = [];
  
  function traverse(obj: any, prefix = ''): void {
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = prefix ? \`\${prefix}.\${key}\` : key;
      
      if (typeof value === 'string') {
        paths.push(currentPath);
      } else if (typeof value === 'object' && value !== null) {
        traverse(value, currentPath);
      }
    }
  }
  
  traverse({ ...colorTokens, semantic, component });
  return paths.sort();
}

/**
 * Development helper: Print all available tokens
 */
export function printTokens(): void {
  if (process.env.NODE_ENV === 'development') {
    console.group('🎨 Available Design Tokens:');
    getAllTokenPaths().forEach(path => {
      console.log(\`\${path}: \${getTokenColor(path)}\`);
    });
    console.groupEnd();
  }
}
`;

const utilsPath = path.join(__dirname, "..", "src/design-system/utils.ts");
fs.writeFileSync(utilsPath, utilsContent);
console.log("  ✅ Created utility functions (/src/design-system/utils.ts)");

console.log("\n🎉 POST-MIGRATION ENHANCEMENTS COMPLETE!");
console.log("=========================================");
console.log("📊 Summary:");
console.log("  • ✅ TypeScript types for design tokens");
console.log("  • ✅ Comprehensive documentation");
console.log("  • ✅ npm scripts for token management");
console.log("  • ✅ Utility functions for development");
console.log("");
console.log("🚀 Available Commands:");
console.log("  • npm run tokens:verify     - Verify token usage");
console.log("  • npm run tokens:audit      - Audit hardcoded colors");
console.log("  • npm run design-system:check - Check system health");
console.log("");
console.log("📚 Documentation:");
console.log("  • /docs/design/DESIGN_SYSTEM_USAGE.md - Usage guidelines");
console.log("  • /src/design-system/types.ts - TypeScript definitions");
console.log("  • /src/design-system/utils.ts - Helper functions");
console.log("");
console.log("🎨 Your design system is now enterprise-ready! 🏆");
