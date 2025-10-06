/**
 * BoxCall Design System - Tailwind Plugin
 * Adds custom utility classes for spacing, surfaces, and other design tokens
 */

import plugin from "tailwindcss/plugin";

export default plugin(({ addUtilities, theme }) => {
  console.log("🎨 BoxCall Tailwind Plugin Loading...");

  // Generate spacing utilities (gap-spacing-*, space-y-spacing-*, etc.)
  const spacingUtilities = {};
  const spacingAliases = {
    xs: "spacing-xs",
    sm: "spacing-sm",
    md: "spacing-md",
    lg: "spacing-lg",
    xl: "spacing-xl",
    "2xl": "spacing-2xl",
    "3xl": "spacing-3xl",
  };

  // Add p-spacing-*, m-spacing-*, gap-spacing-* utilities
  Object.entries(spacingAliases).forEach(([alias, tokenKey]) => {
    const value = theme(`spacing.${tokenKey}`);
    if (value) {
      // Padding
      spacingUtilities[`.p-spacing-${alias}`] = { padding: value };
      spacingUtilities[`.px-spacing-${alias}`] = {
        paddingLeft: value,
        paddingRight: value,
      };
      spacingUtilities[`.py-spacing-${alias}`] = {
        paddingTop: value,
        paddingBottom: value,
      };
      spacingUtilities[`.pt-spacing-${alias}`] = { paddingTop: value };
      spacingUtilities[`.pr-spacing-${alias}`] = { paddingRight: value };
      spacingUtilities[`.pb-spacing-${alias}`] = { paddingBottom: value };
      spacingUtilities[`.pl-spacing-${alias}`] = { paddingLeft: value };

      // Margin
      spacingUtilities[`.m-spacing-${alias}`] = { margin: value };
      spacingUtilities[`.mx-spacing-${alias}`] = {
        marginLeft: value,
        marginRight: value,
      };
      spacingUtilities[`.my-spacing-${alias}`] = {
        marginTop: value,
        marginBottom: value,
      };
      spacingUtilities[`.mt-spacing-${alias}`] = { marginTop: value };
      spacingUtilities[`.mr-spacing-${alias}`] = { marginRight: value };
      spacingUtilities[`.mb-spacing-${alias}`] = { marginBottom: value };
      spacingUtilities[`.ml-spacing-${alias}`] = { marginLeft: value };
      spacingUtilities[`.-mt-spacing-${alias}`] = { marginTop: `-${value}` };
      spacingUtilities[`.-mr-spacing-${alias}`] = { marginRight: `-${value}` };
      spacingUtilities[`.-mb-spacing-${alias}`] = { marginBottom: `-${value}` };
      spacingUtilities[`.-ml-spacing-${alias}`] = { marginLeft: `-${value}` };
      spacingUtilities[`.-mx-spacing-${alias}`] = {
        marginLeft: `-${value}`,
        marginRight: `-${value}`,
      };

      // Gap
      spacingUtilities[`.gap-spacing-${alias}`] = { gap: value };

      // Space between
      spacingUtilities[
        `.space-x-spacing-${alias} > :not([hidden]) ~ :not([hidden])`
      ] = {
        marginLeft: value,
      };
      spacingUtilities[
        `.space-y-spacing-${alias} > :not([hidden]) ~ :not([hidden])`
      ] = {
        marginTop: value,
      };
    }
  });

  // Add surface utilities
  const surfaceUtilities = {
    ".bg-surface-base": {
      backgroundColor: "var(--semantic-bg-primary)",
    },
    ".bg-surface-secondary": {
      backgroundColor: "var(--semantic-bg-secondary)",
    },
    ".bg-surface-muted": {
      backgroundColor: "var(--semantic-bg-muted)",
    },
    ".bg-surface-card": {
      backgroundColor: "var(--semantic-bg-secondary)",
    },
    ".bg-surface-subtle": {
      backgroundColor: "var(--semantic-surface-subtle-hover)",
    },
    ".bg-surface-inverse": {
      backgroundColor: "var(--semantic-surface-inverse)",
    },
    ".text-text-primary": {
      color: "var(--semantic-text-primary)",
    },
    ".text-text-secondary": {
      color: "var(--semantic-text-secondary)",
    },
    ".text-text-muted": {
      color: "var(--semantic-text-muted)",
    },
    ".text-text-inverse": {
      color: "var(--semantic-text-inverse)",
    },
    ".text-text-brand": {
      color: "var(--semantic-text-brand)",
    },
    ".text-text-error": {
      color: "var(--semantic-error)",
    },
    ".text-text-success": {
      color: "var(--semantic-success)",
    },
    ".text-text-warning": {
      color: "var(--semantic-warning)",
    },
    ".border-border": {
      borderColor: "var(--semantic-border)",
    },
    ".focus\\:ring-brand-primary:focus": {
      "--tw-ring-color": "var(--semantic-primary)",
    },
  };

  // Add elevation/shadow utilities
  const elevationUtilities = {
    ".elevation-card": {
      boxShadow: "var(--elevation-card-resting)",
      transition: "box-shadow 200ms ease-out",
    },
    ".elevation-card:hover": {
      boxShadow: "var(--elevation-card-hover)",
    },
    ".elevation-card:active": {
      boxShadow: "var(--elevation-card-active)",
    },
    ".shadow-button": {
      boxShadow: "var(--elevation-button-resting)",
    },
    ".shadow-button:hover": {
      boxShadow: "var(--elevation-button-hover)",
    },
    ".shadow-card": {
      boxShadow: "var(--elevation-card-resting)",
    },
    ".shadow-modal": {
      boxShadow: "var(--elevation-modal)",
    },
  };

  const totalUtilities =
    Object.keys(spacingUtilities).length +
    Object.keys(surfaceUtilities).length +
    Object.keys(elevationUtilities).length;

  console.log(
    `✅ BoxCall Plugin: Generated ${totalUtilities} custom utility classes`
  );
  console.log(
    `   - Spacing utilities: ${Object.keys(spacingUtilities).length}`
  );
  console.log(
    `   - Surface utilities: ${Object.keys(surfaceUtilities).length}`
  );
  console.log(
    `   - Elevation utilities: ${Object.keys(elevationUtilities).length}`
  );

  addUtilities({
    ...spacingUtilities,
    ...surfaceUtilities,
    ...elevationUtilities,
  });
});
