// Complete BoxCall Database Types
// Generated from actual schema on 2025-08-01

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      achievements: {
        Row: {
          id: string;
          team_id: string;
          user_id: string;
          achievement_type:
            | "helmet_sticker"
            | "medal"
            | "trophy"
            | "certificate";
          title: string;
          description: string | null;
          category: string | null;
          icon_name: string | null;
          awarded_by: string;
          earned_at: string | null;
          is_public: boolean | null;
        };
        Insert: {
          id?: string;
          team_id: string;
          user_id: string;
          achievement_type:
            | "helmet_sticker"
            | "medal"
            | "trophy"
            | "certificate";
          title: string;
          description?: string | null;
          category?: string | null;
          icon_name?: string | null;
          awarded_by: string;
          earned_at?: string | null;
          is_public?: boolean | null;
        };
        Update: {
          id?: string;
          team_id?: string;
          user_id?: string;
          achievement_type?:
            | "helmet_sticker"
            | "medal"
            | "trophy"
            | "certificate";
          title?: string;
          description?: string | null;
          category?: string | null;
          icon_name?: string | null;
          awarded_by?: string;
          earned_at?: string | null;
          is_public?: boolean | null;
        };
      };
      games: {
        Row: {
          id: string;
          team_id: string;
          opponent_name: string;
          game_date: string;
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
          game_date: string;
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
          game_date?: string;
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
      helmet_stickers: {
        Row: {
          id: string;
          user_id: string;
          team_id: string;
          reason: string;
          sticker_type:
            | "star"
            | "flame"
            | "lightning"
            | "crown"
            | "diamond"
            | null;
          game_id: string | null;
          awarded_by: string;
          awarded_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          team_id: string;
          reason: string;
          sticker_type?:
            | "star"
            | "flame"
            | "lightning"
            | "crown"
            | "diamond"
            | null;
          game_id?: string | null;
          awarded_by: string;
          awarded_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          team_id?: string;
          reason?: string;
          sticker_type?:
            | "star"
            | "flame"
            | "lightning"
            | "crown"
            | "diamond"
            | null;
          game_id?: string | null;
          awarded_by?: string;
          awarded_at?: string | null;
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
          ftag1: string | null;
          ftag2: string | null;
          back_align: string | null;
          shift: string | null;
          motion: string | null;
          protection: string | null;
          play_name: string;
          p_tag1: string | null;
          p_tag2: string | null;
          p_dir: string | null;
          f_type: string | null;
          p_type: "Pass" | "Run" | "RPO";
          key_player1: string | null;
          key_player2: string | null;
          pref_down: string | null;
          pref_dis: string | null;
          pref_hash: string | null;
          pref_cov: string | null;
          pref_front: string | null;
          check_into: string | null;
          r_str: string | null;
          p_str: string | null;
          personnel: string | null;
          confidence_base: number | null;
          success_rate: number | null;
          times_called: number | null;
          times_successful: number | null;
          diagram_url: string | null;
          video_url: string | null;
          notes: string | null;
          tags: string[] | null;
          created_by: string;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          playbook_id: string;
          formation: string;
          f_dir?: string | null;
          ftag1?: string | null;
          ftag2?: string | null;
          back_align?: string | null;
          shift?: string | null;
          motion?: string | null;
          protection?: string | null;
          play_name: string;
          p_tag1?: string | null;
          p_tag2?: string | null;
          p_dir?: string | null;
          f_type?: string | null;
          p_type: "Pass" | "Run" | "RPO";
          key_player1?: string | null;
          key_player2?: string | null;
          pref_down?: string | null;
          pref_dis?: string | null;
          pref_hash?: string | null;
          pref_cov?: string | null;
          pref_front?: string | null;
          check_into?: string | null;
          r_str?: string | null;
          p_str?: string | null;
          personnel?: string | null;
          confidence_base?: number | null;
          success_rate?: number | null;
          times_called?: number | null;
          times_successful?: number | null;
          diagram_url?: string | null;
          video_url?: string | null;
          notes?: string | null;
          tags?: string[] | null;
          created_by: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          playbook_id?: string;
          formation?: string;
          f_dir?: string | null;
          ftag1?: string | null;
          ftag2?: string | null;
          back_align?: string | null;
          shift?: string | null;
          motion?: string | null;
          protection?: string | null;
          play_name?: string;
          p_tag1?: string | null;
          p_tag2?: string | null;
          p_dir?: string | null;
          f_type?: string | null;
          p_type?: "Pass" | "Run" | "RPO";
          key_player1?: string | null;
          key_player2?: string | null;
          pref_down?: string | null;
          pref_dis?: string | null;
          pref_hash?: string | null;
          pref_cov?: string | null;
          pref_front?: string | null;
          check_into?: string | null;
          r_str?: string | null;
          p_str?: string | null;
          personnel?: string | null;
          confidence_base?: number | null;
          success_rate?: number | null;
          times_called?: number | null;
          times_successful?: number | null;
          diagram_url?: string | null;
          video_url?: string | null;
          notes?: string | null;
          tags?: string[] | null;
          created_by?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      post_comments: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          content: string;
          parent_comment_id: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          content: string;
          parent_comment_id?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_id?: string;
          content?: string;
          parent_comment_id?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      practice_scripts: {
        Row: {
          id: string;
          team_id: string;
          name: string;
          practice_date: string | null;
          practice_time: string | null;
          location: string | null;
          duration_minutes: number | null;
          focus_areas: string[] | null;
          notes: string | null;
          weather_conditions: string | null;
          is_template: boolean | null;
          created_by: string;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          team_id: string;
          name: string;
          practice_date?: string | null;
          practice_time?: string | null;
          location?: string | null;
          duration_minutes?: number | null;
          focus_areas?: string[] | null;
          notes?: string | null;
          weather_conditions?: string | null;
          is_template?: boolean | null;
          created_by: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          team_id?: string;
          name?: string;
          practice_date?: string | null;
          practice_time?: string | null;
          location?: string | null;
          duration_minutes?: number | null;
          focus_areas?: string[] | null;
          notes?: string | null;
          weather_conditions?: string | null;
          is_template?: boolean | null;
          created_by?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          role: "player" | "coach" | "family" | "admin" | null;
          bio: string | null;
          phone: string | null;
          created_at: string | null;
          email: string | null;
          display_name: string | null;
          address: string | null;
          settings: Json | null;
          last_login: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: "player" | "coach" | "family" | "admin" | null;
          bio?: string | null;
          phone?: string | null;
          created_at?: string | null;
          email?: string | null;
          display_name?: string | null;
          address?: string | null;
          settings?: Json | null;
          last_login?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: "player" | "coach" | "family" | "admin" | null;
          bio?: string | null;
          phone?: string | null;
          created_at?: string | null;
          email?: string | null;
          display_name?: string | null;
          address?: string | null;
          settings?: Json | null;
          last_login?: string | null;
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
          estimated_time_minutes: number | null;
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
          estimated_time_minutes?: number | null;
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
          estimated_time_minutes?: number | null;
          created_at?: string | null;
        };
      };
      team_announcements: {
        Row: {
          id: string;
          team_id: string;
          author_id: string;
          title: string;
          content: string;
          priority: "low" | "normal" | "high" | "urgent" | null;
          target_roles: string[] | null;
          expires_at: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          team_id: string;
          author_id: string;
          title: string;
          content: string;
          priority?: "low" | "normal" | "high" | "urgent" | null;
          target_roles?: string[] | null;
          expires_at?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          team_id?: string;
          author_id?: string;
          title?: string;
          content?: string;
          priority?: "low" | "normal" | "high" | "urgent" | null;
          target_roles?: string[] | null;
          expires_at?: string | null;
          created_at?: string | null;
        };
      };
      team_members: {
        Row: {
          id: string;
          user_id: string;
          team_id: string;
          role: "head_coach" | "coach" | "player" | "manager" | "family";
          permissions: Json | null;
          status: "active" | "inactive" | "pending" | null;
          joined_at: string | null;
          invited_by: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          team_id: string;
          role?: "head_coach" | "coach" | "player" | "manager" | "family";
          permissions?: Json | null;
          status?: "active" | "inactive" | "pending" | null;
          joined_at?: string | null;
          invited_by?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          team_id?: string;
          role?: "head_coach" | "coach" | "player" | "manager" | "family";
          permissions?: Json | null;
          status?: "active" | "inactive" | "pending" | null;
          joined_at?: string | null;
          invited_by?: string | null;
        };
      };
      team_posts: {
        Row: {
          id: string;
          team_id: string;
          author_id: string;
          content: string;
          post_type:
            | "general"
            | "announcement"
            | "achievement"
            | "game_result"
            | "practice_update"
            | null;
          media_urls: string[] | null;
          is_pinned: boolean | null;
          visibility: "team" | "coaches_only" | "public" | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          team_id: string;
          author_id: string;
          content: string;
          post_type?:
            | "general"
            | "announcement"
            | "achievement"
            | "game_result"
            | "practice_update"
            | null;
          media_urls?: string[] | null;
          is_pinned?: boolean | null;
          visibility?: "team" | "coaches_only" | "public" | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          team_id?: string;
          author_id?: string;
          content?: string;
          post_type?:
            | "general"
            | "announcement"
            | "achievement"
            | "game_result"
            | "practice_update"
            | null;
          media_urls?: string[] | null;
          is_pinned?: boolean | null;
          visibility?: "team" | "coaches_only" | "public" | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      teams: {
        Row: {
          id: string;
          name: string;
          school_name: string | null;
          mascot: string | null;
          colors_primary: string | null;
          colors_secondary: string | null;
          logo_url: string | null;
          created_by: string;
          subscription_tier: "free" | "coach" | "team_premium" | null;
          subscription_expires_at: string | null;
          team_code: string | null;
          season_year: number | null;
          league_division: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          school_name?: string | null;
          mascot?: string | null;
          colors_primary?: string | null;
          colors_secondary?: string | null;
          logo_url?: string | null;
          created_by: string;
          subscription_tier?: "free" | "coach" | "team_premium" | null;
          subscription_expires_at?: string | null;
          team_code?: string | null;
          season_year?: number | null;
          league_division?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          school_name?: string | null;
          mascot?: string | null;
          colors_primary?: string | null;
          colors_secondary?: string | null;
          logo_url?: string | null;
          created_by?: string;
          subscription_tier?: "free" | "coach" | "team_premium" | null;
          subscription_expires_at?: string | null;
          team_code?: string | null;
          season_year?: number | null;
          league_division?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
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
      post_reactions: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          reaction_type: "like" | "love" | "celebrate" | "support" | "fire";
          created_at: string | null;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          reaction_type: "like" | "love" | "celebrate" | "support" | "fire";
          created_at?: string | null;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_id?: string;
          reaction_type?: "like" | "love" | "celebrate" | "support" | "fire";
          created_at?: string | null;
        };
      };
      super_admins: {
        Row: {
          id: string;
          user_id: string;
          email: string;
          admin_level: "super_admin" | "admin" | "moderator" | null;
          permissions: Json | null;
          added_by: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          email: string;
          admin_level?: "super_admin" | "admin" | "moderator" | null;
          permissions?: Json | null;
          added_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          email?: string;
          admin_level?: "super_admin" | "admin" | "moderator" | null;
          permissions?: Json | null;
          added_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      team_files: {
        Row: {
          id: string;
          team_id: string;
          uploaded_by: string;
          file_name: string;
          file_path: string;
          file_type: string;
          file_size_bytes: number | null;
          mime_type: string | null;
          description: string | null;
          is_public: boolean | null;
          download_count: number | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          team_id: string;
          uploaded_by: string;
          file_name: string;
          file_path: string;
          file_type: string;
          file_size_bytes?: number | null;
          mime_type?: string | null;
          description?: string | null;
          is_public?: boolean | null;
          download_count?: number | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          team_id?: string;
          uploaded_by?: string;
          file_name?: string;
          file_path?: string;
          file_type?: string;
          file_size_bytes?: number | null;
          mime_type?: string | null;
          description?: string | null;
          is_public?: boolean | null;
          download_count?: number | null;
          created_at?: string | null;
        };
      };
      team_goals: {
        Row: {
          id: string;
          team_id: string;
          title: string;
          description: string | null;
          goal_type:
            | "wins"
            | "stats"
            | "behavior"
            | "academic"
            | "fundraising"
            | null;
          target_value: number | null;
          current_value: number | null;
          unit: string | null;
          deadline: string | null;
          is_achieved: boolean | null;
          reward_description: string | null;
          created_by: string;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          team_id: string;
          title: string;
          description?: string | null;
          goal_type?:
            | "wins"
            | "stats"
            | "behavior"
            | "academic"
            | "fundraising"
            | null;
          target_value?: number | null;
          current_value?: number | null;
          unit?: string | null;
          deadline?: string | null;
          is_achieved?: boolean | null;
          reward_description?: string | null;
          created_by: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          team_id?: string;
          title?: string;
          description?: string | null;
          goal_type?:
            | "wins"
            | "stats"
            | "behavior"
            | "academic"
            | "fundraising"
            | null;
          target_value?: number | null;
          current_value?: number | null;
          unit?: string | null;
          deadline?: string | null;
          is_achieved?: boolean | null;
          reward_description?: string | null;
          created_by?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      team_invites: {
        Row: {
          id: string;
          team_id: string | null;
          email: string;
          role: "player" | "coach" | "family" | "admin" | null;
          invited_by: string | null;
          created_at: string | null;
          expires_at: string | null;
        };
        Insert: {
          id?: string;
          team_id?: string | null;
          email: string;
          role?: "player" | "coach" | "family" | "admin" | null;
          invited_by?: string | null;
          created_at?: string | null;
          expires_at?: string | null;
        };
        Update: {
          id?: string;
          team_id?: string | null;
          email?: string;
          role?: "player" | "coach" | "family" | "admin" | null;
          invited_by?: string | null;
          created_at?: string | null;
          expires_at?: string | null;
        };
      };
      team_memberships: {
        Row: {
          id: string;
          team_id: string | null;
          user_id: string | null;
          role: "player" | "coach" | "family" | "admin" | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          team_id?: string | null;
          user_id?: string | null;
          role?: "player" | "coach" | "family" | "admin" | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          team_id?: string | null;
          user_id?: string | null;
          role?: "player" | "coach" | "family" | "admin" | null;
          created_at?: string | null;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          user_id: string;
          display_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          emergency_contact: string | null;
          emergency_phone: string | null;
          position: string | null;
          jersey_number: number | null;
          grade_level: string | null;
          height_inches: number | null;
          weight_lbs: number | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          emergency_contact?: string | null;
          emergency_phone?: string | null;
          position?: string | null;
          jersey_number?: number | null;
          grade_level?: string | null;
          height_inches?: number | null;
          weight_lbs?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          emergency_contact?: string | null;
          emergency_phone?: string | null;
          position?: string | null;
          jersey_number?: number | null;
          grade_level?: string | null;
          height_inches?: number | null;
          weight_lbs?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: "player" | "coach" | "family" | "admin";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Convenience type exports
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type Inserts<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type Updates<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

// Individual table types for easy importing
export type Achievement = Tables<"achievements">;
export type Game = Tables<"games">;
export type HelmetSticker = Tables<"helmet_stickers">;
export type Playbook = Tables<"playbooks">;
export type Play = Tables<"plays">;
export type PlayCall = Tables<"play_calls">;
export type PostComment = Tables<"post_comments">;
export type PostReaction = Tables<"post_reactions">;
export type PracticeScript = Tables<"practice_scripts">;
export type Profile = Tables<"profiles">;
export type ScriptPlay = Tables<"script_plays">;
export type SuperAdmin = Tables<"super_admins">;
export type TeamAnnouncement = Tables<"team_announcements">;
export type TeamFile = Tables<"team_files">;
export type TeamGoal = Tables<"team_goals">;
export type TeamInvite = Tables<"team_invites">;
export type TeamMember = Tables<"team_members">;
export type TeamMembership = Tables<"team_memberships">;
export type TeamPost = Tables<"team_posts">;
export type Team = Tables<"teams">;
export type UserProfile = Tables<"user_profiles">;

// Insert types
export type AchievementInsert = Inserts<"achievements">;
export type GameInsert = Inserts<"games">;
export type HelmetStickerInsert = Inserts<"helmet_stickers">;
export type PlaybookInsert = Inserts<"playbooks">;
export type PlayInsert = Inserts<"plays">;
export type PlayCallInsert = Inserts<"play_calls">;
export type PostCommentInsert = Inserts<"post_comments">;
export type PostReactionInsert = Inserts<"post_reactions">;
export type PracticeScriptInsert = Inserts<"practice_scripts">;
export type ProfileInsert = Inserts<"profiles">;
export type ScriptPlayInsert = Inserts<"script_plays">;
export type SuperAdminInsert = Inserts<"super_admins">;
export type TeamAnnouncementInsert = Inserts<"team_announcements">;
export type TeamFileInsert = Inserts<"team_files">;
export type TeamGoalInsert = Inserts<"team_goals">;
export type TeamInviteInsert = Inserts<"team_invites">;
export type TeamMemberInsert = Inserts<"team_members">;
export type TeamMembershipInsert = Inserts<"team_memberships">;
export type TeamPostInsert = Inserts<"team_posts">;
export type TeamInsert = Inserts<"teams">;
export type UserProfileInsert = Inserts<"user_profiles">;

// Update types
export type AchievementUpdate = Updates<"achievements">;
export type GameUpdate = Updates<"games">;
export type HelmetStickerUpdate = Updates<"helmet_stickers">;
export type PlaybookUpdate = Updates<"playbooks">;
export type PlayUpdate = Updates<"plays">;
export type PlayCallUpdate = Updates<"play_calls">;
export type PostCommentUpdate = Updates<"post_comments">;
export type PostReactionUpdate = Updates<"post_reactions">;
export type PracticeScriptUpdate = Updates<"practice_scripts">;
export type ProfileUpdate = Updates<"profiles">;
export type ScriptPlayUpdate = Updates<"script_plays">;
export type SuperAdminUpdate = Updates<"super_admins">;
export type TeamAnnouncementUpdate = Updates<"team_announcements">;
export type TeamFileUpdate = Updates<"team_files">;
export type TeamGoalUpdate = Updates<"team_goals">;
export type TeamInviteUpdate = Updates<"team_invites">;
export type TeamMemberUpdate = Updates<"team_members">;
export type TeamMembershipUpdate = Updates<"team_memberships">;
export type TeamPostUpdate = Updates<"team_posts">;
export type TeamUpdate = Updates<"teams">;
export type UserProfileUpdate = Updates<"user_profiles">;
