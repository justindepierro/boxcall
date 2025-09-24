// Mentions Service
// Handles @mention parsing, suggestions, and processing

import { supabase } from '../lib/supabase';

export interface MentionSuggestion {
  id: string;
  display_name: string;
  avatar_url?: string;
  type: 'user' | 'team';
}

export interface ParsedMention {
  userId: string;
  displayName: string;
  position: number;
  length: number;
}

export class MentionsService {
  // Parse @mentions from text and return structured data
  static parseMentions(text: string): ParsedMention[] {
    const mentionRegex = /@(\w+)/g;
    const mentions: ParsedMention[] = [];
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      const mentionText = match[1];
      const position = match.index;
      const length = match[0].length;

      // For now, we'll create mentions with placeholder data
      // In a real implementation, you'd look up the user by username
      mentions.push({
        userId: `user-${mentionText.toLowerCase()}`, // Placeholder
        displayName: mentionText,
        position,
        length
      });
    }

    return mentions;
  }

  // Get mention suggestions based on query
  static async getMentionSuggestions(query: string, limit = 5): Promise<MentionSuggestion[]> {
    if (!query || query.length < 2) return [];

    try {
      // Search for users by display name or username
      const { data: users, error } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .ilike('display_name', `%${query}%`)
        .limit(limit);

      if (error) throw error;

      return (users || []).map(user => ({
        id: user.id,
        display_name: user.display_name || 'Unknown User',
        avatar_url: user.avatar_url,
        type: 'user' as const
      }));
    } catch (error) {
      console.error('Failed to get mention suggestions:', error);
      return [];
    }
  }

  // Save mentions to database when a comment is posted
  static async saveMentions(commentId: string, mentions: ParsedMention[]): Promise<void> {
    if (mentions.length === 0) return;

    try {
      const mentionRecords = mentions.map(mention => ({
        comment_id: commentId,
        mentioned_user_id: mention.userId,
        mentioner_user_id: supabase.auth.getUser()?.then(({ data }) => data.user?.id),
        mention_position: mention.position
      }));

      const { error } = await supabase
        .from('mentions')
        .insert(mentionRecords);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to save mentions:', error);
    }
  }

  // Get mentions for a user (for notifications)
  static async getMentionsForUser(userId: string, limit = 20): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('mentions')
        .select(`
          *,
          comment:comments(
            content,
            content_type,
            content_id,
            created_at,
            user:profiles(display_name, avatar_url)
          ),
          mentioner:profiles(display_name, avatar_url)
        `)
        .eq('mentioned_user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to get mentions for user:', error);
      return [];
    }
  }

  // Highlight mentions in text
  static highlightMentions(text: string, mentions: ParsedMention[]): string {
    let result = text;
    let offset = 0;

    // Sort mentions by position (important for correct offsetting)
    const sortedMentions = [...mentions].sort((a, b) => a.position - b.position);

    for (const mention of sortedMentions) {
      const startPos = mention.position + offset;
      const endPos = startPos + mention.length;

      // Wrap the mention in a highlight span
      const before = result.substring(0, startPos);
      const after = result.substring(endPos);

      result = `${before}<span class="mention-highlight">@${mention.displayName}</span>${after}`;

      // Update offset for next mention
      offset += '<span class="mention-highlight"></span>'.length;
    }

    return result;
  }
}