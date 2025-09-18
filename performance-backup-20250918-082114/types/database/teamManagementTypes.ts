// =============================================================================
// ENHANCED TEAM MANAGEMENT TYPES
// TypeScript interfaces for Migration 008 - Complete Team Management System
// Generated: August 7, 2025
// =============================================================================

/**
 * Enhanced Team Information with League/Division Structure
 */
export interface Team {
  id: string;
  name: string;
  league_id?: string;
  division_id?: string;
  season: string;
  team_type: "youth" | "high_school" | "college" | "adult" | "professional";
  age_group?: string; // '8U', '12U', 'JV', 'Varsity', etc.
  skill_level?: "recreational" | "competitive" | "elite";
  established_date?: string;
  team_colors: {
    primary: string;
    secondary?: string;
    accent?: string;
  };
  logo_url?: string;
  home_field?: string;
  practice_facility?: string;
  team_motto?: string;
  team_goals: string[];
  season_objectives: string[];

  // Contact and administrative info
  organization_name?: string;
  head_coach_id?: string;
  assistant_coaches: string[];
  team_managers: string[];
  parent_coordinators: string[];

  // Settings and preferences
  practice_duration_minutes: number;
  game_duration_minutes: number;
  roster_size_limit: number;
  attendance_tracking_enabled: boolean;
  performance_tracking_enabled: boolean;
  parent_communication_enabled: boolean;

  // Season structure
  regular_season_start?: string;
  regular_season_end?: string;
  playoffs_start?: string;
  playoffs_end?: string;
  season_status:
    | "preseason"
    | "regular"
    | "playoffs"
    | "postseason"
    | "offseason";

  // Team statistics
  wins: number;
  losses: number;
  ties: number;
  win_percentage: number;

  created_at: string;
  updated_at: string;
}

/**
 * League and Division Structure
 */
export interface League {
  id: string;
  name: string;
  organization_name: string;
  league_type: "youth" | "high_school" | "college" | "adult" | "professional";
  region: string;
  state_province?: string;
  country: string;
  season: string;
  start_date: string;
  end_date: string;
  website_url?: string;
  contact_email?: string;
  contact_phone?: string;
  rules_and_regulations?: string;
  created_at: string;
  updated_at: string;
}

export interface Division {
  id: string;
  league_id: string;
  name: string;
  age_group: string;
  skill_level: "recreational" | "competitive" | "elite";
  max_teams: number;
  current_teams: number;
  playoff_format?: string;
  season_format?: string; // 'round_robin', 'single_elimination', 'double_elimination'
  created_at: string;
  updated_at: string;
}

/**
 * Enhanced Staff Roles with Detailed Responsibilities
 */
export interface StaffRole {
  id: string;
  team_id: string;
  user_id: string;
  role_type:
    | "head_coach"
    | "assistant_coach"
    | "coordinator"
    | "manager"
    | "volunteer"
    | "parent_helper";
  title: string; // "Offensive Coordinator", "Team Manager", etc.
  responsibilities: string[];
  areas_of_expertise: string[];

  // Permissions and access
  can_edit_roster: boolean;
  can_schedule_practices: boolean;
  can_schedule_games: boolean;
  can_track_performance: boolean;
  can_communicate_with_parents: boolean;
  can_manage_equipment: boolean;
  can_view_medical_info: boolean;
  administrative_access: boolean;

  // Coaching qualifications
  certifications: string[];
  coaching_experience_years?: number;
  background_check_date?: string;
  training_completed: string[];

  // Contact and availability
  phone_number?: string;
  emergency_contact?: string;
  available_days: string[];
  available_times: string[];

  // Assignment details
  start_date: string;
  end_date?: string;
  is_active: boolean;
  compensation_type?: "volunteer" | "paid" | "stipend";
  compensation_amount?: number;

  created_at: string;
  updated_at: string;
}

/**
 * Team Communication System
 */
export interface TeamCommunication {
  id: string;
  team_id: string;
  sender_id: string;
  message_type:
    | "announcement"
    | "reminder"
    | "update"
    | "emergency"
    | "celebration";
  title: string;
  content: string;

  // Targeting and delivery
  target_audience: string[]; // 'all_players', 'parents', 'coaches', 'specific_players'
  specific_recipients?: string[]; // User IDs if specific targeting
  delivery_method: string[]; // 'in_app', 'email', 'sms', 'push'

  // Scheduling
  send_immediately: boolean;
  scheduled_send_time?: string;
  recurring?: boolean;
  recurrence_pattern?: string; // 'weekly', 'daily', etc.

  // Attachments and media
  attachments: string[];
  images: string[];
  documents: string[];
  links: string[];

  // Tracking and engagement
  read_receipts_enabled: boolean;
  responses_allowed: boolean;
  priority_level: "low" | "normal" | "high" | "urgent";
  acknowledgment_required: boolean;

  // Status and delivery tracking
  status: "draft" | "scheduled" | "sent" | "delivered" | "failed";
  sent_at?: string;
  delivered_count: number;
  read_count: number;
  response_count: number;

  created_at: string;
  updated_at: string;
}

/**
 * Communication Recipients and Tracking
 */
export interface CommunicationRecipient {
  id: string;
  communication_id: string;
  recipient_id: string;
  recipient_type: "player" | "parent" | "coach" | "staff";
  delivery_method: "in_app" | "email" | "sms" | "push";

  // Delivery tracking
  sent_at?: string;
  delivered_at?: string;
  read_at?: string;
  responded_at?: string;
  acknowledgment_at?: string;

  // Status and engagement
  delivery_status: "pending" | "sent" | "delivered" | "read" | "failed";
  failure_reason?: string;
  response_content?: string;

  created_at: string;
  updated_at: string;
}

/**
 * Equipment and Resource Management
 */
export interface TeamEquipment {
  id: string;
  team_id: string;
  equipment_name: string;
  equipment_type:
    | "helmets"
    | "pads"
    | "jerseys"
    | "balls"
    | "cones"
    | "training"
    | "medical"
    | "other";
  description?: string;

  // Inventory tracking
  total_quantity: number;
  available_quantity: number;
  checked_out_quantity: number;
  damaged_quantity: number;
  lost_quantity: number;

  // Item details
  size_options: string[];
  condition_rating: number; // 1-10 scale
  purchase_date?: string;
  purchase_cost?: number;
  warranty_expiration?: string;
  replacement_due_date?: string;

  // Storage and maintenance
  storage_location?: string;
  last_maintenance_date?: string;
  next_maintenance_date?: string;
  maintenance_notes?: string;

  // Safety and compliance
  safety_certified: boolean;
  certification_expiration?: string;
  age_group_appropriate: string[];

  created_by: string;
  created_at: string;
  updated_at: string;
}

/**
 * Equipment Check-out and Tracking
 */
export interface EquipmentCheckout {
  id: string;
  equipment_id: string;
  checked_out_to: string; // User ID
  checked_out_by: string; // Staff member who processed checkout
  quantity: number;
  size?: string;

  // Checkout details
  checkout_date: string;
  expected_return_date: string;
  actual_return_date?: string;

  // Condition tracking
  checkout_condition: string;
  return_condition?: string;
  damage_notes?: string;
  cleaning_required: boolean;

  // Status
  status: "checked_out" | "returned" | "overdue" | "lost" | "damaged";
  late_fee_assessed?: number;
  replacement_fee_assessed?: number;

  notes?: string;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// UTILITY TYPES AND INTERFACES
// =============================================================================

/**
 * Team Dashboard Summary
 */
export interface TeamDashboardSummary {
  team: Team;
  roster_count: number;
  active_coaches: number;
  upcoming_practices: number;
  upcoming_games: number;
  recent_communications: TeamCommunication[];
  equipment_alerts: EquipmentAlert[];
  performance_highlights: string[];
  season_progress: {
    games_played: number;
    games_remaining: number;
    current_standing?: string;
  };
}

export interface EquipmentAlert {
  equipment_id: string;
  equipment_name: string;
  alert_type:
    | "low_stock"
    | "maintenance_due"
    | "overdue_return"
    | "expired_certification";
  message: string;
  priority: "low" | "medium" | "high";
}

/**
 * Communication Templates and Preferences
 */
export interface CommunicationTemplate {
  id: string;
  team_id: string;
  template_name: string;
  message_type: TeamCommunication["message_type"];
  subject_template: string;
  content_template: string;
  default_audience: string[];
  is_active: boolean;
  usage_count: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

/**
 * Creation Payloads
 */
export interface CreateTeamPayload {
  name: string;
  league_id?: string;
  division_id?: string;
  season: string;
  team_type: Team["team_type"];
  age_group?: string;
  skill_level?: Team["skill_level"];
  team_colors: Team["team_colors"];
  team_goals?: string[];
  season_objectives?: string[];
  practice_duration_minutes?: number;
  game_duration_minutes?: number;
  roster_size_limit?: number;
}

export interface CreateStaffRolePayload {
  user_id: string;
  role_type: StaffRole["role_type"];
  title: string;
  responsibilities?: string[];
  areas_of_expertise?: string[];
  certifications?: string[];
  coaching_experience_years?: number;
  phone_number?: string;
  available_days?: string[];
  available_times?: string[];
  start_date?: string;
}

export interface CreateCommunicationPayload {
  message_type: TeamCommunication["message_type"];
  title: string;
  content: string;
  target_audience: string[];
  specific_recipients?: string[];
  delivery_method?: string[];
  send_immediately?: boolean;
  scheduled_send_time?: string;
  priority_level?: TeamCommunication["priority_level"];
  acknowledgment_required?: boolean;
}

export interface CreateEquipmentPayload {
  equipment_name: string;
  equipment_type: TeamEquipment["equipment_type"];
  description?: string;
  total_quantity: number;
  size_options?: string[];
  purchase_date?: string;
  purchase_cost?: number;
  storage_location?: string;
  safety_certified?: boolean;
}

// =============================================================================
// SERVICE INTERFACES
// =============================================================================

export interface TeamManagementService {
  // Team management
  createTeam(payload: CreateTeamPayload): Promise<Team>;
  updateTeam(
    teamId: string,
    payload: Partial<CreateTeamPayload>
  ): Promise<Team>;
  getTeam(teamId: string): Promise<Team | null>;
  listUserTeams(userId: string): Promise<Team[]>;
  deleteTeam(teamId: string): Promise<void>;

  // Staff management
  addStaffRole(
    teamId: string,
    payload: CreateStaffRolePayload
  ): Promise<StaffRole>;
  updateStaffRole(
    roleId: string,
    payload: Partial<CreateStaffRolePayload>
  ): Promise<StaffRole>;
  removeStaffRole(roleId: string): Promise<void>;
  listTeamStaff(teamId: string): Promise<StaffRole[]>;

  // Communication
  sendCommunication(
    teamId: string,
    payload: CreateCommunicationPayload
  ): Promise<TeamCommunication>;
  scheduleCommunication(
    teamId: string,
    payload: CreateCommunicationPayload
  ): Promise<TeamCommunication>;
  getCommunicationHistory(
    teamId: string,
    limit?: number
  ): Promise<TeamCommunication[]>;
  markCommunicationRead(communicationId: string, userId: string): Promise<void>;

  // Equipment management
  addEquipment(
    teamId: string,
    payload: CreateEquipmentPayload
  ): Promise<TeamEquipment>;
  updateEquipment(
    equipmentId: string,
    payload: Partial<CreateEquipmentPayload>
  ): Promise<TeamEquipment>;
  checkoutEquipment(
    equipmentId: string,
    userId: string,
    quantity: number
  ): Promise<EquipmentCheckout>;
  returnEquipment(
    checkoutId: string,
    condition?: string
  ): Promise<EquipmentCheckout>;
  getEquipmentInventory(teamId: string): Promise<TeamEquipment[]>;
  getEquipmentAlerts(teamId: string): Promise<EquipmentAlert[]>;

  // Dashboard and analytics
  getTeamDashboard(teamId: string): Promise<TeamDashboardSummary>;
  getTeamStatistics(teamId: string, season: string): Promise<unknown>;
}

// =============================================================================
// EXPORTS - All interfaces exported above
// =============================================================================
