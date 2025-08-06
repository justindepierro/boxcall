/**
 * Social and Engagement Tables
 * All tables related to achievements, posts, comments, and social features
 */

export interface SocialTables {
  achievements: {
    Row: {
      id: string;
      team_id: string;
      user_id: string;
      achievement_type: "helmet_sticker" | "medal" | "trophy" | "certificate";
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
      achievement_type: "helmet_sticker" | "medal" | "trophy" | "certificate";
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
      achievement_type?: "helmet_sticker" | "medal" | "trophy" | "certificate";
      title?: string;
      description?: string | null;
      category?: string | null;
      icon_name?: string | null;
      awarded_by?: string;
      earned_at?: string | null;
      is_public?: boolean | null;
    };
  };
  helmet_stickers: {
    Row: {
      id: string;
      user_id: string;
      team_id: string;
      reason: string;
      sticker_type: "star" | "flame" | "lightning" | "crown" | "diamond" | null;
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
  post_comments: {
    Row: {
      id: string;
      post_id: string;
      author_id: string;
      content: string;
      parent_comment_id: string | null;
      created_at: string | null;
    };
    Insert: {
      id?: string;
      post_id: string;
      author_id: string;
      content: string;
      parent_comment_id?: string | null;
      created_at?: string | null;
    };
    Update: {
      id?: string;
      post_id?: string;
      author_id?: string;
      content?: string;
      parent_comment_id?: string | null;
      created_at?: string | null;
    };
  };
  post_reactions: {
    Row: {
      id: string;
      post_id: string;
      user_id: string;
      reaction_type: "like" | "love" | "celebrate" | "support" | null;
      created_at: string | null;
    };
    Insert: {
      id?: string;
      post_id: string;
      user_id: string;
      reaction_type?: "like" | "love" | "celebrate" | "support" | null;
      created_at?: string | null;
    };
    Update: {
      id?: string;
      post_id?: string;
      user_id?: string;
      reaction_type?: "like" | "love" | "celebrate" | "support" | null;
      created_at?: string | null;
    };
  };
}
