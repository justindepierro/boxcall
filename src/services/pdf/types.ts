/**
 * PDF Generation Types
 *
 * Shared types for all PDF generation across the application.
 * This ensures consistency and reusability for different document types.
 */

// Error handling
export class PDFError extends Error {
  code: string;
  details?: string;

  constructor(message: string, code: string, details?: string) {
    super(message);
    this.name = "PDFError";
    this.code = code;
    this.details = details;
  }
}

export interface PDFDocument {
  title: string;
  author?: string;
  subject?: string;
  creator?: string;
  producer?: string;
  creationDate?: Date;
  modificationDate?: Date;
}

export interface PDFBranding {
  teamName?: string;
  teamLogo?: string;
  teamColors?: {
    primary: string;
    secondary: string;
    accent: string;
  };
  watermark?: string;
  colors?: {
    primary: string;
    secondary: string;
  };
  fonts?: {
    primary: string;
    secondary: string;
  };
}

export interface PDFTemplate {
  id?: string;
  name?: string;
  description?: string;
  pageFormat: "A4" | "Letter" | "Legal";
  pageOrientation: "portrait" | "landscape";
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  colors?: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    background: string;
  };
  fonts?: {
    primary: string;
    secondary: string;
    monospace: string;
  };
  header?: {
    enabled: boolean;
    height: number;
    includeDate?: boolean;
    includePageNumbers?: boolean;
  };
  footer?: {
    enabled: boolean;
    height: number;
    includePageNumbers?: boolean;
    includeGeneratedTime?: boolean;
  };
}

export interface PDFExportOptions {
  template?: PDFTemplate;
  branding?: PDFBranding;
  includeHeader?: boolean;
  includeFooter?: boolean;
  includePageNumbers?: boolean;
  filename?: string;
  format?: "A4" | "Letter" | "Legal";
  orientation?: "portrait" | "landscape";
  quality?: number;
}

// Practice Script Specific Types
export interface PracticeScriptPDFData {
  // Basic Info
  title: string;
  date: string;
  duration: number;
  location: string;
  weather?: string;

  // Timeline/Blocks
  practiceBlocks: Array<{
    id: string;
    title: string;
    category: string;
    startTime: string;
    endTime: string;
    duration: number;
    location?: string;
    notes?: string;
    assignedCoach?: string;
    groups?: Array<{
      id: string;
      name: string;
      notes?: string;
    }>;
    scripts?: Array<{
      id: string;
      title: string;
      content: string;
      duration?: number;
    }>;
  }>;

  // Staff
  coaches: Array<{
    id: string;
    name: string;
    role: string;
    assignments?: string[];
  }>;

  // Equipment & Setup
  equipment?: Array<{
    item: string;
    quantity?: number;
    location?: string;
  }>;

  // Summary Stats
  summary?: {
    totalMinutes: number;
    categoryBreakdown: Record<string, number>;
    coachUtilization: Record<string, number>;
    objectives?: string[];
  };
}

// Playbook/Script Specific Types (for future use)
export interface PlaybookPDFData {
  title: string;
  plays: Array<{
    id: string;
    name: string;
    formation: string;
    diagram?: string;
    description: string;
    tags?: string[];
  }>;
}

// Game Plan Specific Types (for future use)
export interface GamePlanPDFData {
  opponent: string;
  gameDate: string;
  offensiveStrategy: string;
  defensiveStrategy: string;
  specialTeamsNotes: string;
  keyPlayers: Array<{
    name: string;
    position: string;
    notes: string;
  }>;
}
