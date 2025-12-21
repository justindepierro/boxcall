import { table } from "../data/supabase/db";
import { getCurrentUserId } from "../lib/auth-helpers";

export interface TeamPostListItem {
  id: string;
  team_id: string;
  author_id: string;
  content: string;
  created_at: string | null;
  is_pinned: boolean | null;
  likes_count: number | null;
  comments_count: number | null;
  shares_count: number | null;
}

// Simplified column list without joins to avoid RLS issues
const POST_COLUMNS =
  "id, team_id, author_id, content, created_at, is_pinned, likes_count, comments_count, shares_count" as const;

export async function listTeamPosts(
  teamId: string
): Promise<TeamPostListItem[]> {
  if (!teamId) return [];
  const { data, error } = await table("team_posts")
    .select(POST_COLUMNS)
    .eq("team_id", teamId)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((post) => ({
    ...post,
    likes_count: post.likes_count ?? 0,
    comments_count: post.comments_count ?? 0,
    shares_count: post.shares_count ?? 0,
  }));
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
  const authorId = getCurrentUserId();
  if (!authorId) throw new Error("User not authenticated");

  const { data, error } = await table("team_posts")
    .insert({
      team_id: teamId,
      author_id: authorId,
      content,
      is_pinned: !!isPinned,
    })
    .select(POST_COLUMNS)
    .single();
  if (error) throw error;
  return data;
}

export async function updatePostPin(postId: string, isPinned: boolean) {
  const { data, error } = await table("team_posts")
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
  author_id: string;
  content: string;
  created_at: string | null;
  updated_at: string | null;
  parent_comment_id: string | null;
}

export interface PostShare {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

export async function likePost(postId: string) {
  const userId = getCurrentUserId();
  if (!userId) throw new Error("User not authenticated");

  const { data, error } = await table("post_likes")
    .insert({ post_id: postId, user_id: userId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function unlikePost(postId: string) {
  const { error } = await table("post_likes").delete().eq("post_id", postId);
  if (error) throw error;
}

export async function checkUserLike(
  postId: string,
  userId: string
): Promise<boolean> {
  const { data, error } = await table("post_likes")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .single();
  if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows returned
  return !!data;
}

export async function addComment(postId: string, content: string) {
  const authorId = getCurrentUserId();
  if (!authorId) throw new Error("User not authenticated");

  const { data, error } = await table("post_comments")
    .insert({ post_id: postId, author_id: authorId, content })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function getPostComments(postId: string): Promise<PostComment[]> {
  const { data, error } = await table("post_comments")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function sharePost(postId: string) {
  const userId = getCurrentUserId();
  if (!userId) throw new Error("User not authenticated");

  const { data, error } = await table("post_shares")
    .insert({ post_id: postId, user_id: userId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function checkUserShare(
  postId: string,
  userId: string
): Promise<boolean> {
  const { data, error } = await table("post_shares")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .single();
  if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows returned
  return !!data;
}
