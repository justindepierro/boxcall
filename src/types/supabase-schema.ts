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
      formations: {
        Row: {
          base_formation_id: string | null
          category: string | null
          created_at: string
          created_by: string | null
          description: string | null
          direction: string
          directionality_type: string | null
          formation_type: string | null
          id: string
          is_custom: boolean | null
          name: string
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
          description?: string | null
          direction?: string
          directionality_type?: string | null
          formation_type?: string | null
          id?: string
          is_custom?: boolean | null
          name: string
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
          description?: string | null
          direction?: string
          directionality_type?: string | null
          formation_type?: string | null
          id?: string
          is_custom?: boolean | null
          name?: string
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
            foreignKeyName: "formations_personnel_id_fkey"
            columns: ["personnel_id"]
            isOneToOne: false
            referencedRelation: "personnel_configurations"
            referencedColumns: ["id"]
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
          distance: number | null
          down: number | null
          game_plan_id: string | null
          id: string
          situation_type: string
          yard_line: number | null
        }
        Insert: {
          created_at?: string | null
          distance?: number | null
          down?: number | null
          game_plan_id?: string | null
          id?: string
          situation_type: string
          yard_line?: number | null
        }
        Update: {
          created_at?: string | null
          distance?: number | null
          down?: number | null
          game_plan_id?: string | null
          id?: string
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
          game_date: string
          home_away: string | null
          id: string
          opponent: string
          team_id: string | null
          updated_at: string | null
          venue: string | null
        }
        Insert: {
          created_at?: string | null
          game_date: string
          home_away?: string | null
          id?: string
          opponent: string
          team_id?: string | null
          updated_at?: string | null
          venue?: string | null
        }
        Update: {
          created_at?: string | null
          game_date?: string
          home_away?: string | null
          id?: string
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
      personnel_configurations: {
        Row: {
          badge_customization: Json | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          playbook_id: string
          updated_at: string | null
        }
        Insert: {
          badge_customization?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          playbook_id: string
          updated_at?: string | null
        }
        Update: {
          badge_customization?: Json | null
          created_at?: string | null
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
            referencedRelation: "personnel_configurations"
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
          diagram_data: Json | null
          diagram_url: string | null
          diagram_version: number | null
          duplicate_key: string | null
          f_dir: string | null
          f_type: string | null
          formation: string
          formation_direction: string | null
          formation_id: string | null
          ftag1: string | null
          ftag2: string | null
          id: string
          is_archived: boolean | null
          key_player1: string | null
          key_player2: string | null
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
          shift: string | null
          times_called: number | null
          times_successful: number | null
          updated_at: string | null
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
          diagram_data?: Json | null
          diagram_url?: string | null
          diagram_version?: number | null
          duplicate_key?: string | null
          f_dir?: string | null
          f_type?: string | null
          formation: string
          formation_direction?: string | null
          formation_id?: string | null
          ftag1?: string | null
          ftag2?: string | null
          id?: string
          is_archived?: boolean | null
          key_player1?: string | null
          key_player2?: string | null
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
          shift?: string | null
          times_called?: number | null
          times_successful?: number | null
          updated_at?: string | null
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
          diagram_data?: Json | null
          diagram_url?: string | null
          diagram_version?: number | null
          duplicate_key?: string | null
          f_dir?: string | null
          f_type?: string | null
          formation?: string
          formation_direction?: string | null
          formation_id?: string | null
          ftag1?: string | null
          ftag2?: string | null
          id?: string
          is_archived?: boolean | null
          key_player1?: string | null
          key_player2?: string | null
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
          shift?: string | null
          times_called?: number | null
          times_successful?: number | null
          updated_at?: string | null
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
            foreignKeyName: "plays_personnel_id_fkey"
            columns: ["personnel_id"]
            isOneToOne: false
            referencedRelation: "personnel_configurations"
            referencedColumns: ["id"]
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
      practice_scripts: {
        Row: {
          created_at: string | null
          description: string | null
          duration: number | null
          id: string
          team_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration?: number | null
          id?: string
          team_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration?: number | null
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
          certifications: string[] | null
          coaching_experience: string | null
          coaching_philosophy: string | null
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
          notification_preferences: Json | null
          phone: string | null
          position: string | null
          role: string | null
          settings: Json | null
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
          certifications?: string[] | null
          coaching_experience?: string | null
          coaching_philosophy?: string | null
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
          notification_preferences?: Json | null
          phone?: string | null
          position?: string | null
          role?: string | null
          settings?: Json | null
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
          certifications?: string[] | null
          coaching_experience?: string | null
          coaching_philosophy?: string | null
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
          notification_preferences?: Json | null
          phone?: string | null
          position?: string | null
          role?: string | null
          settings?: Json | null
          subscription_expires_at?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
          weight_lbs?: number | null
          years_coaching?: number | null
        }
        Relationships: []
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
          is_active: boolean | null
          jersey_number: number | null
          last_name: string
          position: string | null
          team_id: string | null
          updated_at: string | null
          weight_lbs: number | null
        }
        Insert: {
          created_at?: string | null
          first_name: string
          grade_level?: string | null
          height_inches?: number | null
          id?: string
          is_active?: boolean | null
          jersey_number?: number | null
          last_name: string
          position?: string | null
          team_id?: string | null
          updated_at?: string | null
          weight_lbs?: number | null
        }
        Update: {
          created_at?: string | null
          first_name?: string
          grade_level?: string | null
          height_inches?: number | null
          id?: string
          is_active?: boolean | null
          jersey_number?: number | null
          last_name?: string
          position?: string | null
          team_id?: string | null
          updated_at?: string | null
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
      armor: {
        Args: { "": string }
        Returns: string
      }
      count_diagram_players: {
        Args: { p_diagram_data: Json }
        Returns: number
      }
      dearmor: {
        Args: { "": string }
        Returns: string
      }
      flip_formation_positions: {
        Args: { field_width?: number; positions: Json }
        Returns: Json
      }
      formation_has_variants: {
        Args: { formation_id: string }
        Returns: boolean
      }
      gen_random_bytes: {
        Args: { "": number }
        Returns: string
      }
      gen_random_uuid: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      gen_salt: {
        Args: { "": string }
        Returns: string
      }
      get_diagram_player_count: {
        Args: { diagram_data: Json }
        Returns: number
      }
      get_diagram_players_by_team: {
        Args: { diagram_data: Json; team_name: string }
        Returns: Json
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
      is_base_formation: {
        Args: { formation_id: string }
        Returns: boolean
      }
      is_user_team_coach: {
        Args: { team_uuid: string }
        Returns: boolean
      }
      is_user_team_member: {
        Args: { team_uuid: string }
        Returns: boolean
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
      pgp_key_id: {
        Args: { "": string }
        Returns: string
      }
      update_play_diagram: {
        Args: { p_diagram_data: Json; p_play_id: string }
        Returns: undefined
      }
      uuid_generate_v1: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      uuid_generate_v1mc: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      uuid_generate_v3: {
        Args: { name: string; namespace: string }
        Returns: string
      }
      uuid_generate_v4: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      uuid_generate_v5: {
        Args: { name: string; namespace: string }
        Returns: string
      }
      uuid_nil: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      uuid_ns_dns: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      uuid_ns_oid: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      uuid_ns_url: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      uuid_ns_x500: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
