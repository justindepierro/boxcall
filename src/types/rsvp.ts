/**
 * RSVP Types
 * Essential types extracted from enhanced-calendar.ts
 */

export interface AdvancedRSVP {
  id: string;
  event_id: string;
  user_id: string;
  status: RSVPStatus;
  response_type: "simple" | "conditional" | "detailed";
  // Conditional responses
  conditions?: RSVPCondition[];
  conditional_status?: RSVPStatus;
  // Detailed information
  arrival_time?: string;
  departure_time?: string;
  transportation?: "driving" | "walking" | "bus" | "carpool" | "other";
  dietary_restrictions?: string[];
  special_requests?: string;
  emergency_contact?: EmergencyContact;
  // Group responses (for parents/guardians)
  group_size?: number;
  attendee_names?: string[];
  // Additional fields
  notes?: string;
  private_notes?: string; // Only visible to coaches
  confidence_level?: 1 | 2 | 3 | 4 | 5; // How sure they are about attending
  // Timestamps
  responded_at: string;
  updated_at: string;
  reminder_sent_at?: string;
}

export type RSVPStatus =
  | "attending"
  | "not_attending"
  | "maybe"
  | "late"
  | "early_departure"
  | "conditional"
  | "no_response";

export interface RSVPCondition {
  id: string;
  type:
    | "weather"
    | "time_change"
    | "location_change"
    | "opponent_change"
    | "custom";
  description: string;
  if_condition: string;
  then_status: RSVPStatus;
  then_notes?: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}
