/**
 * Layout Token System - Tailwind Plugin
 * 
 * Provides standardized layout utilities for:
 * - Page containers (container-page, container-content, etc.)
 * - Grid patterns (grid-dashboard, grid-form, grid-hero, grid-cards)
 * - Responsive padding (container-padding)
 * 
 * Usage:
 * <div className="container-page container-padding">
 * <div className="grid-dashboard">
 */

export default function layoutTokenPlugin({ addUtilities }) {
  addUtilities({
    // ============================================================================
    // CONTAINER UTILITIES - Page-level containers with auto margins
    // ============================================================================
    
    '.container-page': {
      maxWidth: 'var(--layout-container-7xl)', // 80rem / 1280px
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    '.container-content': {
      maxWidth: 'var(--layout-container-2xl)', // 42rem / 672px
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    '.container-wide': {
      maxWidth: 'var(--layout-container-6xl)', // 72rem / 1152px
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    
    // Semantic content widths
    '.content-narrow': {
      maxWidth: 'var(--layout-content-narrow)', // 42rem - Forms, articles
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    '.content-medium': {
      maxWidth: 'var(--layout-content-medium)', // 56rem - Detail pages
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    '.content-wide': {
      maxWidth: 'var(--layout-content-wide)', // 72rem - Wide dashboards
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    '.content-full': {
      maxWidth: 'var(--layout-content-full)', // 80rem - Main container
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    
    // ============================================================================
    // PADDING UTILITIES - Responsive container padding
    // ============================================================================
    
    '.container-padding': {
      paddingLeft: 'var(--layout-padding-sm)', // 1rem / 16px
      paddingRight: 'var(--layout-padding-sm)',
      '@screen sm': {
        paddingLeft: 'var(--layout-padding-md)', // 1.5rem / 24px
        paddingRight: 'var(--layout-padding-md)',
      },
      '@screen lg': {
        paddingLeft: 'var(--layout-padding-lg)', // 2rem / 32px
        paddingRight: 'var(--layout-padding-lg)',
      },
    },
    
    // ============================================================================
    // GRID PATTERNS - Common responsive grid layouts
    // ============================================================================
    
    // Dashboard Grid: 1 → 2 → 3 columns
    // Replaces: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5
    '.grid-dashboard': {
      display: 'grid',
      gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
      gap: 'var(--layout-gap-md)', // 1rem / 16px
      '@screen md': {
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gap: 'var(--layout-gap-lg)', // 1.25rem / 20px
      },
      '@screen lg': {
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
      },
    },
    
    // Form Grid: 1 → 2 columns
    // Replaces: grid grid-cols-1 md:grid-cols-2 gap-6
    '.grid-form': {
      display: 'grid',
      gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
      gap: 'var(--layout-gap-xl)', // 1.5rem / 24px
      '@screen md': {
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      },
    },
    
    // Hero Tiles Grid: 1 → 2 → 4 columns
    // Replaces: grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-5
    '.grid-hero': {
      display: 'grid',
      gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
      gap: 'var(--layout-gap-md)', // 1rem / 16px
      '@screen sm': {
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      },
      '@screen xl': {
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
        gap: 'var(--layout-gap-lg)', // 1.25rem / 20px
      },
    },
    
    // Card Grid: 1 → 2 → 3 columns
    // Replaces: grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4
    '.grid-cards': {
      display: 'grid',
      gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
      gap: 'var(--layout-gap-md)', // 1rem / 16px
      '@screen sm': {
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      },
      '@screen lg': {
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
      },
    },
    
    // ============================================================================
    // UTILITY VARIANTS - Additional helpful patterns
    // ============================================================================
    
    // Tight dashboard grid (less gap)
    '.grid-dashboard-tight': {
      display: 'grid',
      gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
      gap: 'var(--layout-gap-sm)', // 0.75rem / 12px
      '@screen md': {
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gap: 'var(--layout-gap-md)', // 1rem / 16px
      },
      '@screen lg': {
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
      },
    },
    
    // Wide dashboard grid (4 columns on xl)
    '.grid-dashboard-wide': {
      display: 'grid',
      gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
      gap: 'var(--layout-gap-md)', // 1rem / 16px
      '@screen md': {
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gap: 'var(--layout-gap-lg)', // 1.25rem / 20px
      },
      '@screen lg': {
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
      },
      '@screen xl': {
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
      },
    },
  });
}
