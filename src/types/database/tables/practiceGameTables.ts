/**
 * Practice and Game Related Tables
 * All tables related to practices, games, plays, and performance tracking
 * Updated for Phase 1 Foundation - Critical Schema Fixes
 */

// Define Json type locally for this module
type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface PracticeGameTables {
  // 🔥 CRITICAL: Calendar Events table (required by Phase 3 services)
  calendar_events: {
    Row: {
      id: string;
      team_id: string;
      title: string;
      description: string | null;
      event_type: "practice" | "game" | "meeting" | "event";
      start_time: string;
      end_time: string;
      location: string | null;
      is_recurring: boolean | null;
      recurrence_rule: string | null;
      created_by: string;
      created_at: string;
      updated_at: string;
      status: "confirmed" | "tentative" | "cancelled";
      attendee_count: number | null;
      priority: "low" | "normal" | "high" | "urgent";
      color: string | null;
      is_all_day: boolean | null;
      reminder_minutes: number | null;
      metadata: Json | null;
    };
    Insert: {
      id?: string;
      team_id: string;
      title: string;
      description?: string | null;
      event_type: "practice" | "game" | "meeting" | "event";
      start_time: string;
      end_time: string;
      location?: string | null;
      is_recurring?: boolean | null;
      recurrence_rule?: string | null;
      created_by: string;
      created_at?: string;
      updated_at?: string;
      status?: "confirmed" | "tentative" | "cancelled";
      attendee_count?: number | null;
      priority?: "low" | "normal" | "high" | "urgent";
      color?: string | null;
      is_all_day?: boolean | null;
      reminder_minutes?: number | null;
      metadata?: Json | null;
    };
    Update: {
      id?: string;
      team_id?: string;
      title?: string;
      description?: string | null;
      event_type?: "practice" | "game" | "meeting" | "event";
      start_time?: string;
      end_time?: string;
      location?: string | null;
      is_recurring?: boolean | null;
      recurrence_rule?: string | null;
      created_by?: string;
      created_at?: string;
      updated_at?: string;
      status?: "confirmed" | "tentative" | "cancelled";
      attendee_count?: number | null;
      priority?: "low" | "normal" | "high" | "urgent";
      color?: string | null;
      is_all_day?: boolean | null;
      reminder_minutes?: number | null;
      metadata?: Json | null;
    };
  };

  // 🔥 CRITICAL: Practice Schedules table (required by practiceService.ts)
  practice_schedules: {
    Row: {
      id: string;
      team_id: string;
      title: string;
      description: string | null;
      date_scheduled: string;
      start_time: string;
      end_time: string;
      location: string | null;
      field_type: string | null;
      weather_conditions: string | null;
      total_duration: number | null;
      created_by: string;
      is_template: boolean | null;
      tags: string[] | null;
      created_at: string;
      updated_at: string;
      equipment_required: string[] | null;
      coaching_notes: string | null;
      objectives: string[] | null;
      completion_status:
        | "scheduled"
        | "in_progress"
        | "completed"
        | "cancelled";
      calendar_event_id: string | null;
    };
    Insert: {
      id?: string;
      team_id: string;
      title: string;
      description?: string | null;
      date_scheduled: string;
      start_time: string;
      end_time: string;
      location?: string | null;
      field_type?: string | null;
      weather_conditions?: string | null;
      total_duration?: number | null;
      created_by: string;
      is_template?: boolean | null;
      tags?: string[] | null;
      created_at?: string;
      updated_at?: string;
      equipment_required?: string[] | null;
      coaching_notes?: string | null;
      objectives?: string[] | null;
      completion_status?:
        | "scheduled"
        | "in_progress"
        | "completed"
        | "cancelled";
      calendar_event_id?: string | null;
    };
    Update: {
      id?: string;
      team_id?: string;
      title?: string;
      description?: string | null;
      date_scheduled?: string;
      start_time?: string;
      end_time?: string;
      location?: string | null;
      field_type?: string | null;
      weather_conditions?: string | null;
      total_duration?: number | null;
      created_by?: string;
      is_template?: boolean | null;
      tags?: string[] | null;
      created_at?: string;
      updated_at?: string;
      equipment_required?: string[] | null;
      coaching_notes?: string | null;
      objectives?: string[] | null;
      completion_status?:
        | "scheduled"
        | "in_progress"
        | "completed"
        | "cancelled";
      calendar_event_id?: string | null;
    };
  };

  // 🔥 CRITICAL: Practice Attendance table (required by practiceService.ts)
  practice_attendance: {
    Row: {
      id: string;
      practice_id: string;
      user_id: string;
      attendance_status: "present" | "absent" | "late" | "excused";
      arrival_time: string | null;
      notes: string | null;
      recorded_by: string;
      recorded_at: string;
    };
    Insert: {
      id?: string;
      practice_id: string;
      user_id: string;
      attendance_status: "present" | "absent" | "late" | "excused";
      arrival_time?: string | null;
      notes?: string | null;
      recorded_by: string;
      recorded_at?: string;
    };
    Update: {
      id?: string;
      practice_id?: string;
      user_id?: string;
      attendance_status?: "present" | "absent" | "late" | "excused";
      arrival_time?: string | null;
      notes?: string | null;
      recorded_by?: string;
      recorded_at?: string;
    };
  };

  // 🔥 CRITICAL: Equipment table (required by practiceService.ts)
  equipment: {
    Row: {
      id: string;
      team_id: string;
      name: string;
      category: string;
      quantity: number | null;
      condition: "excellent" | "good" | "fair" | "poor";
      location: string | null;
      purchase_date: string | null;
      cost: number | null;
      notes: string | null;
      created_at: string;
      updated_at: string;
      is_active: boolean | null;
      checkout_status: "available" | "checked_out" | "maintenance";
    };
    Insert: {
      id?: string;
      team_id: string;
      name: string;
      category: string;
      quantity?: number | null;
      condition?: "excellent" | "good" | "fair" | "poor";
      location?: string | null;
      purchase_date?: string | null;
      cost?: number | null;
      notes?: string | null;
      created_at?: string;
      updated_at?: string;
      is_active?: boolean | null;
      checkout_status?: "available" | "checked_out" | "maintenance";
    };
    Update: {
      id?: string;
      team_id?: string;
      name?: string;
      category?: string;
      quantity?: number | null;
      condition?: "excellent" | "good" | "fair" | "poor";
      location?: string | null;
      purchase_date?: string | null;
      cost?: number | null;
      notes?: string | null;
      created_at?: string;
      updated_at?: string;
      is_active?: boolean | null;
      checkout_status?: "available" | "checked_out" | "maintenance";
    };
  };

  practice_scripts: {
    Row: {
      id: string;
      team_id: string;
      name: string;
      description: string | null;
      focus_area: string | null;
      duration_minutes: number | null;
      difficulty_level: "beginner" | "intermediate" | "advanced" | null;
      equipment_needed: string[] | null;
      weather_conditions: string | null;
      created_by: string;
      is_template: boolean | null;
      tags: string[] | null;
      created_at: string | null;
      updated_at: string | null;
    };
    Insert: {
      id?: string;
      team_id: string;
      name: string;
      description?: string | null;
      focus_area?: string | null;
      duration_minutes?: number | null;
      difficulty_level?: "beginner" | "intermediate" | "advanced" | null;
      equipment_needed?: string[] | null;
      weather_conditions?: string | null;
      created_by: string;
      is_template?: boolean | null;
      tags?: string[] | null;
      created_at?: string | null;
      updated_at?: string | null;
    };
    Update: {
      id?: string;
      team_id?: string;
      name?: string;
      description?: string | null;
      focus_area?: string | null;
      duration_minutes?: number | null;
      difficulty_level?: "beginner" | "intermediate" | "advanced" | null;
      equipment_needed?: string[] | null;
      weather_conditions?: string | null;
      created_by?: string;
      is_template?: boolean | null;
      tags?: string[] | null;
      created_at?: string | null;
      updated_at?: string | null;
    };
  };
  games: {
    Row: {
      id: string;
      team_id: string;
      opponent_name: string;
      game_date: string | null;
      game_time: string | null;
      location: string | null;
      home_away: "home" | "away" | "neutral" | null;
      final_score_us: number | null;
      final_score_them: number | null;
      weather_conditions: string | null;
      game_notes: string | null;
      created_at: string | null;
    };
    Insert: {
      id?: string;
      team_id: string;
      opponent_name: string;
      game_date?: string | null;
      game_time?: string | null;
      location?: string | null;
      home_away?: "home" | "away" | "neutral" | null;
      final_score_us?: number | null;
      final_score_them?: number | null;
      weather_conditions?: string | null;
      game_notes?: string | null;
      created_at?: string | null;
    };
    Update: {
      id?: string;
      team_id?: string;
      opponent_name?: string;
      game_date?: string | null;
      game_time?: string | null;
      location?: string | null;
      home_away?: "home" | "away" | "neutral" | null;
      final_score_us?: number | null;
      final_score_them?: number | null;
      weather_conditions?: string | null;
      game_notes?: string | null;
      created_at?: string | null;
    };
  };
  playbooks: {
    Row: {
      id: string;
      team_id: string;
      name: string;
      description: string | null;
      playbook_type: "offense" | "defense" | "special_teams" | null;
      is_active: boolean | null;
      created_by: string;
      created_at: string | null;
      updated_at: string | null;
    };
    Insert: {
      id?: string;
      team_id: string;
      name: string;
      description?: string | null;
      playbook_type?: "offense" | "defense" | "special_teams" | null;
      is_active?: boolean | null;
      created_by: string;
      created_at?: string | null;
      updated_at?: string | null;
    };
    Update: {
      id?: string;
      team_id?: string;
      name?: string;
      description?: string | null;
      playbook_type?: "offense" | "defense" | "special_teams" | null;
      is_active?: boolean | null;
      created_by?: string;
      created_at?: string | null;
      updated_at?: string | null;
    };
  };
  personnel_configurations: {
    Row: {
      id: string;
      playbook_id: string;
      name: string;
      description: string | null;
      created_at: string;
      updated_at: string;
    };
    Insert: {
      id?: string;
      playbook_id: string;
      name: string;
      description?: string | null;
      created_at?: string;
      updated_at?: string;
    };
    Update: {
      id?: string;
      playbook_id?: string;
      name?: string;
      description?: string | null;
      created_at?: string;
      updated_at?: string;
    };
  };
  personnel_players: {
    Row: {
      id: string;
      config_id: string;
      player_position: "QB" | "RB" | "TE" | "WR";
      label: string;
      sort_order: number;
      is_wildcat_qb: boolean;
      created_at: string;
    };
    Insert: {
      id?: string;
      config_id: string;
      player_position: "QB" | "RB" | "TE" | "WR";
      label: string;
      sort_order: number;
      is_wildcat_qb?: boolean;
      created_at?: string;
    };
    Update: {
      id?: string;
      config_id?: string;
      player_position?: "QB" | "RB" | "TE" | "WR";
      label?: string;
      sort_order?: number;
      is_wildcat_qb?: boolean;
      created_at?: string;
    };
  };
  formations: {
    Row: {
      id: string;
      playbook_id: string;
      name: string;
      description: string | null;
      category: "spread" | "pro" | "power" | "special" | "goal_line" | "short_yardage" | null;
      personnel_id: string | null;
      personnel_name: string | null;
      base_formation_id: string | null;
      direction: "base" | "left" | "right";
      strength_player_position: string | null;
      strength_player_label: string | null;
      player_positions: Json;
      tags: string[];
      is_custom: boolean;
      usage_count: number;
      created_by: string;
      created_at: string;
      updated_at: string;
    };
    Insert: {
      id?: string;
      playbook_id: string;
      name: string;
      description?: string | null;
      category?: "spread" | "pro" | "power" | "special" | "goal_line" | "short_yardage" | null;
      personnel_id?: string | null;
      personnel_name?: string | null;
      base_formation_id?: string | null;
      direction?: "base" | "left" | "right";
      strength_player_position?: string | null;
      strength_player_label?: string | null;
      player_positions: Json;
      tags?: string[];
      is_custom?: boolean;
      usage_count?: number;
      created_by: string;
      created_at?: string;
      updated_at?: string;
    };
    Update: {
      id?: string;
      playbook_id?: string;
      name?: string;
      description?: string | null;
      category?: "spread" | "pro" | "power" | "special" | "goal_line" | "short_yardage" | null;
      personnel_id?: string | null;
      personnel_name?: string | null;
      base_formation_id?: string | null;
      direction?: "base" | "left" | "right";
      strength_player_position?: string | null;
      strength_player_label?: string | null;
      player_positions?: Json;
      tags?: string[];
      is_custom?: boolean;
      usage_count?: number;
      created_by?: string;
      created_at?: string;
      updated_at?: string;
    };
  };
  plays: {
    Row: {
      id: string;
      playbook_id: string;
      formation: string;
      formation_id: string | null;
      formation_direction: "base" | "left" | "right" | null;
      f_dir: string | null;
      play_type: string | null;
      concept: string | null;
      description: string | null;
      diagram_url: string | null;
      tags: string[] | null;
      success_rate: number | null;
      avg_yards: number | null;
      situational_usage: Json | null;
      coaching_points: string[] | null;
      personnel_package: string | null;
      snap_count: string | null;
      motion_details: string | null;
      route_concepts: string[] | null;
      blocking_scheme: string | null;
      reads_progression: string[] | null;
      audible_options: string[] | null;
      game_situations: string[] | null;
      video_url: string | null;
      difficulty_level: "basic" | "intermediate" | "advanced" | null;
      install_priority: number | null;
      last_practiced: string | null;
      practice_notes: string | null;
      game_notes: string | null;
      is_active: boolean | null;
      created_by: string;
      created_at: string | null;
      updated_at: string | null;
    };
    Insert: {
      id?: string;
      playbook_id: string;
      formation: string;
      formation_id?: string | null;
      formation_direction?: "base" | "left" | "right" | null;
      f_dir?: string | null;
      play_type?: string | null;
      concept?: string | null;
      description?: string | null;
      diagram_url?: string | null;
      tags?: string[] | null;
      success_rate?: number | null;
      avg_yards?: number | null;
      situational_usage?: Json | null;
      coaching_points?: string[] | null;
      personnel_package?: string | null;
      snap_count?: string | null;
      motion_details?: string | null;
      route_concepts?: string[] | null;
      blocking_scheme?: string | null;
      reads_progression?: string[] | null;
      audible_options?: string[] | null;
      game_situations?: string[] | null;
      video_url?: string | null;
      difficulty_level?: "basic" | "intermediate" | "advanced" | null;
      install_priority?: number | null;
      last_practiced?: string | null;
      practice_notes?: string | null;
      game_notes?: string | null;
      is_active?: boolean | null;
      created_by: string;
      created_at?: string | null;
      updated_at?: string | null;
    };
    Update: {
      id?: string;
      playbook_id?: string;
      formation?: string;
      formation_id?: string | null;
      formation_direction?: "base" | "left" | "right" | null;
      f_dir?: string | null;
      play_type?: string | null;
      concept?: string | null;
      description?: string | null;
      diagram_url?: string | null;
      tags?: string[] | null;
      success_rate?: number | null;
      avg_yards?: number | null;
      situational_usage?: Json | null;
      coaching_points?: string[] | null;
      personnel_package?: string | null;
      snap_count?: string | null;
      motion_details?: string | null;
      route_concepts?: string[] | null;
      blocking_scheme?: string | null;
      reads_progression?: string[] | null;
      audible_options?: string[] | null;
      game_situations?: string[] | null;
      video_url?: string | null;
      difficulty_level?: "basic" | "intermediate" | "advanced" | null;
      install_priority?: number | null;
      last_practiced?: string | null;
      practice_notes?: string | null;
      game_notes?: string | null;
      is_active?: boolean | null;
      created_by?: string;
      created_at?: string | null;
      updated_at?: string | null;
    };
  };
  script_plays: {
    Row: {
      id: string;
      script_id: string;
      play_id: string;
      order_index: number;
      reps: number | null;
      emphasis: string | null;
      notes: string | null;
      created_at: string | null;
    };
    Insert: {
      id?: string;
      script_id: string;
      play_id: string;
      order_index: number;
      reps?: number | null;
      emphasis?: string | null;
      notes?: string | null;
      created_at?: string | null;
    };
    Update: {
      id?: string;
      script_id?: string;
      play_id?: string;
      order_index?: number;
      reps?: number | null;
      emphasis?: string | null;
      notes?: string | null;
      created_at?: string | null;
    };
  };
  play_calls: {
    Row: {
      id: string;
      game_id: string;
      play_id: string;
      quarter: number | null;
      time_remaining: string | null;
      down: number | null;
      distance: number | null;
      yard_line: number | null;
      hash_mark: "left" | "middle" | "right" | null;
      result_yards: number | null;
      result_type:
        | "success"
        | "failure"
        | "turnover"
        | "touchdown"
        | "first_down"
        | null;
      notes: string | null;
      created_at: string | null;
    };
    Insert: {
      id?: string;
      game_id: string;
      play_id: string;
      quarter?: number | null;
      time_remaining?: string | null;
      down?: number | null;
      distance?: number | null;
      yard_line?: number | null;
      hash_mark?: "left" | "middle" | "right" | null;
      result_yards?: number | null;
      result_type?:
        | "success"
        | "failure"
        | "turnover"
        | "touchdown"
        | "first_down"
        | null;
      notes?: string | null;
      created_at?: string | null;
    };
    Update: {
      id?: string;
      game_id?: string;
      play_id?: string;
      quarter?: number | null;
      time_remaining?: string | null;
      down?: number | null;
      distance?: number | null;
      yard_line?: number | null;
      hash_mark?: "left" | "middle" | "right" | null;
      result_yards?: number | null;
      result_type?:
        | "success"
        | "failure"
        | "turnover"
        | "touchdown"
        | "first_down"
        | null;
      notes?: string | null;
      created_at?: string | null;
    };
  };
}
