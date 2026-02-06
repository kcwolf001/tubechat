import { SupabaseClient } from "@supabase/supabase-js";
import { ChatMessage, Conversation } from "@/types";

/**
 * Load an existing conversation and its messages for a user + video pair.
 * Returns null if no conversation exists yet.
 */
export async function loadConversation(
  supabase: SupabaseClient | null,
  userId: string | undefined,
  videoId: string
): Promise<{ conversation: Conversation; messages: ChatMessage[] } | null> {
  if (!supabase || !userId) return null;

  const { data: conv } = await supabase
    .from("conversations")
    .select("*")
    .eq("user_id", userId)
    .eq("video_id", videoId)
    .single();

  if (!conv) return null;

  const { data: msgs } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conv.id)
    .order("created_at", { ascending: true });

  const chatMessages: ChatMessage[] = (msgs ?? []).map((m) => ({
    id: m.id,
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  return { conversation: conv as Conversation, messages: chatMessages };
}

/**
 * Find or create a conversation for a user + video pair. Returns the conversation ID.
 */
export async function getOrCreateConversation(
  supabase: SupabaseClient | null,
  userId: string | undefined,
  videoId: string
): Promise<string | null> {
  if (!supabase || !userId) return null;

  const { data, error } = await supabase
    .from("conversations")
    .upsert(
      { user_id: userId, video_id: videoId },
      { onConflict: "user_id,video_id" }
    )
    .select("id")
    .single();

  if (error || !data) return null;
  return data.id;
}

/**
 * Save a single message to a conversation.
 */
export async function saveMessage(
  supabase: SupabaseClient | null,
  conversationId: string,
  role: "user" | "assistant",
  content: string
): Promise<void> {
  if (!supabase || !conversationId) return;

  await supabase
    .from("messages")
    .insert({ conversation_id: conversationId, role, content });
}

/**
 * Load all conversations for the history page, ordered by most recent.
 */
export async function loadConversationList(
  supabase: SupabaseClient | null,
  userId: string | undefined
): Promise<Conversation[]> {
  if (!supabase || !userId) return [];

  const { data } = await supabase
    .from("conversations")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  return (data ?? []) as Conversation[];
}

/**
 * Update the video_title on a conversation (fire-and-forget).
 */
export async function updateVideoTitle(
  supabase: SupabaseClient | null,
  conversationId: string,
  title: string
): Promise<void> {
  if (!supabase || !conversationId) return;

  await supabase
    .from("conversations")
    .update({ video_title: title })
    .eq("id", conversationId);
}
