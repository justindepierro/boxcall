/**
 * BoxCall Design Tokens - Single Source of Truth
 *
 * Centralized design system with complete color, spacing, typography tokens
 * All components should import from this file, never hardcode values
 */

// ============================================================================
// COLOR TOKENS - The Only Color Definitions
// ============================================================================

export const colorTokens = {
  // Primary Brand - Jade Green System
  jade: {
    50: "#ECFDF5",
    100: "#D1FAE5",
    200: "#A7F3D0",
    300: "#6EE7B7",
    400: "#34D399",
    500: "#00A86B", // PRIMARY brand color
    600: "#047857", // MAIN interaction color (hover, focus, icons)
    700: "#065F46",
    800: "#064E3B",
    900: "#052E16",
  },

  // Secondary Brand - Navy Blue System
  navy: {
    50: "#F8FAFC",
    100: "#F1F5F9",
    200: "#E2E8F0",
    300: "#CBD5E1",
    400: "#94A3B8",
    500: "#64748B",
    600: "#475569",
    700: "#334155",
    800: "#1E293B",
    900: "#0F172A", // PRIMARY dark color
  },

  // Semantic Colors
  success: {
    50: "#F0FDF4",
    500: "#22C55E",
    600: "#16A34A",
    700: "#15803D", // Added missing 700 shade
  },

  warning: {
    50: "#FFFBEB",
    500: "#F59E0B",
    600: "#D97706",
    700: "#B45309", // Added missing 700 shade
  },

  error: {
    50: "#FEF2F2",
    500: "#EF4444",
    600: "#DC2626",
    700: "#B91C1C", // Added missing 700 shade
  },

  // Neutral System
  gray: {
    50: "#F9FAFB",
    100: "#F3F4F6",
    200: "#E5E7EB",
    300: "#D1D5DB",
    400: "#9CA3AF",
    500: "#6B7280",
    600: "#4B5563",
    700: "#374151",
    800: "#1F2937",
    900: "#111827",
  },

  // Blue System - Links, Actions, Interactive Elements
  blue: {
    50: "#EFF6FF",
    100: "#DBEAFE",
    200: "#BFDBFE",
    300: "#93C5FD",
    400: "#60A5FA",
    500: "#3B82F6", // PRIMARY interactive blue (66 occurrences in audit!)
    600: "#2563EB", // Links, primary actions (48 occurrences!)
    700: "#1D4ED8",
    800: "#1E40AF",
    900: "#1E3A8A",
  },

  // Cyan System - Highlights, Selections, Focus States
  cyan: {
    50: "#ECFEFF",
    100: "#CFFAFE",
    200: "#A5F3FC",
    300: "#67E8F9",
    400: "#22D3EE", // Highlight color (42 occurrences in audit!)
    500: "#06B6D4",
    600: "#0891B2",
    700: "#0E7490",
    800: "#155E75",
    900: "#164E63",
  },

  // Amber System - Warnings, Selections, Active States
  amber: {
    50: "#FFFBEB",
    100: "#FEF3C7",
    200: "#FDE68A",
    300: "#FCD34D",
    400: "#FBBF24", // Selection highlight (118 occurrences! 🔥 Top hardcoded color!)
    500: "#F59E0B", // Warning states (54 occurrences!)
    600: "#D97706",
    700: "#B45309",
    800: "#92400E",
    900: "#78350F",
  },

  // Emerald System - Success States, Positive Actions
  emerald: {
    50: "#ECFDF5",
    100: "#D1FAE5",
    200: "#A7F3D0",
    300: "#6EE7B7",
    400: "#34D399",
    500: "#10B981", // Success indicators (28 occurrences!)
    600: "#059669",
    700: "#047857",
    800: "#065F46",
    900: "#064E3B",
  },

  // Purple System - Electric Theme, Premium Features
  purple: {
    50: "#FAF5FF",
    100: "#F3E8FF",
    200: "#E9D5FF",
    300: "#D8B4FE",
    400: "#C084FC",
    500: "#A855F7",
    600: "#9333EA",
    700: "#7C3AED", // Electric accent (24 occurrences!)
    800: "#6B21A8",
    900: "#581C87",
  },

  // Violet System - Alternative Purple Tones
  violet: {
    50: "#F5F3FF",
    100: "#EDE9FE",
    200: "#DDD6FE",
    300: "#C4B5FD",
    400: "#A78BFA",
    500: "#8B5CF6", // Premium features
    600: "#7C3AED",
    700: "#6D28D9",
    800: "#5B21B6",
    900: "#4C1D95",
  },

  // Red System - Extended for Defensive Players, Alerts
  red: {
    50: "#FEF2F2",
    100: "#FEE2E2",
    200: "#FECACA",
    300: "#FCA5A5",
    400: "#F87171",
    500: "#EF4444",
    600: "#DC2626",
    700: "#B91C1C", // Defensive player color (15 occurrences!)
    800: "#991B1B",
    900: "#7F1D1D",
  },

  // Text colors
  text: {
    primary: "#111827", // gray-900
    secondary: "#6B7280", // gray-500
    muted: "#9CA3AF", // gray-400
  },
} as const;

// ============================================================================
// SEMANTIC TOKEN MAPPING - Business Logic Colors
// ============================================================================

export const semanticTokens = {
  // Interactive states
  primary: colorTokens.jade[500],
  primaryHover: colorTokens.jade[600],
  primaryActive: colorTokens.jade[700],

  secondary: colorTokens.navy[500],
  secondaryHover: colorTokens.navy[600],
  secondaryActive: colorTokens.navy[700],

  // Text hierarchy
  textPrimary: colorTokens.gray[900],
  textSecondary: colorTokens.gray[600],
  textMuted: colorTokens.gray[500],
  textInverse: "#FFFFFF",
  textBrand: colorTokens.jade[600],

  // Backgrounds
  bgPrimary: "#FFFFFF",
  bgSecondary: colorTokens.gray[50],
  bgMuted: colorTokens.gray[100],
  bgBrand: colorTokens.jade[50],
  bgNavy: colorTokens.navy[50],
  surfaceSubtleHover: colorTokens.gray[100],
  surfaceInverse: colorTokens.gray[900],
  surfaceInverseAlt: colorTokens.gray[700],

  // Borders & Focus
  border: colorTokens.gray[200],
  borderFocus: colorTokens.jade[500],
  borderError: colorTokens.error[500],
  focusRing: colorTokens.jade[600],

  // Status states
  success: colorTokens.success[500],
  successBg: colorTokens.success[50],
  warning: colorTokens.warning[500],
  warningBg: colorTokens.warning[50],
  error: colorTokens.error[500],
  errorBg: colorTokens.error[50],
  info: colorTokens.blue[500], // Info status (for info badges, alerts)
  infoBg: colorTokens.blue[50], // Info background (12 occurrences)

  // Links & Interactive Elements
  linkColor: colorTokens.blue[600], // Primary link color
  linkHoverColor: colorTokens.blue[700], // Link hover state
  linkVisitedColor: colorTokens.purple[700], // Visited link color

  // Highlights & Selections
  highlightColor: colorTokens.amber[400], // Selection highlight
  highlightBg: colorTokens.amber[50], // Highlight background
  selectionColor: colorTokens.cyan[400], // Active selection
  selectionBg: colorTokens.cyan[50], // Selection background
  selectionBorder: colorTokens.amber[400], // Selection border (118 occurrences!)

  // Diagram-Specific Colors
  diagram: {
    // Player colors
    offensivePlayer: colorTokens.blue[600], // Offensive player (blue)
    offensivePlayerAlt: colorTokens.blue[900], // Alternative offensive (#1e3a8a)
    defensivePlayer: colorTokens.red[700], // Defensive player (red)
    defensivePlayerAlt: colorTokens.red[600], // Alternative defensive
    specialTeamsPlayer: colorTokens.amber[500], // Special teams

    // Route colors
    routeColor: colorTokens.emerald[500], // Route paths (green)
    routeColorAlt: colorTokens.blue[600], // Alternative route color
    routeStart: colorTokens.emerald[400], // Route start point
    routeEnd: colorTokens.amber[400], // Route end point

    // Annotation colors
    annotationColor: colorTokens.gray[900], // Default annotation color
    annotationHighlight: colorTokens.cyan[400], // Highlighted annotation
    annotationConnector: colorTokens.blue[500], // Connector lines
    annotationSelection: colorTokens.blue[500], // Selected annotation

    // Guide & Grid colors
    guideColor: colorTokens.success[500], // Alignment guides (#22c55e)
    gridColor: colorTokens.gray[200], // Grid lines
    gridColorDark: colorTokens.gray[700], // Dark theme grid

    // Field colors
    fieldBackground: colorTokens.gray[50], // Light field background
    fieldBackgroundDark: colorTokens.gray[900], // Dark field background
    fieldBorder: colorTokens.jade[700], // Field borders
    fieldZone: colorTokens.jade[800], // End zones

    // Minimap colors
    minimapBorder: colorTokens.amber[400], // Minimap viewport border
    minimapBackground: "#FFFFFF", // Minimap background
  },

  // Football-specific
  boxcallBrand: colorTokens.jade[600], // For BoxCall icons/elements
  coachAuthority: colorTokens.navy[600], // For coach-level elements
} as const;

// ============================================================================
// FEATURE HIGHLIGHT TOKENS - Strategic color accents for feature visibility
// ============================================================================

/**
 * Feature highlight tokens for drawing attention to key features and information.
 * These tokens implement the color enhancement strategy to maintain clean green/white
 * branding while adding tasteful color accents that highlight the app's rich features.
 */
export const featureTokens = {
  // Stats Card Backgrounds - Gradient backgrounds for visual differentiation
  stats: {
    totalBg: "bg-gradient-to-br from-navy-50 to-navy-100", // Total count (navy theme)
    totalBorder: colorTokens.navy[200],
    totalAccent: colorTokens.navy[600],
    
    activeBg: "bg-gradient-to-br from-emerald-50 to-emerald-100", // Active items (success)
    activeBorder: colorTokens.emerald[200],
    activeAccent: colorTokens.emerald[600],
    
    filteredBg: "bg-gradient-to-br from-blue-50 to-blue-100", // Filtered view (info)
    filteredBorder: colorTokens.blue[200],
    filteredAccent: colorTokens.blue[600],
    
    selectedBg: "bg-gradient-to-br from-amber-50 to-amber-100", // Selected items (attention)
    selectedBorder: colorTokens.amber[200],
    selectedAccent: colorTokens.amber[600],
  },

  // Badge Gradients - Enhanced badges with gradient backgrounds
  badges: {
    jerseyFrom: colorTokens.jade[600],    // Jersey badge gradient start
    jerseyTo: colorTokens.jade[700],      // Jersey badge gradient end
    
    positionFrom: colorTokens.blue[500],  // Position badge gradient start
    positionTo: colorTokens.blue[600],    // Position badge gradient end
    
    gradeFrom: colorTokens.purple[500],   // Grade badge gradient start
    gradeTo: colorTokens.purple[600],     // Grade badge gradient end
    
    activeFrom: colorTokens.emerald[500], // Active status gradient start
    activeTo: colorTokens.emerald[600],   // Active status gradient end
    
    inactiveFrom: colorTokens.red[500],   // Inactive status gradient start
    inactiveTo: colorTokens.red[600],     // Inactive status gradient end
  },

  // Filter Indicators - Color-coded active filters
  filters: {
    positionActive: colorTokens.blue[100],    // Position filter active background
    positionBorder: colorTokens.blue[400],    // Position filter border
    positionText: colorTokens.blue[700],      // Position filter text
    
    gradeActive: colorTokens.purple[100],     // Grade filter active background
    gradeBorder: colorTokens.purple[400],     // Grade filter border
    gradeText: colorTokens.purple[700],       // Grade filter text
    
    anyActive: colorTokens.amber[100],        // Any active filter highlight
    clearHover: colorTokens.amber[600],       // Clear filters button hover
  },

  // Interactive States - Hover, focus, and active states
  interactive: {
    hoverBg: colorTokens.cyan[50],            // Subtle hover background
    hoverBorder: colorTokens.cyan[300],       // Hover border color
    hoverGlow: colorTokens.jade[500],         // Glow effect color (use with opacity)
    
    focusRing: colorTokens.jade[500],         // Focus ring color
    focusRingOffset: "#FFFFFF",               // Focus ring offset color
    
    activeBg: colorTokens.cyan[100],          // Active/pressed background
    activeBorder: colorTokens.cyan[500],      // Active border color
    
    selectedBorder: colorTokens.cyan[400],    // Selected item border
    selectedGlow: colorTokens.cyan[300],      // Selected item glow
  },

  // Action Buttons - Color hierarchy for button types
  actions: {
    primaryBg: colorTokens.jade[600],         // Primary action (brand)
    primaryHover: colorTokens.jade[700],      // Primary hover
    primaryText: "#FFFFFF",                    // Primary text
    
    secondaryBg: colorTokens.blue[600],       // Secondary action (info)
    secondaryHover: colorTokens.blue[700],    // Secondary hover
    secondaryText: "#FFFFFF",                  // Secondary text
    
    attentionBg: colorTokens.amber[500],      // Attention action (highlight)
    attentionHover: colorTokens.amber[600],   // Attention hover
    attentionText: colorTokens.gray[900],     // Attention text (dark for contrast)
    
    destructiveBg: colorTokens.red[600],      // Destructive action (danger)
    destructiveHover: colorTokens.red[700],   // Destructive hover
    destructiveText: "#FFFFFF",                // Destructive text
  },

  // Playbook Feature Colors - Color-coded playbook elements
  playbook: {
    // Formation type backgrounds
    offensiveBg: "bg-gradient-to-br from-blue-50 to-blue-100",
    offensiveBorder: colorTokens.blue[300],
    offensiveAccent: colorTokens.blue[600],
    
    defensiveBg: "bg-gradient-to-br from-red-50 to-red-100",
    defensiveBorder: colorTokens.red[300],
    defensiveAccent: colorTokens.red[600],
    
    specialBg: "bg-gradient-to-br from-amber-50 to-amber-100",
    specialBorder: colorTokens.amber[300],
    specialAccent: colorTokens.amber[600],
    
    // Play category badges
    runPlayBg: colorTokens.emerald[100],
    runPlayText: colorTokens.emerald[700],
    
    passPlayBg: colorTokens.blue[100],
    passPlayText: colorTokens.blue[700],
    
    trickPlayBg: colorTokens.purple[100],
    trickPlayText: colorTokens.purple[700],
    
    // Canvas tool colors
    routeTool: colorTokens.emerald[500],
    playerTool: colorTokens.blue[500],
    annotationTool: colorTokens.amber[500],
    formationTool: colorTokens.purple[500],
  },

  // Premium Feature Indicators - Special/premium feature highlights
  premium: {
    bg: colorTokens.purple[50],
    border: colorTokens.purple[300],
    accent: colorTokens.purple[600],
    text: colorTokens.purple[700],
    glow: colorTokens.purple[400],
  },

  // Achievement/Success Indicators - Positive feedback colors
  achievement: {
    bg: colorTokens.emerald[50],
    border: colorTokens.emerald[300],
    accent: colorTokens.emerald[600],
    text: colorTokens.emerald[700],
    glow: colorTokens.emerald[400],
  },
} as const;

// ============================================================================
// TYPOGRAPHY TOKENS
// ============================================================================

export const typographyTokens = {
  fontFamily: {
    display: ["Bebas Neue", "system-ui", "sans-serif"],
    interface: ["Inter", "system-ui", "sans-serif"],
    mono: ["JetBrains Mono", "Consolas", "monospace"],
  },

  fontSize: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
  },

  fontWeight: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },

  // Line height scale for vertical rhythm
  lineHeight: {
    none: "1",
    tight: "1.25",
    snug: "1.375",
    normal: "1.5",
    relaxed: "1.625",
    loose: "2",
  },

  // Letter spacing scale for typography fine-tuning
  letterSpacing: {
    tighter: "-0.05em",
    tight: "-0.025em",
    normal: "0",
    wide: "0.025em",
    wider: "0.05em",
    widest: "0.1em",
  },
} as const;

// Semantic typography tokens for common patterns
export const semanticTypographyTokens = {
  // Heading typography
  headingLineHeight: typographyTokens.lineHeight.tight, // 1.25
  headingLetterSpacing: typographyTokens.letterSpacing.tight, // -0.025em

  // Body text typography
  bodyLineHeight: typographyTokens.lineHeight.normal, // 1.5
  bodyLetterSpacing: typographyTokens.letterSpacing.normal, // 0

  // Caption/small text typography
  captionLineHeight: typographyTokens.lineHeight.snug, // 1.375
  captionLetterSpacing: typographyTokens.letterSpacing.normal, // 0

  // Display/hero text typography
  displayLineHeight: typographyTokens.lineHeight.none, // 1
  displayLetterSpacing: typographyTokens.letterSpacing.tighter, // -0.05em

  // Mobile-optimized typography tokens
  // These are specifically designed for mobile readability and touch interfaces
  mobileHero: {
    fontSize: "1.75rem", // 28px - Hero headlines on mobile
    lineHeight: "2rem", // 32px
    fontWeight: "700",
    letterSpacing: "-0.02em",
  },
  mobileH1: {
    fontSize: "1.5rem", // 24px - Main page titles
    lineHeight: "1.75rem", // 28px
    fontWeight: "600",
    letterSpacing: "-0.01em",
  },
  mobileH2: {
    fontSize: "1.25rem", // 20px - Section titles
    lineHeight: "1.5rem", // 24px
    fontWeight: "600",
    letterSpacing: "0",
  },
  mobileH3: {
    fontSize: "1.125rem", // 18px - Card titles, subsection headers
    lineHeight: "1.375rem", // 22px
    fontWeight: "600",
    letterSpacing: "0",
  },
  mobileBody: {
    fontSize: "1rem", // 16px - Body text (NEVER smaller!)
    lineHeight: "1.5rem", // 24px
    fontWeight: "400",
    letterSpacing: "0",
  },
  mobileSmall: {
    fontSize: "0.875rem", // 14px - Metadata, labels
    lineHeight: "1.25rem", // 20px
    fontWeight: "400",
    letterSpacing: "0",
  },
  mobileTiny: {
    fontSize: "0.75rem", // 12px - Minimum size (timestamps, fine print)
    lineHeight: "1rem", // 16px
    fontWeight: "400",
    letterSpacing: "0",
  },
} as const;

// ============================================================================
// ANIMATION TOKENS - Duration, Easing, Transitions
// ============================================================================

export const animationTokens = {
  // Duration scale - semantic names for animation timing
  duration: {
    instant: "75ms", // Press/snap interactions (< 100ms feels instant)
    quick: "150ms", // Hover states, quick transitions (standard quick)
    smooth: "300ms", // Smooth animations (standard smooth)
    confident: "400ms", // Meaningful transitions (feels deliberate)
    deliberate: "600ms", // Intentional, noticeable changes (user waits)
  },

  // Timing functions - cubic-bezier curves for different feels
  timing: {
    // Standard easing curves
    linear: "linear",
    easeIn: "cubic-bezier(0.4, 0, 1, 1)", // Slow start, fast end
    easeOut: "cubic-bezier(0, 0, 0.2, 1)", // Fast start, slow end (most natural)
    easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)", // Slow start & end

    // Custom BoxCall curves
    squareEase: "cubic-bezier(0.4, 0, 0.2, 1)", // Smooth, professional
    squareSnap: "cubic-bezier(0.4, 0, 1, 1)", // Snappy exit
    squarePunch: "cubic-bezier(0.4, 0, 0.6, 1)", // Punchy feel
    squareBounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)", // Bounce effect (use sparingly)
  },

  // Transition presets - common animation combinations
  transition: {
    fast: "150ms ease-out", // Quick transitions
    normal: "300ms ease-out", // Standard transitions
    slow: "500ms ease-out", // Slow transitions
  },
} as const;

// Semantic animation tokens for common use cases
export const semanticAnimationTokens = {
  // Interaction animations
  hoverDuration: animationTokens.duration.quick, // 150ms
  hoverTiming: animationTokens.timing.easeOut,
  hoverTransition: animationTokens.transition.fast, // 150ms ease-out

  pressDuration: animationTokens.duration.instant, // 75ms
  pressTiming: animationTokens.timing.squareSnap,
  pressTransition: "75ms cubic-bezier(0.4, 0, 1, 1)", // Instant snap

  // State change animations
  baseDuration: animationTokens.duration.smooth, // 300ms
  baseTiming: animationTokens.timing.squareEase,
  baseTransition: animationTokens.transition.normal, // 300ms ease-out

  // Modal/overlay animations
  modalDuration: animationTokens.duration.confident, // 400ms
  modalTiming: animationTokens.timing.easeInOut,
  modalTransition: "400ms cubic-bezier(0.4, 0, 0.2, 1)", // Smooth modal

  // Loading/skeleton animations
  loadingDuration: animationTokens.duration.deliberate, // 600ms
  loadingTiming: animationTokens.timing.linear,
} as const;

// ============================================================================
// SPACING TOKENS
// ============================================================================

export const spacingTokens = {
  0: "0px",
  1: "0.25rem", // 4px
  2: "0.5rem", // 8px
  3: "0.75rem", // 12px
  4: "1rem", // 16px
  5: "1.25rem", // 20px
  6: "1.5rem", // 24px
  8: "2rem", // 32px
  10: "2.5rem", // 40px
  12: "3rem", // 48px
  16: "4rem", // 64px
} as const;

// Fine-grained spacing for precision layouts
export const fineSpacingTokens = {
  "0-5": "0.125rem", // 2px - hairline spacing (was 0.5)
  "1-5": "0.375rem", // 6px - fine spacing (was 1.5)
  "2-5": "0.625rem", // 10px - between standard steps (was 2.5)
  "3-5": "0.875rem", // 14px - precise layouts (was 3.5)
} as const;

// Semantic spacing tokens for common use cases
export const semanticSpacingTokens = {
  // Component padding
  buttonPadding: spacingTokens[3], // 12px
  buttonPaddingLarge: spacingTokens[4], // 16px
  cardPadding: spacingTokens[4], // 16px
  cardPaddingLarge: spacingTokens[6], // 24px
  inputPadding: spacingTokens[3], // 12px

  // Layout spacing
  sectionGap: spacingTokens[8], // 32px between sections
  itemSpacing: spacingTokens[4], // 16px between items
  listGap: spacingTokens[2], // 8px between list items
  gridGap: spacingTokens[4], // 16px grid gap

  // Stack spacing
  stackTight: spacingTokens[1], // 4px
  stackNormal: spacingTokens[2], // 8px
  stackRelaxed: spacingTokens[4], // 16px
  stackLoose: spacingTokens[6], // 24px
} as const;

// Density scale (compact layout support)
export const densityTokens = {
  compact: {
    cardPadding: spacingTokens[3], // 12px
    gridGap: spacingTokens[4], // 16px (visual rhythm)
    headerPadding: spacingTokens[3],
  },
  comfortable: {
    cardPadding: spacingTokens[4], // 16px
    gridGap: spacingTokens[5], // 20px
    headerPadding: spacingTokens[4],
  },
} as const;

// ============================================================================
// OPACITY/ALPHA SYSTEM - Transparent Overlays
// ============================================================================

export const opacityTokens = {
  0: "0",
  5: "0.05", // 5% - very subtle
  10: "0.1", // 10% - subtle overlay
  15: "0.15", // 15% - light overlay
  20: "0.2", // 20% - moderate overlay
  30: "0.3", // 30% - visible overlay
  40: "0.4", // 40% - strong overlay
  50: "0.5", // 50% - half opacity
  60: "0.6", // 60% - more opaque
  70: "0.7", // 70% - mostly opaque
  75: "0.75", // 75% - three-quarters
  80: "0.8", // 80% - very opaque
  90: "0.9", // 90% - nearly solid
  95: "0.95", // 95% - almost solid
  100: "1", // 100% - fully opaque
} as const;

// ============================================================================
// BORDER RADIUS SYSTEM - Consistent Corner Styles
// ============================================================================

export const borderRadiusTokens = {
  none: "0", // No rounding
  sm: "0.375rem", // 6px - subtle rounding
  md: "0.625rem", // 10px - iOS button style
  lg: "0.75rem", // 12px - iOS card style
  xl: "1rem", // 16px - large cards
  "2xl": "1.25rem", // 20px - hero cards
  "3xl": "1.5rem", // 24px - huge cards
  full: "9999px", // Fully rounded (pills, circles)
} as const;

// Semantic border radius for common components (iOS-inspired)
export const semanticBorderRadiusTokens = {
  button: borderRadiusTokens.md, // 10px - iOS style
  card: borderRadiusTokens.lg, // 12px - iOS card style
  input: borderRadiusTokens.md, // 10px - iOS input style
  modal: borderRadiusTokens.xl, // 16px - prominent cards
  badge: borderRadiusTokens.md, // 10px - softer badges
  avatar: borderRadiusTokens.full, // Fully rounded
  image: borderRadiusTokens.lg, // 12px
} as const;

// ============================================================================
// BORDER SYSTEM - Modern, Semantic Borders
// ============================================================================

export const borderTokens = {
  // Border widths - semantic naming for clarity
  width: {
    none: "0", // No border
    hairline: "0.5px", // Ultra-thin border (0.5px) for very subtle divisions
    thin: "1px", // Thin border (1px) for subtle divisions - default
    medium: "2px", // Medium border (2px) for emphasis
    thick: "3px", // Thick border (3px) for strong emphasis
    heavy: "4px", // Heavy border (4px) for accent strips
  },

  // Border colors - light theme (iOS-style subtle)
  color: {
    subtle: colorTokens.gray[50], // rgba(249, 250, 251, 1) - Nearly invisible, iOS-style
    default: colorTokens.gray[100], // rgba(243, 244, 246, 1) - Very subtle separator
    medium: colorTokens.gray[200], // rgba(229, 231, 235, 1) - Light divider
    strong: colorTokens.gray[300], // rgba(209, 213, 219, 1) - Visible but not harsh
    brand: colorTokens.jade[100], // Very subtle brand borders
    brandStrong: colorTokens.jade[500], // Strong brand emphasis
    interactive: colorTokens.blue[200], // Subtle interactive borders
    interactiveStrong: colorTokens.blue[500], // Strong interactive emphasis
  },

  // Border styles
  style: {
    solid: "solid",
    dashed: "dashed",
    dotted: "dotted",
    none: "none",
  },
} as const;

// Semantic border combinations for common use cases
export const semanticBorderTokens = {
  // Dividers - horizontal/vertical lines separating content
  divider: {
    width: borderTokens.width.thin,
    color: borderTokens.color.subtle,
    style: borderTokens.style.solid,
  },
  dividerMedium: {
    width: borderTokens.width.thin,
    color: borderTokens.color.default,
    style: borderTokens.style.solid,
  },
  dividerStrong: {
    width: borderTokens.width.thin,
    color: borderTokens.color.medium,
    style: borderTokens.style.solid,
  },

  // Cards & containers
  card: {
    width: borderTokens.width.thin,
    color: borderTokens.color.default,
    style: borderTokens.style.solid,
  },
  cardElevated: {
    width: borderTokens.width.thin,
    color: borderTokens.color.subtle,
    style: borderTokens.style.solid,
  },

  // Interactive elements
  input: {
    width: borderTokens.width.thin,
    color: borderTokens.color.medium,
    style: borderTokens.style.solid,
  },
  inputFocus: {
    width: borderTokens.width.medium,
    color: borderTokens.color.brandStrong,
    style: borderTokens.style.solid,
  },
  inputError: {
    width: borderTokens.width.medium,
    color: colorTokens.error[500],
    style: borderTokens.style.solid,
  },

  // Accent borders (e.g., top stripe on cards)
  accentTop: {
    width: borderTokens.width.heavy,
    color: borderTokens.color.brand,
    style: borderTokens.style.solid,
  },
  accentTopStrong: {
    width: borderTokens.width.heavy,
    color: borderTokens.color.brandStrong,
    style: borderTokens.style.solid,
  },

  // Special states
  selected: {
    width: borderTokens.width.medium,
    color: borderTokens.color.brandStrong,
    style: borderTokens.style.solid,
  },
  hover: {
    width: borderTokens.width.thin,
    color: borderTokens.color.interactive,
    style: borderTokens.style.solid,
  },
} as const;

// ============================================================================
// ELEVATION & SHADOW SYSTEM - "Professional Depth"
// ============================================================================

export const elevationTokens = {
  // Minimal shadows for subtle depth
  none: "none",

  // Standardized shadow scale
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)", // Subtle shadow
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)", // Moderate shadow
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)", // Large shadow
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)", // Extra large shadow
  "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)", // Huge shadow

  // Card elevations - increasing depth
  card: {
    resting: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
    hover: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    active: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  },

  // Button elevations
  button: {
    resting: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    hover: "0 2px 4px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
    active: "inset 0 1px 2px 0 rgb(0 0 0 / 0.1)",
  },

  // Modal and overlay elevations
  modal: "0 25px 50px -12px rgb(0 0 0 / 0.25), 0 0 0 1px rgb(0 0 0 / 0.05)",
  dropdown:
    "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",

  // Focus rings for accessibility
  focus: "0 0 0 2px rgb(4 120 87 / 0.2)", // Jade focus ring
} as const;

// ============================================================================
// ENHANCED CONTRAST SYSTEM - "Industry-Leading Accessibility"
// ============================================================================

export const contrastTokens = {
  // High contrast text combinations for maximum readability
  text: {
    // Primary text (AAA compliance)
    onLight: colorTokens.gray[900], // #111827 on light backgrounds
    onDark: "#FFFFFF", // White on dark backgrounds
    onBrand: "#FFFFFF", // White on jade/navy

    // Secondary text (AA+ compliance)
    secondaryOnLight: colorTokens.gray[700], // #374151
    secondaryOnDark: colorTokens.gray[300], // #D1D5DB

    // Muted text (AA compliance)
    mutedOnLight: colorTokens.gray[600], // #4B5563
    mutedOnDark: colorTokens.gray[400], // #9CA3AF
  },

  // Interactive element contrast
  interactive: {
    // Brand interactions with guaranteed contrast
    brandOnLight: colorTokens.jade[600], // #047857 - Strong contrast
    brandOnDark: colorTokens.jade[400], // #34D399 - Enhanced for dark mode

    // Hover states with enhanced visibility
    hoverOnLight: colorTokens.jade[700], // #065F46 - Darker for better contrast
    hoverOnDark: colorTokens.jade[300], // #6EE7B7 - Lighter for dark mode
  },

  // Status colors with enhanced contrast
  status: {
    success: colorTokens.success[700], // #15803D - Darker green
    warning: colorTokens.warning[700], // #B45309 - Darker amber
    error: colorTokens.error[700], // #B91C1C - Darker red
    info: colorTokens.jade[700], // #065F46 - Brand-aligned info
  },

  // Psychological color system for badges and UI states
  psychology: {
    // 🔴 RED = URGENCY - Immediate attention required
    urgency: {
      background: "#FEF2F2", // red-50
      text: "#991B1B", // red-800
      border: "#FECACA", // red-200
      hover: "#FEE2E2", // red-100
    },

    // 🟢 GREEN = ACHIEVEMENT - Success and accomplishment
    achievement: {
      background: "#F0FDF4", // green-50
      text: "#166534", // green-800
      border: "#BBF7D0", // green-200
      hover: "#DCFCE7", // green-100
    },

    // 🔵 BLUE = INFORMATION - Neutral, informative content
    information: {
      background: "#EFF6FF", // blue-50
      text: "#1E40AF", // blue-800
      border: "#BFDBFE", // blue-200
      hover: "#DBEAFE", // blue-100
    },

    // 🟡 YELLOW = ATTENTION - Important but not urgent
    attention: {
      background: "#FFFBEB", // amber-50
      text: "#92400E", // amber-800
      border: "#FDE68A", // amber-200
      hover: "#FEF3C7", // amber-100
    },

    // 🟣 PURPLE = PREMIUM - Special, elite, exclusive
    premium: {
      background: "#F5F3FF", // violet-50
      text: "#5B21B6", // violet-800
      border: "#C4B5FD", // violet-200
      hover: "#EDE9FE", // violet-100
    },
  },
} as const; // ============================================================================
// LAYOUT TOKENS - Container, Grid, Content Area System
// ============================================================================

export const layoutTokens = {
  // Container widths - systematic sizing scale
  container: {
    xs: "20rem", // 320px - Mobile, narrow content
    sm: "24rem", // 384px - Small cards, modals
    md: "28rem", // 448px - Standard modals
    lg: "32rem", // 512px - Large modals, forms
    xl: "36rem", // 576px - Extra large modals
    "2xl": "42rem", // 672px - Wide modals
    "3xl": "48rem", // 768px - Very wide content
    "4xl": "56rem", // 896px - Maximum readable width
    "5xl": "64rem", // 1024px - Large dashboards
    "6xl": "72rem", // 1152px - Extra large dashboards
    "7xl": "80rem", // 1280px - Full width layouts
    full: "100%", // Full width
  },

  // Grid gaps - consistent spacing between grid items
  grid: {
    gapTight: spacingTokens[2], // 0.5rem (8px) - Compact grids
    gapNormal: spacingTokens[4], // 1rem (16px) - Standard spacing
    gapLoose: spacingTokens[6], // 1.5rem (24px) - Relaxed spacing
    gapWide: spacingTokens[8], // 2rem (32px) - Wide spacing
  },

  // Content area sizing - app-level layout dimensions
  content: {
    maxWidth: "80rem", // 1280px - Maximum content width
    readableWidth: "65ch", // ~65 characters - Optimal reading width
  },

  // Sidebar widths
  sidebar: {
    narrow: "12rem", // 192px - Collapsed sidebar
    standard: "16rem", // 256px - Standard sidebar
    wide: "20rem", // 320px - Wide sidebar
    extraWide: "24rem", // 384px - Extra wide sidebar
  },

  // Header/navbar heights
  header: {
    compact: "3rem", // 48px - Compact header
    standard: "4rem", // 64px - Standard header
    tall: "5rem", // 80px - Tall header
  },

  // Footer heights
  footer: {
    compact: "4rem", // 64px - Compact footer
    standard: "6rem", // 96px - Standard footer
  },

  // Modal sizing presets
  modal: {
    small: "28rem", // 448px - Small modals (alerts, confirmations)
    medium: "36rem", // 576px - Medium modals (forms)
    large: "48rem", // 768px - Large modals (detailed views)
    xlarge: "64rem", // 1024px - Extra large modals (wizards)
    full: "calc(100vw - 2rem)", // Full width with margin
  },

  // Dashboard card dimensions
  card: {
    minHeight: "10rem", // 160px - Minimum card height
    standardHeight: "12rem", // 192px - Standard card height
    tallHeight: "16rem", // 256px - Tall cards
  },
} as const;

// Semantic layout tokens for common patterns
export const semanticLayoutTokens = {
  // Page containers
  pageContainer: layoutTokens.container["7xl"], // 1280px max width
  pageContentWidth: layoutTokens.content.maxWidth, // 1280px
  articleWidth: layoutTokens.content.readableWidth, // 65ch

  // Dashboard layouts
  dashboardSidebar: layoutTokens.sidebar.standard, // 256px
  dashboardHeader: layoutTokens.header.standard, // 64px
  dashboardContent: "calc(100vw - 16rem)", // Full minus sidebar

  // Form layouts
  formContainerSmall: layoutTokens.container.md, // 448px
  formContainerLarge: layoutTokens.container.xl, // 576px

  // Grid layouts
  gridGap: layoutTokens.grid.gapNormal, // 16px
  gridGapTight: layoutTokens.grid.gapTight, // 8px
  gridGapLoose: layoutTokens.grid.gapLoose, // 24px
} as const;

// ============================================================================
// COMPONENT TOKENS - Specific Use Cases
// ============================================================================

export const componentTokens = {
  // ============================================================================
  // BUTTON COMPONENT TOKENS
  // ============================================================================
  button: {
    // Primary variant
    primaryBg: semanticTokens.primary,
    primaryBgHover: semanticTokens.primaryHover,
    primaryBgActive: colorTokens.jade[700],
    primaryBgDisabled: colorTokens.gray[300],
    primaryText: "#FFFFFF",
    primaryTextDisabled: colorTokens.gray[500],
    primaryShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    primaryShadowHover: "0 4px 6px -1px rgb(0 0 0 / 0.1)",

    // Secondary variant
    secondaryBg: colorTokens.gray[100],
    secondaryBgHover: colorTokens.gray[200],
    secondaryBgActive: colorTokens.gray[300],
    secondaryBgDisabled: colorTokens.gray[100],
    secondaryText: colorTokens.gray[900],
    secondaryTextDisabled: colorTokens.gray[400],
    secondaryBorder: "transparent",
    secondaryShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",

    // Outline variant
    outlineBg: "transparent",
    outlineBgHover: `${semanticTokens.primary}10`, // 10% opacity
    outlineBgActive: `${semanticTokens.primary}20`, // 20% opacity
    outlineBgDisabled: "transparent",
    outlineText: semanticTokens.primary,
    outlineTextDisabled: colorTokens.gray[400],
    outlineBorder: semanticTokens.primary,
    outlineBorderHover: semanticTokens.primaryHover,
    outlineBorderDisabled: colorTokens.gray[300],

    // Ghost variant (transparent background, visible on hover)
    ghostBg: "transparent",
    ghostBgHover: colorTokens.gray[100],
    ghostBgActive: colorTokens.gray[200],
    ghostBgDisabled: "transparent",
    ghostText: colorTokens.gray[900],
    ghostTextDisabled: colorTokens.gray[400],

    // Danger/Destructive variant
    dangerBg: colorTokens.error[500],
    dangerBgHover: colorTokens.error[600],
    dangerBgActive: colorTokens.error[700],
    dangerBgDisabled: colorTokens.gray[300], // Use gray since error[300] doesn't exist
    dangerText: "#FFFFFF",
    dangerTextDisabled: colorTokens.gray[400], // Use gray since error[200] doesn't exist

    // Success variant
    successBg: colorTokens.success[600],
    successBgHover: colorTokens.success[700],
    successBgActive: colorTokens.success[700],
    successBgDisabled: colorTokens.gray[300], // Use gray since success[300] doesn't exist
    successText: "#FFFFFF",
    successTextDisabled: colorTokens.gray[400], // Use gray since success[200] doesn't exist

    // Warning variant
    warningBg: colorTokens.warning[600],
    warningBgHover: colorTokens.warning[700],
    warningBgActive: colorTokens.warning[700],
    warningBgDisabled: colorTokens.gray[300], // Use gray since warning[300] doesn't exist
    warningText: colorTokens.gray[900],
    warningTextDisabled: colorTokens.gray[400], // Use gray since warning[200] doesn't exist

    // Link variant
    linkText: colorTokens.blue[600],
    linkTextHover: colorTokens.blue[700],
    linkTextActive: colorTokens.blue[800],
    linkTextDisabled: colorTokens.blue[300],

    // Focus states (consistent across all variants)
    focusRing: semanticTokens.primary,
    focusRingOffset: "2px",
    focusRingWidth: "2px",

    // Loading states
    loadingSpinnerPrimary: "#FFFFFF",
    loadingSpinnerSecondary: semanticTokens.primary,
    loadingOpacity: "0.6",

    // Size tokens (heights)
    heightXs: "32px", // 2rem / 8 rhythm
    heightSm: "36px", // 2.25rem
    heightMd: "40px", // 2.5rem
    heightLg: "44px", // 2.75rem
    heightXl: "48px", // 3rem
  },

  // ============================================================================
  // INPUT/FORM COMPONENT TOKENS
  // ============================================================================
  input: {
    // Default state
    bg: "#FFFFFF",
    border: colorTokens.gray[300],
    text: colorTokens.gray[900],
    placeholder: colorTokens.gray[400],

    // Hover state
    borderHover: colorTokens.gray[400],

    // Focus state
    bgFocus: "#FFFFFF",
    borderFocus: semanticTokens.primary,
    ringFocus: semanticTokens.primary,
    ringFocusOpacity: "0.1",

    // Disabled state
    bgDisabled: colorTokens.gray[50],
    borderDisabled: colorTokens.gray[200],
    textDisabled: colorTokens.gray[400],
    placeholderDisabled: colorTokens.gray[300],

    // Error state
    bgError: colorTokens.error[50],
    borderError: colorTokens.error[500],
    textError: colorTokens.error[700], // Use 700 since 900 doesn't exist
    ringError: colorTokens.error[500],

    // Success state
    bgSuccess: colorTokens.success[50],
    borderSuccess: colorTokens.success[500],
    textSuccess: colorTokens.success[700], // Use 700 since 900 doesn't exist
    ringSuccess: colorTokens.success[500],

    // Warning state
    bgWarning: colorTokens.warning[50],
    borderWarning: colorTokens.warning[500],
    textWarning: colorTokens.warning[700], // Use 700 since 900 doesn't exist
    ringWarning: colorTokens.warning[500],
  },

  // ============================================================================
  // CARD COMPONENT TOKENS
  // ============================================================================
  card: {
    // Default card
    background: semanticTokens.bgPrimary,
    border: semanticTokens.border,
    shadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
    shadowHover: "0 4px 6px -1px rgb(0 0 0 / 0.1)",

    // Interactive card (hover states)
    bgHover: colorTokens.gray[50],
    borderHover: colorTokens.gray[300],

    // Selected card
    bgSelected: colorTokens.jade[50],
    borderSelected: semanticTokens.primary,

    // Elevation variants
    shadowFlat: "none",
    shadowRaised:
      "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    shadowElevated:
      "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  },

  // ============================================================================
  // BADGE/TAG COMPONENT TOKENS
  // ============================================================================
  badge: {
    // Neutral badge
    neutralBg: colorTokens.gray[100],
    neutralText: colorTokens.gray[700],
    neutralBorder: colorTokens.gray[200],

    // Primary badge
    primaryBg: colorTokens.jade[100],
    primaryText: colorTokens.jade[700],
    primaryBorder: colorTokens.jade[200],

    // Success badge
    successBg: colorTokens.success[50], // Use 50 since 100 doesn't exist
    successText: colorTokens.success[700],
    successBorder: colorTokens.success[600], // Use 600 since 200 doesn't exist

    // Warning badge
    warningBg: colorTokens.warning[50], // Use 50 since 100 doesn't exist
    warningText: colorTokens.warning[700],
    warningBorder: colorTokens.warning[600], // Use 600 since 200 doesn't exist

    // Error badge
    errorBg: colorTokens.error[50], // Use 50 since 100 doesn't exist
    errorText: colorTokens.error[700],
    errorBorder: colorTokens.error[600], // Use 600 since 200 doesn't exist

    // Info badge
    infoBg: colorTokens.blue[100],
    infoText: colorTokens.blue[700],
    infoBorder: colorTokens.blue[200],
  },

  // ============================================================================
  // MODAL/OVERLAY COMPONENT TOKENS
  // ============================================================================
  modal: {
    // Backdrop
    backdropBg: "rgba(0, 0, 0, 0.5)",
    backdropBlur: "8px",

    // Modal container
    bg: "#FFFFFF",
    border: colorTokens.gray[200],
    shadow:
      "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",

    // Header
    headerBg: "#FFFFFF",
    headerBorder: colorTokens.gray[200],
    headerText: colorTokens.gray[900],

    // Footer
    footerBg: colorTokens.gray[50],
    footerBorder: colorTokens.gray[200],

    // Close button
    closeBtnBg: "transparent",
    closeBtnBgHover: colorTokens.gray[100],
    closeBtnText: colorTokens.gray[500],
    closeBtnTextHover: colorTokens.gray[900],
  },

  // ============================================================================
  // NAVIGATION COMPONENT TOKENS
  // ============================================================================
  navigation: {
    // Default navigation
    background: semanticTokens.bgPrimary,
    border: semanticTokens.border,

    // Navigation items
    itemText: colorTokens.gray[700],
    itemTextHover: colorTokens.gray[900],
    itemTextActive: semanticTokens.primary,
    itemBgHover: colorTokens.gray[100],
    itemBgActive: colorTokens.jade[50],

    // Mobile navigation
    mobileHeaderBg: "#FFFFFF",
    mobileHeaderBorder: colorTokens.gray[200],
    mobileHeaderShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",

    // Sidebar navigation
    sidebarBg: "#FFFFFF",
    sidebarBorder: colorTokens.gray[200],
    sidebarHeaderBg: colorTokens.gray[50],
  },

  // ============================================================================
  // TOOLTIP COMPONENT TOKENS
  // ============================================================================
  tooltip: {
    bg: colorTokens.gray[900],
    text: "#FFFFFF",
    shadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    maxWidth: "320px",
    padding: "8px 12px",
    fontSize: "0.875rem", // 14px
    borderRadius: "8px",
  },

  // ============================================================================
  // LOADING/SKELETON COMPONENT TOKENS
  // ============================================================================
  skeleton: {
    bg: colorTokens.gray[200],
    highlight: colorTokens.gray[100],
    animationDuration: "1.5s",
    borderRadius: "8px",
  },

  // ============================================================================
  // DROPDOWN/SELECT COMPONENT TOKENS
  // ============================================================================
  dropdown: {
    // Container
    bg: "#FFFFFF",
    border: colorTokens.gray[200],
    shadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",

    // Items
    itemText: colorTokens.gray[900],
    itemTextHover: colorTokens.gray[900],
    itemTextSelected: semanticTokens.primary,
    itemBgHover: colorTokens.gray[100],
    itemBgSelected: colorTokens.jade[50],

    // Divider
    divider: colorTokens.gray[200],
  },

  // ============================================================================
  // ICON COMPONENT TOKENS (Enhanced)
  // ============================================================================
  icon: {
    // Contextual colors
    default: "currentColor",
    primary: semanticTokens.primary,
    secondary: colorTokens.gray[500],
    muted: colorTokens.gray[400],

    // Semantic colors
    success: semanticTokens.success,
    warning: semanticTokens.warning,
    error: semanticTokens.error,
    info: colorTokens.blue[500],

    // Brand colors
    jade: semanticTokens.boxcallBrand,
    navy: semanticTokens.coachAuthority,

    // Size scale (matches icon component)
    sizeXs: "16px",
    sizeSm: "20px",
    sizeMd: "24px",
    sizeLg: "32px",
    sizeXl: "40px",
  },

  // ============================================================================
  // Z-INDEX SCALE (Stacking Order)
  // ============================================================================
  zIndex: {
    base: "0",
    dropdown: "1000",
    sticky: "1020",
    fixed: "1030",
    modalBackdrop: "1040",
    modal: "1050",
    popover: "1060",
    tooltip: "1070",
    toast: "1080",
    max: "9999",
  },

  // ============================================================================
  // FOCUS RING SYSTEM (Accessibility)
  // ============================================================================
  focus: {
    ringColor: semanticTokens.primary,
    ringWidth: "2px",
    ringOffset: "2px",
    ringOpacity: "0.5",
    ringStyle: "solid",
  },
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get color by semantic token name
 * Usage: getColor('primary') -> '#00A86B'
 */
export function getColor(
  tokenName: Exclude<keyof typeof semanticTokens, "diagram">
): string {
  const value = semanticTokens[tokenName];
  if (typeof value === "string") {
    return value;
  }
  throw new Error(`Token ${tokenName} is not a string value`);
}

/**
 * Get diagram-specific color
 * Usage: getDiagramColor('offensivePlayer') -> '#2563EB'
 */
export function getDiagramColor(
  colorName: keyof typeof semanticTokens.diagram
): string {
  return semanticTokens.diagram[colorName];
}

/**
 * Get component-specific color
 * Usage: getComponentColor('icon', 'jade') -> '#047857'
 */
export function getComponentColor(
  component: keyof typeof componentTokens,
  variant: string
): string {
  const componentGroup = componentTokens[component] as Record<string, string>;
  return (
    componentGroup[variant] ||
    componentGroup.default ||
    semanticTokens.textPrimary
  );
}

/**
 * Generate CSS custom properties for use in CSS files
 */
export function generateCSSCustomProperties(): Record<string, string> {
  const cssVars: Record<string, string> = {};

  // Add semantic tokens (excluding nested objects)
  Object.entries(semanticTokens).forEach(([key, value]) => {
    if (typeof value === "string") {
      cssVars[`--color-${key}`] = value;
    } else if (typeof value === "object") {
      // Handle nested objects like diagram
      Object.entries(value).forEach(([nestedKey, nestedValue]) => {
        cssVars[`--color-${key}-${nestedKey}`] = nestedValue as string;
      });
    }
  });

  // Add component tokens
  Object.entries(componentTokens).forEach(([componentKey, componentValue]) => {
    Object.entries(componentValue).forEach(([variantKey, variantValue]) => {
      cssVars[`--${componentKey}-${variantKey}`] = variantValue;
    });
  });

  return cssVars;
}

// ============================================================================
// EXPORTS FOR EXTERNAL USAGE
// ============================================================================

// For Tailwind config
export const tailwindColors = {
  jade: colorTokens.jade,
  navy: colorTokens.navy,
  gray: colorTokens.gray,
  blue: colorTokens.blue,
  cyan: colorTokens.cyan,
  amber: colorTokens.amber,
  emerald: colorTokens.emerald,
  purple: colorTokens.purple,
  violet: colorTokens.violet,
  red: colorTokens.red,
  success: colorTokens.success,
  warning: colorTokens.warning,
  error: colorTokens.error,
};

// For component development
export {
  colorTokens as colors,
  semanticTokens as semantic,
  componentTokens as component,
  typographyTokens as typography,
  semanticTypographyTokens as semanticTypography,
  animationTokens as animation,
  semanticAnimationTokens as semanticAnimation,
  spacingTokens as spacing,
  fineSpacingTokens as fineSpacing,
  semanticSpacingTokens as semanticSpacing,
  densityTokens as density,
  opacityTokens as opacity,
  borderRadiusTokens as borderRadius,
  semanticBorderRadiusTokens as semanticBorderRadius,
  elevationTokens as elevation,
  layoutTokens as layout,
  semanticLayoutTokens as semanticLayout,
};
