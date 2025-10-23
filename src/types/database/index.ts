export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
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
          created_at: string | null
          description: string | null
          diagram_data: Json | null
          id: string
          name: string
          personnel_packages: string[] | null
          playbook_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          diagram_data?: Json | null
          id?: string
          name: string
          personnel_packages?: string[] | null
          playbook_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          diagram_data?: Json | null
          id?: string
          name?: string
          personnel_packages?: string[] | null
          playbook_id?: string
          updated_at?: string | null
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
          check_into: string | null
          confidence_base: number | null
          created_at: string | null
          creation_context: Json | null
          creation_source:
            | Database["public"]["Enums"]["play_creation_source"]
            | null
          diagram_data: Json | null
          f_dir: string | null
          f_type: string | null
          formation: string
          ftag1: string | null
          ftag2: string | null
          id: string
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
          check_into?: string | null
          confidence_base?: number | null
          created_at?: string | null
          creation_context?: Json | null
          creation_source?:
            | Database["public"]["Enums"]["play_creation_source"]
            | null
          diagram_data?: Json | null
          f_dir?: string | null
          f_type?: string | null
          formation: string
          ftag1?: string | null
          ftag2?: string | null
          id?: string
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
          check_into?: string | null
          confidence_base?: number | null
          created_at?: string | null
          creation_context?: Json | null
          creation_source?:
            | Database["public"]["Enums"]["play_creation_source"]
            | null
          diagram_data?: Json | null
          f_dir?: string | null
          f_type?: string | null
          formation?: string
          ftag1?: string | null
          ftag2?: string | null
          id?: string
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
          updated_at: string | null
          weight_lbs: number | null
          years_coaching: number | null
        }
        Insert: {
          address?: string | null
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
          updated_at?: string | null
          weight_lbs?: number | null
          years_coaching?: number | null
        }
        Update: {
          address?: string | null
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
          event_date: string
          event_type: string | null
          id: string
          team_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          event_date: string
          event_type?: string | null
          id?: string
          team_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          event_date?: string
          event_type?: string | null
          id?: string
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
          role_notes?: string | null
          status?: string | null
          team_id?: string | null
          team_role?: string
          user_id?: string
        }
        Relationships: [
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
      cleanup_expired_invitations: { Args: never; Returns: number }
      count_diagram_players: { Args: { p_diagram_data: Json }; Returns: number }
      dearmor: { Args: { "": string }; Returns: string }
      gen_random_uuid: { Args: never; Returns: string }
      gen_salt: { Args: { "": string }; Returns: string }
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
      pgp_armor_headers: {
        Args: { "": string }
        Returns: Record<string, unknown>[]
      }
      update_play_diagram: {
        Args: { p_diagram_data: Json; p_play_id: string }
        Returns: undefined
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
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

