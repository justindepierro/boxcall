import { supabase } from "../lib/supabase";

export interface TeamPostListItem {
  id: string;
  team_id: string;
  author_id: string;
  content: string;
  created_at: string | null;
  is_pinned: boolean | null;
  likes_count: number;
  comments_count: number;
  shares_count: number;
}

// Simplified column list without joins to avoid RLS issues
const POST_COLUMNS =
  "id, team_id, author_id, content, created_at, is_pinned, likes_count, comments_count, shares_count" as const;

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

export async function updatePostPin(postId: string, isPinned: boolean) {
  const { data, error } = await supabase
    .from("team_posts")
    .update({ is_pinned: isPinned })
    .eq("id", postId)
    .select(POST_COLUMNS)
    .single();
  if (error) throw error;
  return data;
}

// Post Interactions
export interface PostLike {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

export interface PostComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    display_name: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface PostShare {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

export async function likePost(postId: string) {
  const { data, error } = await supabase
    .from("post_likes")
    .insert({ post_id: postId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function unlikePost(postId: string) {
  const { error } = await supabase
    .from("post_likes")
    .delete()
    .eq("post_id", postId);
  if (error) throw error;
}

export async function checkUserLike(
  postId: string,
  userId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from("post_likes")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .single();
  if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows returned
  return !!data;
}

export async function addComment(postId: string, content: string) {
  const { data, error } = await supabase
    .from("post_comments")
    .insert({ post_id: postId, content })
    .select(
      `
      *,
      author:profiles(id, display_name, full_name, avatar_url)
    `
    )
    .single();
  if (error) throw error;
  return data;
}

export async function getPostComments(postId: string): Promise<PostComment[]> {
  const { data, error } = await supabase
    .from("post_comments")
    .select(
      `
      *,
      author:profiles(id, display_name, full_name, avatar_url)
    `
    )
    .eq("post_id", postId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function sharePost(postId: string) {
  const { data, error } = await supabase
    .from("post_shares")
    .insert({ post_id: postId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function checkUserShare(
  postId: string,
  userId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from("post_shares")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .single();
  if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows returned
  return !!data;
}
