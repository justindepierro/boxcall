/**
 * Practice and Game Related Tables
 * All tables related to practices, games, plays, and performance tracking
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
  plays: {
    Row: {
      id: string;
      playbook_id: string;
      formation: string;
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
