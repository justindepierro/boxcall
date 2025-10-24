/**
 * Hashtag Service
 * Extracts and manages hashtags from announcements
 */

export interface HashtagCount {
  tag: string;
  count: number;
}

export class HashtagService {
  /**
   * Extract hashtags from TipTap JSON content
   */
  static extractHashtagsFromContent(contentJson: string | null): string[] {
    if (!contentJson) return [];

    try {
      const parsed = JSON.parse(contentJson);
      const hashtags: string[] = [];

      // Recursively search for hashtag marks in the JSON structure
      const findHashtags = (node: any) => {
        if (!node) return;

        // Check if this is a text node with marks
        if (node.marks && Array.isArray(node.marks)) {
          for (const mark of node.marks) {
            if (mark.type === "hashtag" && mark.attrs?.tag) {
              hashtags.push(mark.attrs.tag);
            }
          }
        }

        // Recurse into content
        if (node.content && Array.isArray(node.content)) {
          for (const child of node.content) {
            findHashtags(child);
          }
        }
      };

      findHashtags(parsed);
      return hashtags;
    } catch (error) {
      console.error("Error extracting hashtags:", error);
      return [];
    }
  }

  /**
   * Extract hashtags from plain text content (fallback)
   */
  static extractHashtagsFromText(text: string): string[] {
    const hashtagRegex = /#([a-zA-Z0-9_]+)/g;
    const matches = text.matchAll(hashtagRegex);
    return Array.from(matches, (match) => match[1]);
  }

  /**
   * Get unique hashtags with counts from multiple announcements
   */
  static getHashtagCounts(announcements: any[]): HashtagCount[] {
    const tagCounts = new Map<string, number>();

    for (const announcement of announcements) {
      // Try JSON content first
      let tags = this.extractHashtagsFromContent(announcement.content_json);
      
      // Fallback to plain text if no JSON
      if (tags.length === 0 && announcement.content) {
        tags = this.extractHashtagsFromText(announcement.content);
      }

      // Count occurrences
      for (const tag of tags) {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      }
    }

    // Convert to array and sort by count (descending)
    return Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Filter announcements by hashtag
   */
  static filterByHashtag(announcements: any[], hashtag: string): any[] {
    return announcements.filter((announcement) => {
      // Check JSON content
      const jsonTags = this.extractHashtagsFromContent(announcement.content_json);
      if (jsonTags.includes(hashtag)) return true;

      // Check plain text
      const textTags = this.extractHashtagsFromText(announcement.content || "");
      return textTags.includes(hashtag);
    });
  }
}
