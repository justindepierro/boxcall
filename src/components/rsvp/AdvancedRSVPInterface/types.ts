/**
 * Advanced RSVP Interface - Types
 *
 * Shared type definitions for the modular RSVP system
 */

import type { AdvancedRSVP } from "../../../types/enhanced-calendar";

export interface AdvancedRSVPInterfaceProps {
  eventId: string;
  userId: string;
  userRole: "coach" | "player" | "parent";
  isRequired?: boolean;
  allowConditional?: boolean;
  allowDetailedResponse?: boolean;
  requireEmergencyContact?: boolean;
  allowGroupResponses?: boolean;
  deadline?: string;
}

export interface RSVPFormProps {
  rsvp: AdvancedRSVP | null;
  onUpdate: (data: Partial<AdvancedRSVP>) => Promise<AdvancedRSVP>;
  canRespond: boolean;
  allowConditional: boolean;
  allowDetailedResponse: boolean;
  requireEmergencyContact: boolean;
  allowGroupResponses: boolean;
  userRole: string;
}

export interface RSVPAnalyticsProps {
  eventId: string;
  visible: boolean;
  onToggle: () => void;
}

export interface RSVPHeaderProps {
  isRequired: boolean;
  deadline?: string;
  canViewAnalytics: boolean;
  showAnalytics: boolean;
  onToggleAnalytics: () => void;
}

export interface RSVPStatusDisplayProps {
  rsvp: AdvancedRSVP | null;
  userRole: string;
}
