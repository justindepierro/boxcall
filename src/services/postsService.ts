import { supabase } from "../lib/supabase";

export interface TeamPostListItem {
  id: string;
  team_id: string;
  author_id: string;
  content: string;
  created_at: string | null;
  is_pinned: boolean | null;
}

// Narrow column list (avoid SELECT *)
const POST_COLUMNS =
  "id, team_id, author_id, content, created_at, is_pinned" as const;

export async function listTeamPosts(
  teamId: string
): Promise<TeamPostListItem[]> {
  if (!teamId) return [];
  const { data, error } = await supabase
    .from("team_posts")
    .select(POST_COLUMNS)
    .eq("team_id", teamId)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export interface CreatePostInput {
  teamId: string;
  content: string;
  isPinned?: boolean;
}

export async function createPost({
  teamId,
  content,
  isPinned,
}: CreatePostInput) {
  const { data, error } = await supabase
    .from("team_posts")
    .insert({ team_id: teamId, content, is_pinned: !!isPinned })
    .select(POST_COLUMNS)
    .single();
  if (error) throw error;
  return data;
}
