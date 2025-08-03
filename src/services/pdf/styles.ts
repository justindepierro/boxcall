/**
 * PDF Styles
 *
 * Centralized styling system for all PDF documents.
 * Uses React-PDF StyleSheet API for consistent design.
 */

import { StyleSheet } from "@react-pdf/renderer";

// Color palette - matches the app's design system
export const PDFColors = {
  // Primary brand colors
  primary: "#2563eb",
  secondary: "#64748b",
  accent: "#059669",

  // Semantic colors
  success: "#16a34a",
  warning: "#d97706",
  error: "#dc2626",
  info: "#0284c7",

  // Neutral colors
  white: "#ffffff",
  black: "#000000",
  gray: {
    50: "#f8fafc",
    100: "#f1f5f9",
    200: "#e2e8f0",
    300: "#cbd5e1",
    400: "#94a3b8",
    500: "#64748b",
    600: "#475569",
    700: "#334155",
    800: "#1e293b",
    900: "#0f172a",
  },

  // Football-specific colors
  field: "#4ade80",
  fieldDark: "#16a34a",

  // Category colors (matches practice planner)
  categories: {
    meeting: "#8b5cf6",
    offense: "#ef4444",
    defense: "#3b82f6",
    "special-teams": "#f59e0b",
    conditioning: "#10b981",
    "weight-room": "#6366f1",
    transition: "#64748b",
    break: "#06b6d4",
  },
};

// Typography
export const PDFFonts = {
  primary: "Helvetica",
  secondary: "Helvetica-Bold",
  monospace: "Courier",
};

// Base styles that can be used across all PDF documents
export const PDFBaseStyles = StyleSheet.create({
  // Page layout
  page: {
    flexDirection: "column",
    backgroundColor: PDFColors.white,
    padding: 40,
    fontFamily: PDFFonts.primary,
    fontSize: 10,
    lineHeight: 1.4,
  },

  pageWithHeader: {
    paddingTop: 80,
  },

  // Typography
  h1: {
    fontSize: 24,
    fontFamily: PDFFonts.secondary,
    marginBottom: 16,
    color: PDFColors.primary,
  },

  h2: {
    fontSize: 18,
    fontFamily: PDFFonts.secondary,
    marginBottom: 12,
    color: PDFColors.gray[800],
  },

  h3: {
    fontSize: 14,
    fontFamily: PDFFonts.secondary,
    marginBottom: 8,
    color: PDFColors.gray[700],
  },

  h4: {
    fontSize: 12,
    fontFamily: PDFFonts.secondary,
    marginBottom: 6,
    color: PDFColors.gray[700],
  },

  body: {
    fontSize: 10,
    lineHeight: 1.4,
    color: PDFColors.gray[800],
  },

  bodySmall: {
    fontSize: 8,
    lineHeight: 1.3,
    color: PDFColors.gray[600],
  },

  bodyLarge: {
    fontSize: 12,
    lineHeight: 1.5,
    color: PDFColors.gray[800],
  },

  bold: {
    fontFamily: PDFFonts.secondary,
  },

  // Layout containers
  container: {
    marginBottom: 16,
  },

  section: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: PDFColors.gray[50],
    borderRadius: 4,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  column: {
    flexDirection: "column",
  },

  spaceBetween: {
    justifyContent: "space-between",
  },

  spaceAround: {
    justifyContent: "space-around",
  },

  center: {
    alignItems: "center",
    justifyContent: "center",
  },

  // Header and footer
  header: {
    position: "absolute",
    top: 20,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 12,
    borderBottom: `1px solid ${PDFColors.gray[200]}`,
  },

  footer: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTop: `1px solid ${PDFColors.gray[200]}`,
    fontSize: 8,
    color: PDFColors.gray[500],
  },

  // Tables
  table: {
    width: "100%",
    marginBottom: 16,
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: PDFColors.gray[100],
    borderBottom: `1px solid ${PDFColors.gray[300]}`,
    paddingVertical: 8,
    paddingHorizontal: 6,
  },

  tableRow: {
    flexDirection: "row",
    borderBottom: `1px solid ${PDFColors.gray[200]}`,
    paddingVertical: 6,
    paddingHorizontal: 6,
  },

  tableRowAlt: {
    backgroundColor: PDFColors.gray[50],
  },

  tableCell: {
    flex: 1,
    fontSize: 9,
    color: PDFColors.gray[800],
  },

  tableCellHeader: {
    flex: 1,
    fontSize: 9,
    fontFamily: PDFFonts.secondary,
    color: PDFColors.gray[700],
  },

  tableCellCenter: {
    textAlign: "center",
  },

  tableCellRight: {
    textAlign: "right",
  },

  // Cards and boxes
  card: {
    padding: 12,
    marginBottom: 12,
    backgroundColor: PDFColors.white,
    border: `1px solid ${PDFColors.gray[200]}`,
    borderRadius: 4,
  },

  cardHeader: {
    paddingBottom: 8,
    marginBottom: 8,
    borderBottom: `1px solid ${PDFColors.gray[200]}`,
  },

  // Lists
  list: {
    marginBottom: 12,
  },

  listItem: {
    flexDirection: "row",
    marginBottom: 4,
  },

  listBullet: {
    width: 12,
    color: PDFColors.primary,
  },

  listContent: {
    flex: 1,
    fontSize: 9,
    color: PDFColors.gray[800],
  },

  // Badges and labels
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    fontSize: 8,
    fontFamily: PDFFonts.secondary,
    color: PDFColors.white,
    textAlign: "center",
  },

  badgePrimary: {
    backgroundColor: PDFColors.primary,
  },

  badgeSecondary: {
    backgroundColor: PDFColors.secondary,
  },

  badgeSuccess: {
    backgroundColor: PDFColors.success,
  },

  badgeWarning: {
    backgroundColor: PDFColors.warning,
  },

  badgeError: {
    backgroundColor: PDFColors.error,
  },

  // Dividers
  divider: {
    height: 1,
    backgroundColor: PDFColors.gray[200],
    marginVertical: 12,
  },

  dividerThick: {
    height: 2,
    backgroundColor: PDFColors.gray[300],
    marginVertical: 16,
  },

  // Spacing utilities
  mb1: { marginBottom: 4 },
  mb2: { marginBottom: 8 },
  mb3: { marginBottom: 12 },
  mb4: { marginBottom: 16 },
  mb5: { marginBottom: 20 },
  mb6: { marginBottom: 24 },

  mt1: { marginTop: 4 },
  mt2: { marginTop: 8 },
  mt3: { marginTop: 12 },
  mt4: { marginTop: 16 },
  mt5: { marginTop: 20 },
  mt6: { marginTop: 24 },

  p1: { padding: 4 },
  p2: { padding: 8 },
  p3: { padding: 12 },
  p4: { padding: 16 },

  // Text alignment
  textLeft: { textAlign: "left" },
  textCenter: { textAlign: "center" },
  textRight: { textAlign: "right" },

  // Category-specific colors
  categoryMeeting: { backgroundColor: PDFColors.categories.meeting },
  categoryOffense: { backgroundColor: PDFColors.categories.offense },
  categoryDefense: { backgroundColor: PDFColors.categories.defense },
  categorySpecialTeams: {
    backgroundColor: PDFColors.categories["special-teams"],
  },
  categoryConditioning: { backgroundColor: PDFColors.categories.conditioning },
  categoryWeightRoom: { backgroundColor: PDFColors.categories["weight-room"] },
  categoryTransition: { backgroundColor: PDFColors.categories.transition },
  categoryBreak: { backgroundColor: PDFColors.categories.break },
});

// Helper function to get category color
export const getCategoryColor = (category: string) => {
  const colorMap: Record<string, string> = PDFColors.categories;
  return colorMap[category] || PDFColors.gray[500];
};

// Helper function to format time for PDFs
export const formatTimeForPDF = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, "0")}`;
  }
  return `${mins}min`;
};

// Helper function to create page break styles
export const createPageBreak = () =>
  StyleSheet.create({
    pageBreak: {
      pageBreakBefore: "always",
    },
  });
