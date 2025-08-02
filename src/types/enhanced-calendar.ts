// Enhanced Calendar Types for Phase 2.3 Features
// Team-wide polling, advanced RSVP, permissions, and bulk operations

import type { CalendarEvent } from '../services/calendarService';

// ============================================================================
// EVENT POLLING SYSTEM
// ============================================================================

export interface EventPoll {
  id: string;
  event_id: string;
  title: string;
  description?: string;
  question: string;
  poll_type: 'single_choice' | 'multiple_choice' | 'text_response' | 'rating' | 'yes_no';
  options: PollOption[];
  is_anonymous: boolean;
  allow_comments: boolean;
  deadline?: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface PollOption {
  id: string;
  poll_id: string;
  text: string;
  order_index: number;
  color?: string;
  emoji?: string;
}

export interface PollResponse {
  id: string;
  poll_id: string;
  user_id: string;
  selected_options: string[]; // Array of option IDs
  text_response?: string;
  rating_value?: number;
  comment?: string;
  is_anonymous: boolean;
  submitted_at: string;
}

export interface PollResults {
  poll: EventPoll;
  total_responses: number;
  total_eligible: number;
  response_rate: number;
  option_results: OptionResult[];
  text_responses?: string[];
  average_rating?: number;
  comments: PollComment[];
}

export interface OptionResult {
  option: PollOption;
  count: number;
  percentage: number;
  respondents?: string[]; // User IDs if not anonymous
}

export interface PollComment {
  id: string;
  user_id?: string; // Null if anonymous
  user_name?: string;
  comment: string;
  timestamp: string;
}

// ============================================================================
// ADVANCED RSVP SYSTEM
// ============================================================================

export interface AdvancedRSVP {
  id: string;
  event_id: string;
  user_id: string;
  status: RSVPStatus;
  response_type: 'simple' | 'conditional' | 'detailed';
  
  // Conditional responses
  conditions?: RSVPCondition[];
  conditional_status?: RSVPStatus;
  
  // Detailed information
  arrival_time?: string;
  departure_time?: string;
  transportation?: 'driving' | 'walking' | 'bus' | 'carpool' | 'other';
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
  | 'attending' 
  | 'not_attending' 
  | 'maybe' 
  | 'late' 
  | 'early_departure' 
  | 'conditional' 
  | 'no_response';

export interface RSVPCondition {
  id: string;
  type: 'weather' | 'time_change' | 'location_change' | 'opponent_change' | 'custom';
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

// RSVP Analytics and Insights
export interface RSVPAnalytics {
  event_id: string;
  total_invited: number;
  total_responded: number;
  response_rate: number;
  status_breakdown: Record<RSVPStatus, number>;
  average_confidence: number;
  response_timeline: RSVPTimelineEntry[];
  late_responders: string[]; // User IDs
  frequent_no_shows: string[]; // User IDs based on historical data
}

export interface RSVPTimelineEntry {
  timestamp: string;
  user_id: string;
  old_status?: RSVPStatus;
  new_status: RSVPStatus;
  change_reason?: string;
}

// ============================================================================
// CALENDAR PERMISSIONS AND ROLES
// ============================================================================

export interface CalendarPermissions {
  user_id: string;
  team_id: string;
  role: CalendarRole;
  permissions: CalendarPermission[];
  custom_permissions?: CustomPermission[];
  granted_by: string;
  granted_at: string;
  expires_at?: string;
  is_active: boolean;
}

export type CalendarRole = 
  | 'owner'           // Team owner - full access
  | 'head_coach'      // Head coach - full calendar management
  | 'assistant_coach' // Assistant coach - limited management
  | 'team_captain'    // Team captain - player coordination
  | 'parent_admin'    // Parent admin - family coordination
  | 'player'          // Player - view and respond
  | 'parent'          // Parent/guardian - family management
  | 'viewer'          // Read-only access
  | 'guest';          // Temporary limited access

export type CalendarPermission = 
  // Event Management
  | 'create_events'
  | 'edit_events'
  | 'delete_events'
  | 'publish_events'
  | 'archive_events'
  
  // Practice Management
  | 'create_practices'
  | 'edit_practice_plans'
  | 'manage_attendance'
  | 'assign_practice_roles'
  
  // Game Management
  | 'create_games'
  | 'edit_game_details'
  | 'manage_lineups'
  | 'update_scores'
  
  // RSVP and Polling
  | 'create_polls'
  | 'view_poll_results'
  | 'manage_rsvps'
  | 'view_rsvp_analytics'
  
  // Team Coordination
  | 'send_notifications'
  | 'bulk_operations'
  | 'export_calendar'
  | 'import_calendar'
  
  // Administrative
  | 'manage_permissions'
  | 'view_analytics'
  | 'manage_integrations'
  | 'access_private_notes';

export interface CustomPermission {
  id: string;
  name: string;
  description: string;
  resource: string; // What resource this applies to
  actions: string[]; // What actions are allowed
  conditions?: string[]; // When this permission applies
}

// Permission validation helpers
export interface PermissionCheck {
  user_id: string;
  team_id: string;
  permission: CalendarPermission;
  resource_id?: string;
  context?: Record<string, string | number | boolean>;
}

export interface PermissionResult {
  allowed: boolean;
  reason?: string;
  required_role?: CalendarRole;
  expires_at?: string;
}

// ============================================================================
// BULK OPERATIONS
// ============================================================================

export interface BulkOperation {
  id: string;
  type: BulkOperationType;
  target_type: 'events' | 'rsvps' | 'polls' | 'permissions';
  target_ids: string[];
  operation_data: Record<string, string | number | boolean | string[]>;
  filters?: BulkOperationFilter[];
  
  // Execution details
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  total_items: number;
  processed_items: number;
  successful_items: number;
  failed_items: number;
  
  // User and team context
  team_id: string;
  initiated_by: string;
  initiated_at: string;
  completed_at?: string;
  
  // Results and logging
  results?: BulkOperationResult[];
  error_log?: BulkOperationError[];
  summary?: string;
}

export type BulkOperationType = 
  // Event operations
  | 'update_events'
  | 'delete_events'
  | 'duplicate_events'
  | 'move_events'
  | 'change_event_type'
  | 'bulk_reschedule'
  
  // RSVP operations
  | 'send_rsvp_reminders'
  | 'update_rsvp_status'
  | 'export_rsvp_data'
  | 'clear_rsvp_responses'
  
  // Poll operations
  | 'create_polls_for_events'
  | 'close_polls'
  | 'export_poll_results'
  | 'duplicate_polls'
  
  // Permission operations
  | 'update_user_permissions'
  | 'bulk_invite_users'
  | 'revoke_permissions'
  | 'migrate_permissions';

export interface BulkOperationFilter {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'starts_with' | 'ends_with' | 'in' | 'between';
  value: string | number | boolean | string[] | number[];
  and_or?: 'and' | 'or';
}

export interface BulkOperationResult {
  item_id: string;
  item_type: string;
  success: boolean;
  old_value?: string | number | boolean;
  new_value?: string | number | boolean;
  error_message?: string;
  warning_message?: string;
}

export interface BulkOperationError {
  item_id: string;
  error_code: string;
  error_message: string;
  severity: 'warning' | 'error' | 'critical';
  timestamp: string;
}

// Bulk operation templates for common scenarios
export interface BulkOperationTemplate {
  id: string;
  name: string;
  description: string;
  operation_type: BulkOperationType;
  default_filters: BulkOperationFilter[];
  default_data: Record<string, string | number | boolean | string[]>;
  team_id?: string; // Null for system templates
  created_by: string;
  created_at: string;
  usage_count: number;
}

// ============================================================================
// ENHANCED EVENT TYPES
// ============================================================================

export interface EnhancedCalendarEvent extends Omit<CalendarEvent, 'tags'> {
  // Polling integration
  polls: EventPoll[];
  active_polls_count: number;
  
  // Advanced RSVP
  rsvp_config: RSVPConfiguration;
  rsvp_analytics: RSVPAnalytics;
  
  // Permissions
  required_permissions: CalendarPermission[];
  visibility_level: 'public' | 'team' | 'coaches' | 'private';
  
  // Bulk operation tracking
  bulk_operation_id?: string;
  last_bulk_update?: string;
  
  // Enhanced metadata
  tags: EventTag[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  reminder_config: ReminderConfiguration;
}

export interface RSVPConfiguration {
  is_required: boolean;
  deadline?: string;
  allow_conditional: boolean;
  allow_detailed_response: boolean;
  require_emergency_contact: boolean;
  allow_group_responses: boolean;
  auto_reminders: boolean;
  reminder_schedule: string[]; // e.g., ['7d', '3d', '1d', '4h']
}

export interface EventTag {
  id: string;
  name: string;
  color: string;
  icon?: string;
  category: 'system' | 'team' | 'custom';
}

export interface ReminderConfiguration {
  enabled: boolean;
  schedule: ReminderSchedule[];
  channels: ('email' | 'sms' | 'push' | 'in_app')[];
  custom_message?: string;
}

export interface ReminderSchedule {
  timing: string; // e.g., '7d', '3d', '1d', '4h', '30m'
  message_template?: string;
  target_roles?: CalendarRole[];
  conditional?: boolean; // Only send if certain conditions are met
}

// ============================================================================
// QUERY AND FILTER TYPES
// ============================================================================

export interface EnhancedCalendarQuery {
  // Standard calendar filters
  team_ids?: string[];
  event_types?: string[];
  date_range?: {
    start: string;
    end: string;
  };
  
  // Enhanced filters
  poll_status?: ('has_polls' | 'active_polls' | 'completed_polls' | 'no_polls')[];
  rsvp_status?: RSVPStatus[];
  permission_level?: CalendarPermission[];
  tags?: string[];
  priority?: ('low' | 'medium' | 'high' | 'critical')[];
  
  // User-specific filters
  user_permissions?: CalendarPermission[];
  user_role?: CalendarRole[];
  user_rsvp_status?: RSVPStatus[];
  
  // Search and sorting
  search_query?: string;
  sort_by?: 'date' | 'priority' | 'rsvp_count' | 'poll_count' | 'updated_at';
  sort_order?: 'asc' | 'desc';
  
  // Pagination
  page?: number;
  limit?: number;
}

// ============================================================================
// WEBHOOK AND INTEGRATION TYPES
// ============================================================================

export interface CalendarWebhook {
  id: string;
  team_id: string;
  event_types: CalendarWebhookEvent[];
  url: string;
  secret: string;
  is_active: boolean;
  headers?: Record<string, string>;
  retry_config: WebhookRetryConfig;
  created_at: string;
  last_triggered?: string;
}

export type CalendarWebhookEvent = 
  | 'event.created'
  | 'event.updated'
  | 'event.deleted'
  | 'rsvp.created'
  | 'rsvp.updated'
  | 'poll.created'
  | 'poll.completed'
  | 'bulk_operation.completed';

export interface WebhookRetryConfig {
  max_attempts: number;
  backoff_strategy: 'linear' | 'exponential';
  base_delay: number; // milliseconds
  max_delay: number; // milliseconds
}

// ============================================================================
// SYSTEM CONFIGURATION
// ============================================================================

export interface CalendarSystemConfig {
  // Feature flags
  features: {
    advanced_polling: boolean;
    conditional_rsvp: boolean;
    bulk_operations: boolean;
    role_based_permissions: boolean;
    webhook_integrations: boolean;
    analytics_dashboard: boolean;
  };
  
  // Limits and quotas
  limits: {
    max_polls_per_event: number;
    max_poll_options: number;
    max_bulk_operation_items: number;
    max_webhook_retries: number;
    max_custom_permissions: number;
  };
  
  // Default configurations
  defaults: {
    rsvp_deadline_hours: number;
    reminder_schedule: string[];
    poll_deadline_hours: number;
    permission_expiry_days: number;
  };
}
