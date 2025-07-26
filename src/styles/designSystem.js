/**
 * BoxCall Design System
 * ===================
 *
 * This file documents the standardized Tailwind CSS patterns and components
 * to ensure consistency across the application.
 */

// =============================================================================
// COLOR SYSTEM
// =============================================================================

/**
 * DESIGN TOKENS (CSS Custom Properties)
 * Use these instead of hardcoded Tailwind colors
 */
const DESIGN_TOKENS = {
  // Background Colors
  'bg-[var(--color-bg)]': 'Primary background',
  'bg-[var(--color-card-bg)]': 'Card/container background',
  'bg-[var(--color-sidebar)]': 'Sidebar background',

  // Text Colors
  'text-[var(--color-text)]': 'Primary text',
  'text-[var(--color-text-muted)]': 'Secondary/muted text',
  'text-[var(--color-text-inverted)]': 'Inverted text (on dark backgrounds)',

  // Interactive Colors
  'bg-[var(--color-accent)]': 'Primary action color',
  'border-[var(--color-border)]': 'Default border color',
  'bg-[var(--color-danger)]': 'Error/danger states',
  'bg-[var(--color-success)]': 'Success states',
  'bg-[var(--color-warning)]': 'Warning states',

  // State Colors
  'ring-[var(--color-accent)]': 'Focus rings',
  'border-[var(--color-accent)]': 'Focus borders',
};

/**
 * ❌ AVOID: Hardcoded Tailwind colors
 * bg-blue-600, text-gray-500, border-red-500
 *
 * ✅ USE: Design tokens
 * bg-[var(--color-accent)], text-[var(--color-text-muted)], border-[var(--color-danger)]
 */

// =============================================================================
// COMPONENT PATTERNS
// =============================================================================

/**
 * BUTTON STANDARDS
 */
const BUTTON_PATTERNS = {
  // ✅ Preferred: Use BaseButton component
  primary: 'BaseButton({ variant: "primary", size: "md" })',
  secondary: 'BaseButton({ variant: "secondary", size: "md" })',

  // ❌ Avoid: Manual button classes
  manual: 'bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700',
};

/**
 * FORM FIELD STANDARDS
 */
const FORM_PATTERNS = {
  // ✅ Preferred: Use FormInput component
  standardInput: 'FormInput({ name: "email", label: "Email", type: "email" })',

  // ❌ Avoid: Manual input styling
  manual: 'border border-gray-300 rounded px-3 py-2 focus:ring-2',
};

/**
 * LAYOUT PATTERNS
 */
const LAYOUT_PATTERNS = {
  // Container with proper spacing
  pageContainer: 'max-w-5xl mx-auto px-4 py-6',

  // Card container
  card: 'bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg p-4',

  // Grid layouts
  responsiveGrid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',

  // Flexbox patterns
  centerContent: 'flex items-center justify-center',
  spaceBetween: 'flex items-center justify-between',
  verticalStack: 'flex flex-col space-y-4',
  horizontalStack: 'flex items-center space-x-4',
};

/**
 * SPACING SYSTEM
 */
const SPACING_PATTERNS = {
  // Section spacing
  sectionGap: 'space-y-6 md:space-y-8',

  // Card spacing
  cardPadding: 'p-4 md:p-6',
  cardGap: 'space-y-4',

  // Form spacing
  formFieldGap: 'space-y-4',
  formSectionGap: 'space-y-6',

  // Button spacing
  buttonGroup: 'flex space-x-2',
  buttonStack: 'flex flex-col space-y-2',
};

/**
 * TYPOGRAPHY SYSTEM
 */
const TYPOGRAPHY_PATTERNS = {
  // Headers
  pageTitle: 'text-2xl md:text-3xl font-bold text-[var(--color-text)]',
  sectionTitle: 'text-lg md:text-xl font-semibold text-[var(--color-text)]',
  cardTitle: 'text-base font-medium text-[var(--color-text)]',

  // Body text
  bodyText: 'text-sm md:text-base text-[var(--color-text)]',
  mutedText: 'text-xs md:text-sm text-[var(--color-text-muted)]',

  // Form labels
  formLabel: 'block text-sm font-medium text-[var(--color-text)]',
  helpText: 'text-xs text-[var(--color-text-muted)]',
  errorText: 'text-xs text-[var(--color-danger)]',
};

// =============================================================================
// RESPONSIVE DESIGN PATTERNS
// =============================================================================

/**
 * BREAKPOINT USAGE
 */
const RESPONSIVE_PATTERNS = {
  // Mobile-first approach
  mobileFirst: 'text-sm md:text-base lg:text-lg',

  // Hide/show at breakpoints
  hideMobile: 'hidden md:block',
  hideDesktop: 'block md:hidden',

  // Grid responsiveness
  responsiveColumns: 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3',

  // Padding/margins
  responsiveSpacing: 'px-4 md:px-6 lg:px-8',
  responsiveGaps: 'gap-2 md:gap-4 lg:gap-6',
};

// =============================================================================
// ACCESSIBILITY PATTERNS
// =============================================================================

/**
 * FOCUS STATES
 */
const FOCUS_PATTERNS = {
  // Standard focus ring
  focusRing: 'focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2',

  // Focus within containers
  focusWithin: 'focus-within:ring-2 focus-within:ring-[var(--color-accent)]',

  // Visible focus for keyboard navigation
  focusVisible: 'focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]',
};

/**
 * CONTRAST & READABILITY
 */
const ACCESSIBILITY_PATTERNS = {
  // High contrast text
  highContrast: 'text-[var(--color-text)] bg-[var(--color-bg)]',

  // Interactive states
  hoverStates: 'hover:bg-[var(--color-accent)] hover:text-white transition-colors',

  // Screen reader content
  srOnly: 'sr-only',

  // ARIA patterns
  ariaDescribed: 'aria-describedby="help-text"',
};

// =============================================================================
// ANIMATION PATTERNS
// =============================================================================

/**
 * TRANSITION STANDARDS
 */
const ANIMATION_PATTERNS = {
  // Standard transitions
  default: 'transition-colors duration-200',
  smooth: 'transition-all duration-300 ease-in-out',

  // Loading states
  pulse: 'animate-pulse',
  spin: 'animate-spin',

  // Hover effects
  scaleHover: 'transform hover:scale-105 transition-transform',
  shadowHover: 'hover:shadow-md transition-shadow',
};

// =============================================================================
// COMMON ANTI-PATTERNS
// =============================================================================

/**
 * ❌ THINGS TO AVOID
 */
const ANTI_PATTERNS = {
  // Don't use hardcoded colors
  hardcodedColors: 'bg-blue-500 text-red-600',

  // Don't use magic numbers
  magicNumbers: 'w-[247px] h-[83px]',

  // Don't mix measurement units
  mixedUnits: 'p-4 m-[12px]',

  // Don't use overly specific selectors
  overlySpecific: 'div.card.active.primary.large',

  // Don't ignore responsive design
  noResponsive: 'text-xl p-8', // Should be: 'text-base md:text-xl p-4 md:p-8'

  // Don't ignore accessibility
  noAccessibility: '<button></button>', // Should have aria-label, focus states
};

/**
 * ✅ BEST PRACTICES
 */
const BEST_PRACTICES = {
  // Use component system
  useComponents: 'Always prefer BaseButton, FormInput, etc. over manual classes',

  // Use design tokens
  useTokens: 'Use CSS custom properties for colors and spacing',

  // Mobile-first responsive
  mobileFirst: 'Start with mobile styles, enhance for larger screens',

  // Consistent spacing
  spacingSystem: 'Use Tailwind spacing scale (4, 8, 16, 24, 32, etc.)',

  // Semantic HTML
  semanticHtml: 'Use proper HTML elements with ARIA attributes',

  // Performance
  performance: 'Keep bundle size small, use PurgeCSS effectively',
};

export {
  DESIGN_TOKENS,
  BUTTON_PATTERNS,
  FORM_PATTERNS,
  LAYOUT_PATTERNS,
  SPACING_PATTERNS,
  TYPOGRAPHY_PATTERNS,
  RESPONSIVE_PATTERNS,
  FOCUS_PATTERNS,
  ACCESSIBILITY_PATTERNS,
  ANIMATION_PATTERNS,
  ANTI_PATTERNS,
  BEST_PRACTICES,
};
