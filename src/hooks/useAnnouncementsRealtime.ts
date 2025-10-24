/**
 * useAnnouncementsRealtime Hook
 * Subscribes to real-time updates for announcements, reactions, and comments
 */

import { useEffect, useRef, useCallback } from "react";
import { supabase } from "../lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface UseAnnouncementsRealtimeOptions {
  teamId: string;
  onNewAnnouncement?: () => void;
  onAnnouncementUpdate?: () => void;
  onReactionChange?: () => void;
  onCommentChange?: () => void;
  enabled?: boolean;
}

export function useAnnouncementsRealtime({
  teamId,
  onNewAnnouncement,
  onAnnouncementUpdate,
  onReactionChange,
  onCommentChange,
  enabled = true,
}: UseAnnouncementsRealtimeOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null);

  const handleNewAnnouncement = useCallback(() => {
    console.info("[Realtime] New announcement received");
    onNewAnnouncement?.();
  }, [onNewAnnouncement]);

  const handleAnnouncementUpdate = useCallback(() => {
    console.info("[Realtime] Announcement updated");
    onAnnouncementUpdate?.();
  }, [onAnnouncementUpdate]);

  const handleReactionChange = useCallback(() => {
    console.info("[Realtime] Reaction changed");
    onReactionChange?.();
  }, [onReactionChange]);

  const handleCommentChange = useCallback(() => {
    console.info("[Realtime] Comment changed");
    onCommentChange?.();
  }, [onCommentChange]);

  useEffect(() => {
    if (!enabled || !teamId) return;

    console.info("[Realtime] Setting up subscriptions for team:", teamId);

    // Create a channel for this team's announcements
    const channel = supabase.channel(`team-${teamId}-announcements`);

    // Subscribe to new announcements
    channel.on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "team_announcements",
        filter: `team_id=eq.${teamId}`,
      },
      handleNewAnnouncement
    );

    // Subscribe to announcement updates (pin/unpin, edits)
    channel.on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "team_announcements",
        filter: `team_id=eq.${teamId}`,
      },
      handleAnnouncementUpdate
    );

    // Subscribe to reactions (on all announcements - will trigger refresh)
    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "announcement_reactions",
      },
      handleReactionChange
    );

    // Subscribe to comments (on all announcements - will trigger refresh)
    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "announcement_comments",
      },
      handleCommentChange
    );

    // Subscribe and store reference
    channel.subscribe((status) => {
      console.info("[Realtime] Subscription status:", status);
      if (status === "SUBSCRIBED") {
        console.info("[Realtime] Successfully subscribed to team announcements");
      }
    });

    channelRef.current = channel;

    // Cleanup function
    return () => {
      console.info("[Realtime] Cleaning up subscriptions");
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [
    enabled,
    teamId,
    handleNewAnnouncement,
    handleAnnouncementUpdate,
    handleReactionChange,
    handleCommentChange,
  ]);

  return {
    isConnected: channelRef.current !== null,
  };
}
