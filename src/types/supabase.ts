export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      achievement_definitions: {
        Row: {
          category: string
          created_at: string | null
          description: string
          icon: string
          id: string
          is_active: boolean | null
          name: string
          points: number
          rarity: string
          trigger_count: number | null
          trigger_target: string
          trigger_type: string
          updated_at: string | null
        }
        Insert: {
          category?: string
          created_at?: string | null
          description: string
          icon?: string
          id?: string
          is_active?: boolean | null
          name: string
          points?: number
          rarity?: string
          trigger_count?: number | null
          trigger_target: string
          trigger_type: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string
          icon?: string
          id?: string
          is_active?: boolean | null
          name?: string
          points?: number
          rarity?: string
          trigger_count?: number | null
          trigger_target?: string
          trigger_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      achievement_progress: {
        Row: {
          achievement_id: string
          completed_at: string | null
          created_at: string | null
          current_count: number | null
          id: string
          is_completed: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          achievement_id: string
          completed_at?: string | null
          created_at?: string | null
          current_count?: number | null
          id?: string
          is_completed?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          achievement_id?: string
          completed_at?: string | null
          created_at?: string | null
          current_count?: number | null
          id?: string
          is_completed?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "achievement_progress_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievement_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      achievements: {
        Row: {
          achievement_type: string
          created_at: string | null
          description: string | null
          earned_date: string
          id: string
          player_id: string | null
        }
        Insert: {
          achievement_type: string
          created_at?: string | null
          description?: string | null
          earned_date: string
          id?: string
          player_id?: string | null
        }
        Update: {
          achievement_type?: string
          created_at?: string | null
          description?: string | null
          earned_date?: string
          id?: string
          player_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "achievements_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "season_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "achievements_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "team_players"
            referencedColumns: ["id"]
          },
        ]
      }
      activities: {
        Row: {
          activity_type: string
          created_at: string
          details: Json | null
          id: string
          play_id: string | null
          play_name: string
          team_id: string | null
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          details?: Json | null
          id?: string
          play_id?: string | null
          play_name: string
          team_id?: string | null
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          details?: Json | null
          id?: string
          play_id?: string | null
          play_name?: string
          team_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_play_id_fkey"
            columns: ["play_id"]
            isOneToOne: false
            referencedRelation: "plays"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_play_id_fkey"
            columns: ["play_id"]
            isOneToOne: false
            referencedRelation: "plays_missing_formation_link"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_play_id_fkey"
            columns: ["play_id"]
            isOneToOne: false
            referencedRelation: "plays_missing_personnel_link"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_feed: {
        Row: {
          action_type: string
          actor_id: string | null
          content: string | null
          created_at: string | null
          id: string
          mentioned_user_id: string | null
          target_id: string | null
          target_type: string | null
          team_id: string | null
        }
        Insert: {
          action_type: string
          actor_id?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          mentioned_user_id?: string | null
          target_id?: string | null
          target_type?: string | null
          team_id?: string | null
        }
        Update: {
          action_type?: string
          actor_id?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          mentioned_user_id?: string | null
          target_id?: string | null
          target_type?: string | null
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_feed_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      announcement_comments: {
        Row: {
          announcement_id: string
          content: string
          content_json: Json | null
          created_at: string | null
          deleted_at: string | null
          id: string
          parent_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          announcement_id: string
          content: string
          content_json?: Json | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          parent_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          announcement_id?: string
          content?: string
          content_json?: Json | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          parent_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcement_comments_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "team_announcements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcement_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "announcement_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      announcement_reactions: {
        Row: {
          announcement_id: string
          created_at: string | null
          id: string
          reaction_type: string
          user_id: string
        }
        Insert: {
          announcement_id: string
          created_at?: string | null
          id?: string
          reaction_type: string
          user_id: string
        }
        Update: {
          announcement_id?: string
          created_at?: string | null
          id?: string
          reaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcement_reactions_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "team_announcements"
            referencedColumns: ["id"]
          },
        ]
      }
      announcement_views: {
        Row: {
          announcement_id: string
          id: string
          team_id: string
          user_id: string
          viewed_at: string
        }
        Insert: {
          announcement_id: string
          id?: string
          team_id: string
          user_id: string
          viewed_at?: string
        }
        Update: {
          announcement_id?: string
          id?: string
          team_id?: string
          user_id?: string
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcement_views_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "team_announcements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcement_views_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_events: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          end_time: string | null
          event_date: string
          event_type: string | null
          id: string
          location: string | null
          start_time: string | null
          team_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_time?: string | null
          event_date: string
          event_type?: string | null
          id?: string
          location?: string | null
          start_time?: string | null
          team_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_time?: string | null
          event_date?: string
          event_type?: string | null
          id?: string
          location?: string | null
          start_time?: string | null
          team_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      comment_reactions: {
        Row: {
          comment_id: string
          created_at: string | null
          id: string
          reaction_type: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string | null
          id?: string
          reaction_type: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string | null
          id?: string
          reaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_reactions_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "announcement_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment: {
        Row: {
          category: string
          condition: string | null
          created_at: string | null
          id: string
          last_checked: string | null
          name: string
          notes: string | null
          quantity: number | null
          team_id: string | null
          updated_at: string | null
        }
        Insert: {
          category: string
          condition?: string | null
          created_at?: string | null
          id?: string
          last_checked?: string | null
          name: string
          notes?: string | null
          quantity?: number | null
          team_id?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          condition?: string | null
          created_at?: string | null
          id?: string
          last_checked?: string | null
          name?: string
          notes?: string | null
          quantity?: number | null
          team_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      formation_sync_audit: {
        Row: {
          detected_at: string
          formation_text: string | null
          id: number
          notes: string | null
          personnel: string | null
          play_id: string
          playbook_id: string | null
          status: string
        }
        Insert: {
          detected_at?: string
          formation_text?: string | null
          id?: number
          notes?: string | null
          personnel?: string | null
          play_id: string
          playbook_id?: string | null
          status?: string
        }
        Update: {
          detected_at?: string
          formation_text?: string | null
          id?: number
          notes?: string | null
          personnel?: string | null
          play_id?: string
          playbook_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "formation_sync_audit_play_id_fkey"
            columns: ["play_id"]
            isOneToOne: true
            referencedRelation: "plays"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "formation_sync_audit_play_id_fkey"
            columns: ["play_id"]
            isOneToOne: true
            referencedRelation: "plays_missing_formation_link"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "formation_sync_audit_play_id_fkey"
            columns: ["play_id"]
            isOneToOne: true
            referencedRelation: "plays_missing_personnel_link"
            referencedColumns: ["id"]
          },
        ]
      }
      formations: {
        Row: {
          base_formation_id: string | null
          category: string | null
          created_at: string
          created_by: string | null
          creation_context: Json | null
          creation_source:
            | Database["public"]["Enums"]["formation_creation_source"]
            | null
          deleted_at: string | null
          description: string | null
          diagram_data: Json | null
          direction: string | null
          directionality_type: string | null
          formation_type: string | null
          id: string
          is_custom: boolean | null
          metadata_completeness: number | null
          metadata_quality: string | null
          name: string
          opposite_formation_id: string | null
          pass_strength: string | null
          personnel_id: string | null
          personnel_name: string | null
          personnel_packages: string[] | null
          playbook_id: string
          player_positions: Json
          positions: Json
          run_strength: string | null
          strength_player_label: string | null
          strength_player_position: string | null
          tags: string[] | null
          updated_at: string
          usage_count: number | null
          version: number | null
        }
        Insert: {
          base_formation_id?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          creation_context?: Json | null
          creation_source?:
            | Database["public"]["Enums"]["formation_creation_source"]
            | null
          deleted_at?: string | null
          description?: string | null
          diagram_data?: Json | null
          direction?: string | null
          directionality_type?: string | null
          formation_type?: string | null
          id?: string
          is_custom?: boolean | null
          metadata_completeness?: number | null
          metadata_quality?: string | null
          name: string
          opposite_formation_id?: string | null
          pass_strength?: string | null
          personnel_id?: string | null
          personnel_name?: string | null
          personnel_packages?: string[] | null
          playbook_id: string
          player_positions?: Json
          positions?: Json
          run_strength?: string | null
          strength_player_label?: string | null
          strength_player_position?: string | null
          tags?: string[] | null
          updated_at?: string
          usage_count?: number | null
          version?: number | null
        }
        Update: {
          base_formation_id?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          creation_context?: Json | null
          creation_source?:
            | Database["public"]["Enums"]["formation_creation_source"]
            | null
          deleted_at?: string | null
          description?: string | null
          diagram_data?: Json | null
          direction?: string | null
          directionality_type?: string | null
          formation_type?: string | null
          id?: string
          is_custom?: boolean | null
          metadata_completeness?: number | null
          metadata_quality?: string | null
          name?: string
          opposite_formation_id?: string | null
          pass_strength?: string | null
          personnel_id?: string | null
          personnel_name?: string | null
          personnel_packages?: string[] | null
          playbook_id?: string
          player_positions?: Json
          positions?: Json
          run_strength?: string | null
          strength_player_label?: string | null
          strength_player_position?: string | null
          tags?: string[] | null
          updated_at?: string
          usage_count?: number | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "formations_base_formation_id_fkey"
            columns: ["base_formation_id"]
            isOneToOne: false
            referencedRelation: "formations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "formations_base_formation_id_fkey"
            columns: ["base_formation_id"]
            isOneToOne: false
            referencedRelation: "formations_missing_personnel"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "formations_base_formation_id_fkey"
            columns: ["base_formation_id"]
            isOneToOne: false
            referencedRelation: "plays_missing_formation_link"
            referencedColumns: ["matching_formation_id"]
          },
          {
            foreignKeyName: "formations_opposite_formation_id_fkey"
            columns: ["opposite_formation_id"]
            isOneToOne: false
            referencedRelation: "formations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "formations_opposite_formation_id_fkey"
            columns: ["opposite_formation_id"]
            isOneToOne: false
            referencedRelation: "formations_missing_personnel"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "formations_opposite_formation_id_fkey"
            columns: ["opposite_formation_id"]
            isOneToOne: false
            referencedRelation: "plays_missing_formation_link"
            referencedColumns: ["matching_formation_id"]
          },
          {
            foreignKeyName: "formations_personnel_id_fkey"
            columns: ["personnel_id"]
            isOneToOne: false
            referencedRelation: "orphaned_personnel_configs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "formations_personnel_id_fkey"
            columns: ["personnel_id"]
            isOneToOne: false
            referencedRelation: "personnel_configurations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "formations_personnel_id_fkey"
            columns: ["personnel_id"]
            isOneToOne: false
            referencedRelation: "plays_missing_personnel_link"
            referencedColumns: ["matching_personnel_id"]
          },
          {
            foreignKeyName: "formations_playbook_id_fkey"
            columns: ["playbook_id"]
            isOneToOne: false
            referencedRelation: "playbooks"
            referencedColumns: ["id"]
          },
        ]
      }
      game_plan_plays: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          play_id: string | null
          priority: number | null
          situation_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          play_id?: string | null
          priority?: number | null
          situation_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          play_id?: string | null
          priority?: number | null
          situation_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_plan_plays_play_id_fkey"
            columns: ["play_id"]
            isOneToOne: false
            referencedRelation: "plays"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_plan_plays_play_id_fkey"
            columns: ["play_id"]
            isOneToOne: false
            referencedRelation: "plays_missing_formation_link"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_plan_plays_play_id_fkey"
            columns: ["play_id"]
            isOneToOne: false
            referencedRelation: "plays_missing_personnel_link"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_plan_plays_situation_id_fkey"
            columns: ["situation_id"]
            isOneToOne: false
            referencedRelation: "game_plan_situations"
            referencedColumns: ["id"]
          },
        ]
      }
      game_plan_situations: {
        Row: {
          created_at: string | null
          display_order: number
          distance: number | null
          down: number | null
          game_plan_id: string | null
          id: string
          notes: string | null
          situation_type: string
          yard_line: number | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number
          distance?: number | null
          down?: number | null
          game_plan_id?: string | null
          id?: string
          notes?: string | null
          situation_type: string
          yard_line?: number | null
        }
        Update: {
          created_at?: string | null
          display_order?: number
          distance?: number | null
          down?: number | null
          game_plan_id?: string | null
          id?: string
          notes?: string | null
          situation_type?: string
          yard_line?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "game_plan_situations_game_plan_id_fkey"
            columns: ["game_plan_id"]
            isOneToOne: false
            referencedRelation: "game_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      game_plans: {
        Row: {
          created_at: string | null
          created_by: string | null
          game_date: string
          game_location: string | null
          home_away: string | null
          id: string
          is_archived: boolean | null
          notes: string | null
          opponent: string
          team_id: string | null
          updated_at: string | null
          venue: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          game_date: string
          game_location?: string | null
          home_away?: string | null
          id?: string
          is_archived?: boolean | null
          notes?: string | null
          opponent: string
          team_id?: string | null
          updated_at?: string | null
          venue?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          game_date?: string
          game_location?: string | null
          home_away?: string | null
          id?: string
          is_archived?: boolean | null
          notes?: string | null
          opponent?: string
          team_id?: string | null
          updated_at?: string | null
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_plans_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      game_results: {
        Row: {
          created_at: string | null
          game_date: string
          home_away: string | null
          id: string
          notes: string | null
          opponent: string
          opponent_score: number | null
          our_score: number | null
          result: string | null
          team_id: string | null
          updated_at: string | null
          venue: string | null
        }
        Insert: {
          created_at?: string | null
          game_date: string
          home_away?: string | null
          id?: string
          notes?: string | null
          opponent: string
          opponent_score?: number | null
          our_score?: number | null
          result?: string | null
          team_id?: string | null
          updated_at?: string | null
          venue?: string | null
        }
        Update: {
          created_at?: string | null
          game_date?: string
          home_away?: string | null
          id?: string
          notes?: string | null
          opponent?: string
          opponent_score?: number | null
          our_score?: number | null
          result?: string | null
          team_id?: string | null
          updated_at?: string | null
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_results_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      game_sessions: {
        Row: {
          created_at: string
          ended_at: string | null
          failed_plays: number
          field_conditions: string | null
          game_date: string
          game_plan_id: string | null
          id: string
          is_archived: boolean
          is_home_game: boolean
          neutral_plays: number
          notes: string | null
          opponent: string
          opponent_score: number | null
          recorded_by: string | null
          session_mode: string
          started_at: string
          success_rate: number | null
          successful_plays: number
          team_id: string
          team_score: number | null
          total_plays: number
          total_touchdowns: number
          total_turnovers: number
          total_yards: number
          updated_at: string
          weather: string | null
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          failed_plays?: number
          field_conditions?: string | null
          game_date: string
          game_plan_id?: string | null
          id?: string
          is_archived?: boolean
          is_home_game?: boolean
          neutral_plays?: number
          notes?: string | null
          opponent: string
          opponent_score?: number | null
          recorded_by?: string | null
          session_mode: string
          started_at?: string
          success_rate?: number | null
          successful_plays?: number
          team_id: string
          team_score?: number | null
          total_plays?: number
          total_touchdowns?: number
          total_turnovers?: number
          total_yards?: number
          updated_at?: string
          weather?: string | null
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          failed_plays?: number
          field_conditions?: string | null
          game_date?: string
          game_plan_id?: string | null
          id?: string
          is_archived?: boolean
          is_home_game?: boolean
          neutral_plays?: number
          notes?: string | null
          opponent?: string
          opponent_score?: number | null
          recorded_by?: string | null
          session_mode?: string
          started_at?: string
          success_rate?: number | null
          successful_plays?: number
          team_id?: string
          team_score?: number | null
          total_plays?: number
          total_touchdowns?: number
          total_turnovers?: number
          total_yards?: number
          updated_at?: string
          weather?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_sessions_game_plan_id_fkey"
            columns: ["game_plan_id"]
            isOneToOne: false
            referencedRelation: "game_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_sessions_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      helmet_stickers: {
        Row: {
          created_at: string | null
          earned_date: string
          id: string
          player_id: string | null
          sticker_type: string
        }
        Insert: {
          created_at?: string | null
          earned_date: string
          id?: string
          player_id?: string | null
          sticker_type: string
        }
        Update: {
          created_at?: string | null
          earned_date?: string
          id?: string
          player_id?: string | null
          sticker_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "helmet_stickers_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "season_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "helmet_stickers_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "team_players"
            referencedColumns: ["id"]
          },
        ]
      }
      invitation_attempts: {
        Row: {
          attempted_at: string | null
          attempted_by: string | null
          email: string
          id: string
          player_id: string | null
          success: boolean | null
          team_id: string
        }
        Insert: {
          attempted_at?: string | null
          attempted_by?: string | null
          email: string
          id?: string
          player_id?: string | null
          success?: boolean | null
          team_id: string
        }
        Update: {
          attempted_at?: string | null
          attempted_by?: string | null
          email?: string
          id?: string
          player_id?: string | null
          success?: boolean | null
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitation_attempts_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "season_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "invitation_attempts_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "team_players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitation_attempts_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          announcement_id: string | null
          comment_id: string | null
          created_at: string | null
          data: Json | null
          id: string
          message: string
          read: boolean | null
          title: string
          triggered_by_user_id: string | null
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          announcement_id?: string | null
          comment_id?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          triggered_by_user_id?: string | null
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          announcement_id?: string | null
          comment_id?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          triggered_by_user_id?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "team_announcements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "announcement_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      personnel_configurations: {
        Row: {
          badge_customization: Json | null
          created_at: string | null
          deleted_at: string | null
          description: string | null
          id: string
          name: string
          playbook_id: string
          updated_at: string | null
        }
        Insert: {
          badge_customization?: Json | null
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          name: string
          playbook_id: string
          updated_at?: string | null
        }
        Update: {
          badge_customization?: Json | null
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          name?: string
          playbook_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "personnel_configurations_playbook_id_fkey"
            columns: ["playbook_id"]
            isOneToOne: false
            referencedRelation: "playbooks"
            referencedColumns: ["id"]
          },
        ]
      }
      personnel_players: {
        Row: {
          config_id: string
          created_at: string | null
          id: string
          is_wildcat_qb: boolean | null
          label: string
          player_position: string
          sort_order: number
        }
        Insert: {
          config_id: string
          created_at?: string | null
          id?: string
          is_wildcat_qb?: boolean | null
          label: string
          player_position: string
          sort_order: number
        }
        Update: {
          config_id?: string
          created_at?: string | null
          id?: string
          is_wildcat_qb?: boolean | null
          label?: string
          player_position?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "personnel_players_config_id_fkey"
            columns: ["config_id"]
            isOneToOne: false
            referencedRelation: "orphaned_personnel_configs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personnel_players_config_id_fkey"
            columns: ["config_id"]
            isOneToOne: false
            referencedRelation: "personnel_configurations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personnel_players_config_id_fkey"
            columns: ["config_id"]
            isOneToOne: false
            referencedRelation: "plays_missing_personnel_link"
            referencedColumns: ["matching_personnel_id"]
          },
        ]
      }
      play_assignments: {
        Row: {
          assignment_text: string | null
          created_at: string | null
          created_by: string | null
          hashtags: Json | null
          id: string
          play_id: string
          play_notes: string | null
          playbook_id: string
          player_tags: Json | null
          position: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          assignment_text?: string | null
          created_at?: string | null
          created_by?: string | null
          hashtags?: Json | null
          id?: string
          play_id: string
          play_notes?: string | null
          playbook_id: string
          player_tags?: Json | null
          position: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          assignment_text?: string | null
          created_at?: string | null
          created_by?: string | null
          hashtags?: Json | null
          id?: string
          play_id?: string
          play_notes?: string | null
          playbook_id?: string
          player_tags?: Json | null
          position?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "play_assignments_play_id_fkey"
            columns: ["play_id"]
            isOneToOne: false
            referencedRelation: "plays"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "play_assignments_play_id_fkey"
            columns: ["play_id"]
            isOneToOne: false
            referencedRelation: "plays_missing_formation_link"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "play_assignments_play_id_fkey"
            columns: ["play_id"]
            isOneToOne: false
            referencedRelation: "plays_missing_personnel_link"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "play_assignments_playbook_id_fkey"
            columns: ["playbook_id"]
            isOneToOne: false
            referencedRelation: "playbooks"
            referencedColumns: ["id"]
          },
        ]
      }
      play_calls: {
        Row: {
          created_at: string | null
          distance: number | null
          down: number | null
          game_id: string | null
          id: string
          play_id: string | null
          quarter: number | null
          result: string | null
          time_remaining: string | null
          yard_line: number | null
        }
        Insert: {
          created_at?: string | null
          distance?: number | null
          down?: number | null
          game_id?: string | null
          id?: string
          play_id?: string | null
          quarter?: number | null
          result?: string | null
          time_remaining?: string | null
          yard_line?: number | null
        }
        Update: {
          created_at?: string | null
          distance?: number | null
          down?: number | null
          game_id?: string | null
          id?: string
          play_id?: string | null
          quarter?: number | null
          result?: string | null
          time_remaining?: string | null
          yard_line?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "play_calls_play_id_fkey"
            columns: ["play_id"]
            isOneToOne: false
            referencedRelation: "plays"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "play_calls_play_id_fkey"
            columns: ["play_id"]
            isOneToOne: false
            referencedRelation: "plays_missing_formation_link"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "play_calls_play_id_fkey"
            columns: ["play_id"]
            isOneToOne: false
            referencedRelation: "plays_missing_personnel_link"
            referencedColumns: ["id"]
          },
        ]
      }
      play_executions: {
        Row: {
          confidence_after: number | null
          confidence_before: number | null
          created_at: string
          distance: number | null
          down: number | null
          executed_at: string
          formation_id: string | null
          game_session_id: string | null
          hash_mark: string | null
          id: string
          notes: string | null
          opponent_coverage: string | null
          penalty_yards: number | null
          play_id: string
          practice_session_id: string | null
          quarter: number | null
          quick_tags: string[] | null
          recorded_by: string | null
          recorded_mode: string
          rep_number: number | null
          result: string
          tags: string[] | null
          team_id: string
          time_remaining: string | null
          was_penalty: boolean
          was_touchdown: boolean
          was_turnover: boolean
          yard_line: number | null
          yards_gained: number | null
        }
        Insert: {
          confidence_after?: number | null
          confidence_before?: number | null
          created_at?: string
          distance?: number | null
          down?: number | null
          executed_at?: string
          formation_id?: string | null
          game_session_id?: string | null
          hash_mark?: string | null
          id?: string
          notes?: string | null
          opponent_coverage?: string | null
          penalty_yards?: number | null
          play_id: string
          practice_session_id?: string | null
          quarter?: number | null
          quick_tags?: string[] | null
          recorded_by?: string | null
          recorded_mode: string
          rep_number?: number | null
          result: string
          tags?: string[] | null
          team_id: string
          time_remaining?: string | null
          was_penalty?: boolean
          was_touchdown?: boolean
          was_turnover?: boolean
          yard_line?: number | null
          yards_gained?: number | null
        }
        Update: {
          confidence_after?: number | null
          confidence_before?: number | null
          created_at?: string
          distance?: number | null
          down?: number | null
          executed_at?: string
          formation_id?: string | null
          game_session_id?: string | null
          hash_mark?: string | null
          id?: string
          notes?: string | null
          opponent_coverage?: string | null
          penalty_yards?: number | null
          play_id?: string
          practice_session_id?: string | null
          quarter?: number | null
          quick_tags?: string[] | null
          recorded_by?: string | null
          recorded_mode?: string
          rep_number?: number | null
          result?: string
          tags?: string[] | null
          team_id?: string
          time_remaining?: string | null
          was_penalty?: boolean
          was_touchdown?: boolean
          was_turnover?: boolean
          yard_line?: number | null
          yards_gained?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "play_executions_formation_id_fkey"
            columns: ["formation_id"]
            isOneToOne: false
            referencedRelation: "formations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "play_executions_formation_id_fkey"
            columns: ["formation_id"]
            isOneToOne: false
            referencedRelation: "formations_missing_personnel"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "play_executions_formation_id_fkey"
            columns: ["formation_id"]
            isOneToOne: false
            referencedRelation: "plays_missing_formation_link"
            referencedColumns: ["matching_formation_id"]
          },
          {
            foreignKeyName: "play_executions_game_session_id_fkey"
            columns: ["game_session_id"]
            isOneToOne: false
            referencedRelation: "game_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "play_executions_play_id_fkey"
            columns: ["play_id"]
            isOneToOne: false
            referencedRelation: "plays"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "play_executions_play_id_fkey"
            columns: ["play_id"]
            isOneToOne: false
            referencedRelation: "plays_missing_formation_link"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "play_executions_play_id_fkey"
            columns: ["play_id"]
            isOneToOne: false
            referencedRelation: "plays_missing_personnel_link"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "play_executions_practice_session_id_fkey"
            columns: ["practice_session_id"]
            isOneToOne: false
            referencedRelation: "practice_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "play_executions_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      playbooks: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          is_active: boolean | null
          last_modified_at: string | null
          name: string
          play_count: number | null
          team_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          last_modified_at?: string | null
          name?: string
          play_count?: number | null
          team_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          last_modified_at?: string | null
          name?: string
          play_count?: number | null
          team_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "playbooks_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      plays: {
        Row: {
          back_align: string | null
          back_left_of_qb: boolean | null
          back_right_of_qb: boolean | null
          check_into: string | null
          complexity_score: number | null
          confidence_base: number | null
          created_at: string | null
          created_by: string | null
          creation_context: Json | null
          creation_source:
            | Database["public"]["Enums"]["play_creation_source"]
            | null
          diagram_data: Json | null
          diagram_url: string | null
          diagram_version: number | null
          duplicate_key: string | null
          f_dir: string | null
          f_type: string | null
          flags: string[] | null
          formation: string
          formation_direction: string | null
          formation_id: string | null
          formation_status: string
          ftag1: string | null
          ftag2: string | null
          id: string
          is_archived: boolean | null
          key_player1: string | null
          key_player2: string | null
          key_players: string[] | null
          key_positions: string[] | null
          metadata_migrated_at: string | null
          motion: string | null
          notes: string | null
          one_word_play: string | null
          p_dir: string | null
          p_str: string | null
          p_tag1: string | null
          p_tag2: string | null
          p_type: string
          personnel: string | null
          personnel_id: string | null
          play_name: string
          playbook_id: string | null
          pref_cov: string | null
          pref_dis: string | null
          pref_down: string | null
          pref_front: string | null
          pref_hash: string | null
          protection: string | null
          r_str: string | null
          sanitized_at: string | null
          shift: string | null
          tags: string[] | null
          times_called: number | null
          times_successful: number | null
          updated_at: string | null
          wristband_number: string | null
        }
        Insert: {
          back_align?: string | null
          back_left_of_qb?: boolean | null
          back_right_of_qb?: boolean | null
          check_into?: string | null
          complexity_score?: number | null
          confidence_base?: number | null
          created_at?: string | null
          created_by?: string | null
          creation_context?: Json | null
          creation_source?:
            | Database["public"]["Enums"]["play_creation_source"]
            | null
          diagram_data?: Json | null
          diagram_url?: string | null
          diagram_version?: number | null
          duplicate_key?: string | null
          f_dir?: string | null
          f_type?: string | null
          flags?: string[] | null
          formation: string
          formation_direction?: string | null
          formation_id?: string | null
          formation_status?: string
          ftag1?: string | null
          ftag2?: string | null
          id?: string
          is_archived?: boolean | null
          key_player1?: string | null
          key_player2?: string | null
          key_players?: string[] | null
          key_positions?: string[] | null
          metadata_migrated_at?: string | null
          motion?: string | null
          notes?: string | null
          one_word_play?: string | null
          p_dir?: string | null
          p_str?: string | null
          p_tag1?: string | null
          p_tag2?: string | null
          p_type: string
          personnel?: string | null
          personnel_id?: string | null
          play_name: string
          playbook_id?: string | null
          pref_cov?: string | null
          pref_dis?: string | null
          pref_down?: string | null
          pref_front?: string | null
          pref_hash?: string | null
          protection?: string | null
          r_str?: string | null
          sanitized_at?: string | null
          shift?: string | null
          tags?: string[] | null
          times_called?: number | null
          times_successful?: number | null
          updated_at?: string | null
          wristband_number?: string | null
        }
        Update: {
          back_align?: string | null
          back_left_of_qb?: boolean | null
          back_right_of_qb?: boolean | null
          check_into?: string | null
          complexity_score?: number | null
          confidence_base?: number | null
          created_at?: string | null
          created_by?: string | null
          creation_context?: Json | null
          creation_source?:
            | Database["public"]["Enums"]["play_creation_source"]
            | null
          diagram_data?: Json | null
          diagram_url?: string | null
          diagram_version?: number | null
          duplicate_key?: string | null
          f_dir?: string | null
          f_type?: string | null
          flags?: string[] | null
          formation?: string
          formation_direction?: string | null
          formation_id?: string | null
          formation_status?: string
          ftag1?: string | null
          ftag2?: string | null
          id?: string
          is_archived?: boolean | null
          key_player1?: string | null
          key_player2?: string | null
          key_players?: string[] | null
          key_positions?: string[] | null
          metadata_migrated_at?: string | null
          motion?: string | null
          notes?: string | null
          one_word_play?: string | null
          p_dir?: string | null
          p_str?: string | null
          p_tag1?: string | null
          p_tag2?: string | null
          p_type?: string
          personnel?: string | null
          personnel_id?: string | null
          play_name?: string
          playbook_id?: string | null
          pref_cov?: string | null
          pref_dis?: string | null
          pref_down?: string | null
          pref_front?: string | null
          pref_hash?: string | null
          protection?: string | null
          r_str?: string | null
          sanitized_at?: string | null
          shift?: string | null
          tags?: string[] | null
          times_called?: number | null
          times_successful?: number | null
          updated_at?: string | null
          wristband_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plays_formation_id_fkey"
            columns: ["formation_id"]
            isOneToOne: false
            referencedRelation: "formations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plays_formation_id_fkey"
            columns: ["formation_id"]
            isOneToOne: false
            referencedRelation: "formations_missing_personnel"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plays_formation_id_fkey"
            columns: ["formation_id"]
            isOneToOne: false
            referencedRelation: "plays_missing_formation_link"
            referencedColumns: ["matching_formation_id"]
          },
          {
            foreignKeyName: "plays_personnel_id_fkey"
            columns: ["personnel_id"]
            isOneToOne: false
            referencedRelation: "orphaned_personnel_configs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plays_personnel_id_fkey"
            columns: ["personnel_id"]
            isOneToOne: false
            referencedRelation: "personnel_configurations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plays_personnel_id_fkey"
            columns: ["personnel_id"]
            isOneToOne: false
            referencedRelation: "plays_missing_personnel_link"
            referencedColumns: ["matching_personnel_id"]
          },
          {
            foreignKeyName: "plays_playbook_id_fkey"
            columns: ["playbook_id"]
            isOneToOne: false
            referencedRelation: "playbooks"
            referencedColumns: ["id"]
          },
        ]
      }
      post_comments: {
        Row: {
          author_id: string
          content: string
          created_at: string | null
          id: string
          parent_comment_id: string | null
          post_id: string
          updated_at: string | null
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string | null
          id?: string
          parent_comment_id?: string | null
          post_id: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string | null
          id?: string
          parent_comment_id?: string | null
          post_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "post_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "team_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "team_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_shares: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_shares_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "team_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      practice_attendance: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          player_id: string | null
          practice_id: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          player_id?: string | null
          practice_id?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          player_id?: string | null
          practice_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "practice_attendance_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "season_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "practice_attendance_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "team_players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "practice_attendance_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "practice_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      practice_schedules: {
        Row: {
          created_at: string | null
          end_time: string
          id: string
          location: string | null
          notes: string | null
          practice_date: string
          start_time: string
          team_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          end_time: string
          id?: string
          location?: string | null
          notes?: string | null
          practice_date: string
          start_time: string
          team_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          end_time?: string
          id?: string
          location?: string | null
          notes?: string | null
          practice_date?: string
          start_time?: string
          team_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "practice_schedules_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      practice_script_plays: {
        Row: {
          blitz: string | null
          coaching_points: string[] | null
          coverage: string | null
          created_at: string | null
          defensive_front: string | null
          down_distance: string | null
          field_position: string | null
          hash: string | null
          id: string
          play_id: string
          practice_script_id: string
          repetitions: number
          scenario_notes: string | null
          segment_name: string | null
          segment_type: string | null
          sequence_order: number
          updated_at: string | null
        }
        Insert: {
          blitz?: string | null
          coaching_points?: string[] | null
          coverage?: string | null
          created_at?: string | null
          defensive_front?: string | null
          down_distance?: string | null
          field_position?: string | null
          hash?: string | null
          id?: string
          play_id: string
          practice_script_id: string
          repetitions?: number
          scenario_notes?: string | null
          segment_name?: string | null
          segment_type?: string | null
          sequence_order?: number
          updated_at?: string | null
        }
        Update: {
          blitz?: string | null
          coaching_points?: string[] | null
          coverage?: string | null
          created_at?: string | null
          defensive_front?: string | null
          down_distance?: string | null
          field_position?: string | null
          hash?: string | null
          id?: string
          play_id?: string
          practice_script_id?: string
          repetitions?: number
          scenario_notes?: string | null
          segment_name?: string | null
          segment_type?: string | null
          sequence_order?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "practice_script_plays_play_id_fkey"
            columns: ["play_id"]
            isOneToOne: false
            referencedRelation: "plays"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "practice_script_plays_play_id_fkey"
            columns: ["play_id"]
            isOneToOne: false
            referencedRelation: "plays_missing_formation_link"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "practice_script_plays_play_id_fkey"
            columns: ["play_id"]
            isOneToOne: false
            referencedRelation: "plays_missing_personnel_link"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "practice_script_plays_practice_script_id_fkey"
            columns: ["practice_script_id"]
            isOneToOne: false
            referencedRelation: "practice_scripts"
            referencedColumns: ["id"]
          },
        ]
      }
      practice_scripts: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          duration: number | null
          focus_areas: string[] | null
          id: string
          team_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration?: number | null
          focus_areas?: string[] | null
          id?: string
          team_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration?: number | null
          focus_areas?: string[] | null
          id?: string
          team_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "practice_scripts_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      practice_sessions: {
        Row: {
          completed_reps: number
          created_at: string
          duration_minutes: number | null
          ended_at: string | null
          failed_reps: number
          field_conditions: string | null
          id: string
          is_archived: boolean
          neutral_reps: number
          notes: string | null
          practice_script_id: string | null
          recorded_by: string | null
          session_date: string
          session_mode: string
          started_at: string
          success_rate: number | null
          successful_reps: number
          team_id: string
          total_plays: number
          total_reps: number
          updated_at: string
          weather: string | null
        }
        Insert: {
          completed_reps?: number
          created_at?: string
          duration_minutes?: number | null
          ended_at?: string | null
          failed_reps?: number
          field_conditions?: string | null
          id?: string
          is_archived?: boolean
          neutral_reps?: number
          notes?: string | null
          practice_script_id?: string | null
          recorded_by?: string | null
          session_date: string
          session_mode: string
          started_at?: string
          success_rate?: number | null
          successful_reps?: number
          team_id: string
          total_plays?: number
          total_reps?: number
          updated_at?: string
          weather?: string | null
        }
        Update: {
          completed_reps?: number
          created_at?: string
          duration_minutes?: number | null
          ended_at?: string | null
          failed_reps?: number
          field_conditions?: string | null
          id?: string
          is_archived?: boolean
          neutral_reps?: number
          notes?: string | null
          practice_script_id?: string | null
          recorded_by?: string | null
          session_date?: string
          session_mode?: string
          started_at?: string
          success_rate?: number | null
          successful_reps?: number
          team_id?: string
          total_plays?: number
          total_reps?: number
          updated_at?: string
          weather?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "practice_sessions_practice_script_id_fkey"
            columns: ["practice_script_id"]
            isOneToOne: false
            referencedRelation: "practice_scripts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "practice_sessions_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      practice_templates: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          duration: number | null
          id: string
          is_public: boolean | null
          name: string
          team_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration?: number | null
          id?: string
          is_public?: boolean | null
          name: string
          team_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration?: number | null
          id?: string
          is_public?: boolean | null
          name?: string
          team_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "practice_templates_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          app_role: string | null
          avatar_url: string | null
          bio: string | null
          certifications: string | null
          coaching_experience: string | null
          coaching_philosophy: string | null
          coaching_system: string | null
          created_at: string | null
          current_school: string | null
          display_name: string | null
          education: string | null
          email: string | null
          emergency_contact: string | null
          emergency_phone: string | null
          full_name: string | null
          grade_level: string | null
          height_inches: number | null
          id: string
          is_active: boolean | null
          is_admin: boolean | null
          jersey_number: number | null
          last_login: string | null
          mentors: string | null
          notification_preferences: Json | null
          personal_website: string | null
          phone: string | null
          position: string | null
          previous_schools: string | null
          role: string | null
          settings: Json | null
          social_instagram: string | null
          social_linkedin: string | null
          social_tiktok: string | null
          social_twitter: string | null
          social_youtube: string | null
          specializations: string | null
          subscription_expires_at: string | null
          subscription_tier: string | null
          updated_at: string | null
          weight_lbs: number | null
          years_coaching: number | null
        }
        Insert: {
          address?: string | null
          app_role?: string | null
          avatar_url?: string | null
          bio?: string | null
          certifications?: string | null
          coaching_experience?: string | null
          coaching_philosophy?: string | null
          coaching_system?: string | null
          created_at?: string | null
          current_school?: string | null
          display_name?: string | null
          education?: string | null
          email?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          full_name?: string | null
          grade_level?: string | null
          height_inches?: number | null
          id: string
          is_active?: boolean | null
          is_admin?: boolean | null
          jersey_number?: number | null
          last_login?: string | null
          mentors?: string | null
          notification_preferences?: Json | null
          personal_website?: string | null
          phone?: string | null
          position?: string | null
          previous_schools?: string | null
          role?: string | null
          settings?: Json | null
          social_instagram?: string | null
          social_linkedin?: string | null
          social_tiktok?: string | null
          social_twitter?: string | null
          social_youtube?: string | null
          specializations?: string | null
          subscription_expires_at?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
          weight_lbs?: number | null
          years_coaching?: number | null
        }
        Update: {
          address?: string | null
          app_role?: string | null
          avatar_url?: string | null
          bio?: string | null
          certifications?: string | null
          coaching_experience?: string | null
          coaching_philosophy?: string | null
          coaching_system?: string | null
          created_at?: string | null
          current_school?: string | null
          display_name?: string | null
          education?: string | null
          email?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          full_name?: string | null
          grade_level?: string | null
          height_inches?: number | null
          id?: string
          is_active?: boolean | null
          is_admin?: boolean | null
          jersey_number?: number | null
          last_login?: string | null
          mentors?: string | null
          notification_preferences?: Json | null
          personal_website?: string | null
          phone?: string | null
          position?: string | null
          previous_schools?: string | null
          role?: string | null
          settings?: Json | null
          social_instagram?: string | null
          social_linkedin?: string | null
          social_tiktok?: string | null
          social_twitter?: string | null
          social_youtube?: string | null
          specializations?: string | null
          subscription_expires_at?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
          weight_lbs?: number | null
          years_coaching?: number | null
        }
        Relationships: []
      }
      team_announcements: {
        Row: {
          attachments: Json | null
          content: string
          content_json: Json | null
          created_at: string | null
          created_by: string
          deleted_at: string | null
          id: string
          is_pinned: boolean | null
          scheduled_for: string | null
          status: string
          team_id: string
          title: string
          updated_at: string | null
          view_count: number | null
          visibility: string | null
        }
        Insert: {
          attachments?: Json | null
          content: string
          content_json?: Json | null
          created_at?: string | null
          created_by: string
          deleted_at?: string | null
          id?: string
          is_pinned?: boolean | null
          scheduled_for?: string | null
          status?: string
          team_id: string
          title: string
          updated_at?: string | null
          view_count?: number | null
          visibility?: string | null
        }
        Update: {
          attachments?: Json | null
          content?: string
          content_json?: Json | null
          created_at?: string | null
          created_by?: string
          deleted_at?: string | null
          id?: string
          is_pinned?: boolean | null
          scheduled_for?: string | null
          status?: string
          team_id?: string
          title?: string
          updated_at?: string | null
          view_count?: number | null
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_announcements_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_events: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          ends_at: string | null
          event_date: string
          event_type: string | null
          id: string
          location: string | null
          starts_at: string | null
          team_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          ends_at?: string | null
          event_date: string
          event_type?: string | null
          id?: string
          location?: string | null
          starts_at?: string | null
          team_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          ends_at?: string | null
          event_date?: string
          event_type?: string | null
          id?: string
          location?: string | null
          starts_at?: string | null
          team_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_events_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          assigned_at: string | null
          capabilities: Json | null
          id: string
          invited_by: string | null
          role_notes: string | null
          status: string | null
          team_id: string | null
          team_role: string
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          capabilities?: Json | null
          id?: string
          invited_by?: string | null
          role_notes?: string | null
          status?: string | null
          team_id?: string | null
          team_role: string
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          capabilities?: Json | null
          id?: string
          invited_by?: string | null
          role_notes?: string | null
          status?: string | null
          team_id?: string | null
          team_role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_players: {
        Row: {
          created_at: string | null
          first_name: string
          grade_level: string | null
          height_inches: number | null
          id: string
          invitation_accepted_at: string | null
          invitation_expires_at: string | null
          invitation_sent_at: string | null
          invitation_status: string | null
          invitation_token: string | null
          invited_by: string | null
          is_active: boolean | null
          jersey_number: number | null
          last_name: string
          nickname: string | null
          position: string | null
          team_id: string | null
          updated_at: string | null
          user_id: string | null
          weight_lbs: number | null
        }
        Insert: {
          created_at?: string | null
          first_name: string
          grade_level?: string | null
          height_inches?: number | null
          id?: string
          invitation_accepted_at?: string | null
          invitation_expires_at?: string | null
          invitation_sent_at?: string | null
          invitation_status?: string | null
          invitation_token?: string | null
          invited_by?: string | null
          is_active?: boolean | null
          jersey_number?: number | null
          last_name: string
          nickname?: string | null
          position?: string | null
          team_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          weight_lbs?: number | null
        }
        Update: {
          created_at?: string | null
          first_name?: string
          grade_level?: string | null
          height_inches?: number | null
          id?: string
          invitation_accepted_at?: string | null
          invitation_expires_at?: string | null
          invitation_sent_at?: string | null
          invitation_status?: string | null
          invitation_token?: string | null
          invited_by?: string | null
          is_active?: boolean | null
          jersey_number?: number | null
          last_name?: string
          nickname?: string | null
          position?: string | null
          team_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          weight_lbs?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "team_players_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_players_view: {
        Row: {
          created_at: string | null
          first_name: string | null
          full_name: string | null
          grade_level: string | null
          height_inches: number | null
          id: string | null
          is_active: boolean | null
          jersey_number: number | null
          last_name: string | null
          position: string | null
          team_id: string | null
          updated_at: string | null
          weight_lbs: number | null
        }
        Insert: {
          created_at?: string | null
          first_name?: string | null
          full_name?: string | null
          grade_level?: string | null
          height_inches?: number | null
          id?: string | null
          is_active?: boolean | null
          jersey_number?: number | null
          last_name?: string | null
          position?: string | null
          team_id?: string | null
          updated_at?: string | null
          weight_lbs?: number | null
        }
        Update: {
          created_at?: string | null
          first_name?: string | null
          full_name?: string | null
          grade_level?: string | null
          height_inches?: number | null
          id?: string | null
          is_active?: boolean | null
          jersey_number?: number | null
          last_name?: string | null
          position?: string | null
          team_id?: string | null
          updated_at?: string | null
          weight_lbs?: number | null
        }
        Relationships: []
      }
      team_posts: {
        Row: {
          author_id: string
          comments_count: number | null
          content: string
          created_at: string | null
          id: string
          is_pinned: boolean | null
          likes_count: number | null
          shares_count: number | null
          team_id: string
          updated_at: string | null
        }
        Insert: {
          author_id: string
          comments_count?: number | null
          content: string
          created_at?: string | null
          id?: string
          is_pinned?: boolean | null
          likes_count?: number | null
          shares_count?: number | null
          team_id: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          comments_count?: number | null
          content?: string
          created_at?: string | null
          id?: string
          is_pinned?: boolean | null
          likes_count?: number | null
          shares_count?: number | null
          team_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_posts_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          backup_version: number | null
          created_at: string | null
          created_by: string | null
          id: string
          last_backup_at: string | null
          mascot: string | null
          name: string
          play_count: number | null
          school_name: string | null
          season_year: number | null
          updated_at: string | null
        }
        Insert: {
          backup_version?: number | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          last_backup_at?: string | null
          mascot?: string | null
          name: string
          play_count?: number | null
          school_name?: string | null
          season_year?: number | null
          updated_at?: string | null
        }
        Update: {
          backup_version?: number | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          last_backup_at?: string | null
          mascot?: string | null
          name?: string
          play_count?: number | null
          school_name?: string | null
          season_year?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      formation_quality_analytics: {
        Row: {
          avg_completeness: number | null
          creation_source:
            | Database["public"]["Enums"]["formation_creation_source"]
            | null
          formation_count: number | null
          max_completeness: number | null
          metadata_quality: string | null
          min_completeness: number | null
          missing_diagrams_count: number | null
        }
        Relationships: []
      }
      formations_missing_personnel: {
        Row: {
          category: string | null
          direction: string | null
          id: string | null
          name: string | null
          playbook_id: string | null
          usage_count: number | null
        }
        Insert: {
          category?: string | null
          direction?: string | null
          id?: string | null
          name?: string | null
          playbook_id?: string | null
          usage_count?: number | null
        }
        Update: {
          category?: string | null
          direction?: string | null
          id?: string | null
          name?: string | null
          playbook_id?: string | null
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "formations_playbook_id_fkey"
            columns: ["playbook_id"]
            isOneToOne: false
            referencedRelation: "playbooks"
            referencedColumns: ["id"]
          },
        ]
      }
      orphaned_personnel_configs: {
        Row: {
          formation_count: number | null
          id: string | null
          name: string | null
          play_count: number | null
          playbook_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "personnel_configurations_playbook_id_fkey"
            columns: ["playbook_id"]
            isOneToOne: false
            referencedRelation: "playbooks"
            referencedColumns: ["id"]
          },
        ]
      }
      play_creation_analytics: {
        Row: {
          avg_confidence: number | null
          avg_times_called: number | null
          creation_source:
            | Database["public"]["Enums"]["play_creation_source"]
            | null
          play_count: number | null
          playbook_count: number | null
          with_diagram_count: number | null
          without_diagram_count: number | null
        }
        Relationships: []
      }
      play_tab_usage_analytics: {
        Row: {
          active_tab: string | null
          avg_confidence: number | null
          creation_source:
            | Database["public"]["Enums"]["play_creation_source"]
            | null
          usage_count: number | null
          with_diagram_count: number | null
        }
        Relationships: []
      }
      plays_missing_formation_link: {
        Row: {
          formation_text: string | null
          id: string | null
          matching_formation_id: string | null
          matching_formation_name: string | null
          play_name: string | null
          playbook_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plays_playbook_id_fkey"
            columns: ["playbook_id"]
            isOneToOne: false
            referencedRelation: "playbooks"
            referencedColumns: ["id"]
          },
        ]
      }
      plays_missing_personnel_link: {
        Row: {
          id: string | null
          matching_personnel_id: string | null
          matching_personnel_name: string | null
          personnel_text: string | null
          play_name: string | null
          playbook_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plays_playbook_id_fkey"
            columns: ["playbook_id"]
            isOneToOne: false
            referencedRelation: "playbooks"
            referencedColumns: ["id"]
          },
        ]
      }
      season_stats: {
        Row: {
          achievements_count: number | null
          first_name: string | null
          interceptions: number | null
          jersey_number: number | null
          last_name: string | null
          pass_attempts: number | null
          pass_completions: number | null
          passing_touchdowns: number | null
          player_id: string | null
          position: string | null
          receiving_touchdowns: number | null
          receptions: number | null
          rush_attempts: number | null
          rushing_touchdowns: number | null
          season_year: number | null
          stickers_count: number | null
          team_name: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      accept_player_invitation: {
        Args: { p_token: string; p_user_id: string }
        Returns: Json
      }
      add_play_tag: {
        Args: { play_id: string; tag: string }
        Returns: undefined
      }
      batch_link_plays_to_formations: {
        Args: { dry_run?: boolean; p_playbook_id?: string }
        Returns: {
          action: string
          formation_text: string
          matched_formation_id: string
          matched_formation_name: string
          play_id: string
          play_name: string
        }[]
      }
      batch_link_plays_to_personnel: {
        Args: { dry_run?: boolean; p_playbook_id?: string }
        Returns: {
          action: string
          matched_personnel_id: string
          matched_personnel_name: string
          personnel_text: string
          play_id: string
          play_name: string
        }[]
      }
      calculate_formation_metadata_completeness: {
        Args: {
          formation_row: Database["public"]["Tables"]["formations"]["Row"]
        }
        Returns: number
      }
      check_formation_variant_consistency: {
        Args: never
        Returns: {
          formation_id: string
          formation_name: string
          issue_description: string
          issue_type: string
        }[]
      }
      cleanup_expired_invitations: { Args: never; Returns: number }
      count_diagram_players: { Args: { p_diagram_data: Json }; Returns: number }
      dearmor: { Args: { "": string }; Returns: string }
      extract_base_formation_name: {
        Args: { formation_text: string }
        Returns: string
      }
      fix_formation_variant_links: {
        Args: never
        Returns: {
          fix_description: string
          fixed_formation_id: string
          fixed_formation_name: string
        }[]
      }
      flip_formation_positions: {
        Args: { field_width?: number; positions: Json }
        Returns: Json
      }
      formation_has_variants: {
        Args: { formation_id: string }
        Returns: boolean
      }
      gen_random_uuid: { Args: never; Returns: string }
      gen_salt: { Args: { "": string }; Returns: string }
      get_all_play_tags: {
        Args: { team_id_param?: string }
        Returns: {
          play_count: number
          tag: string
        }[]
      }
      get_diagram_player_count: {
        Args: { diagram_data: Json }
        Returns: number
      }
      get_diagram_players_by_team: {
        Args: { diagram_data: Json; team_name: string }
        Returns: Json
      }
      get_formation_metadata_quality: {
        Args: { completeness_score: number }
        Returns: string
      }
      get_formation_variants: {
        Args: { formation_id: string }
        Returns: {
          variant_direction: string
          variant_id: string
          variant_name: string
        }[]
      }
      get_personnel_configuration_by_name: {
        Args: { p_name: string; p_playbook_id: string }
        Returns: {
          created_at: string
          description: string
          id: string
          name: string
          playbook_id: string
          updated_at: string
        }[]
      }
      get_personnel_players: {
        Args: { p_config_id: string }
        Returns: {
          config_id: string
          id: string
          is_wildcat_qb: boolean
          label: string
          player_position: string
          sort_order: number
        }[]
      }
      get_play_with_diagram: {
        Args: { p_play_id: string }
        Returns: {
          created_at: string
          diagram_data: Json
          formation: string
          id: string
          p_type: string
          play_name: string
          updated_at: string
        }[]
      }
      get_playbook_team_id: { Args: { p_playbook_id: string }; Returns: string }
      is_active_team_member: {
        Args: { p_team_id: string; p_user_id: string }
        Returns: boolean
      }
      is_base_formation: { Args: { formation_id: string }; Returns: boolean }
      is_coaching_team_member: {
        Args: { p_team_id: string; p_user_id: string }
        Returns: boolean
      }
      is_user_team_coach: { Args: { team_uuid: string }; Returns: boolean }
      is_user_team_member: { Args: { team_uuid: string }; Returns: boolean }
      link_formations_bidirectional: {
        Args: {
          formation1_direction?: string
          formation1_id: string
          formation2_direction?: string
          formation2_id: string
        }
        Returns: undefined
      }
      link_formations_transaction: {
        Args: {
          p_base_formation_id: string
          p_left_formation_id?: string
          p_personnel_packages?: string[]
          p_right_formation_id?: string
        }
        Returns: Json
      }
      pgp_armor_headers: {
        Args: { "": string }
        Returns: Record<string, unknown>[]
      }
      remove_play_tag: {
        Args: { play_id: string; tag: string }
        Returns: undefined
      }
      restore_formation: { Args: { formation_id: string }; Returns: undefined }
      restore_personnel_config: {
        Args: { config_id: string }
        Returns: undefined
      }
      soft_delete_formation: {
        Args: { formation_id: string }
        Returns: undefined
      }
      soft_delete_personnel_config: {
        Args: { config_id: string }
        Returns: undefined
      }
      unlink_formations_bidirectional: {
        Args: { formation_id: string }
        Returns: undefined
      }
      update_play_diagram: {
        Args: { p_diagram_data: Json; p_play_id: string }
        Returns: undefined
      }
      users_share_active_team: {
        Args: { p_user_a: string; p_user_b: string }
        Returns: boolean
      }
      uuid_generate_v1: { Args: never; Returns: string }
      uuid_generate_v1mc: { Args: never; Returns: string }
      uuid_generate_v3: {
        Args: { name: string; namespace: string }
        Returns: string
      }
      uuid_generate_v4: { Args: never; Returns: string }
      uuid_generate_v5: {
        Args: { name: string; namespace: string }
        Returns: string
      }
      uuid_nil: { Args: never; Returns: string }
      uuid_ns_dns: { Args: never; Returns: string }
      uuid_ns_oid: { Args: never; Returns: string }
      uuid_ns_url: { Args: never; Returns: string }
      uuid_ns_x500: { Args: never; Returns: string }
    }
    Enums: {
      formation_creation_source:
        | "play_builder"
        | "diagram_editor"
        | "formation_library"
        | "formation_builder"
        | "bulk_import"
        | "api"
        | "migration"
        | "unknown"
      play_creation_source:
        | "add_play_modal"
        | "diagram_editor"
        | "play_card"
        | "bulk_import"
        | "api"
        | "migration"
        | "unknown"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      formation_creation_source: [
        "play_builder",
        "diagram_editor",
        "formation_library",
        "formation_builder",
        "bulk_import",
        "api",
        "migration",
        "unknown",
      ],
      play_creation_source: [
        "add_play_modal",
        "diagram_editor",
        "play_card",
        "bulk_import",
        "api",
        "migration",
        "unknown",
      ],
    },
  },
} as const
