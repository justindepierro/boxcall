/**
 * useAnnouncementsRealtime Hook
 * Subscribes to real-time updates for announcements, reactions, and comments
 * Optimized with tiered debouncing: 100ms for reactions/comments (instant feel), 300ms for announcements
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
  announcementDebounceMs?: number; // Default: 300ms for announcements
  interactionDebounceMs?: number; // Default: 100ms for reactions/comments (Facebook-fast!)
}

export function useAnnouncementsRealtime({
  teamId,
  onNewAnnouncement,
  onAnnouncementUpdate,
  onReactionChange,
  onCommentChange,
  enabled = true,
  announcementDebounceMs = 300,
  interactionDebounceMs = 100, // Much faster for social interactions!
}: UseAnnouncementsRealtimeOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Debounce timers for each type of update
  const newAnnouncementTimerRef = useRef<NodeJS.Timeout | null>(null);
  const announcementUpdateTimerRef = useRef<NodeJS.Timeout | null>(null);
  const reactionChangeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const commentChangeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced handlers to batch rapid updates
  const handleNewAnnouncement = useCallback(() => {
    if (newAnnouncementTimerRef.current) {
      clearTimeout(newAnnouncementTimerRef.current);
    }

    newAnnouncementTimerRef.current = setTimeout(() => {
      console.info("[Realtime] New announcement received (debounced 300ms)");
      onNewAnnouncement?.();
      newAnnouncementTimerRef.current = null;
    }, announcementDebounceMs);
  }, [onNewAnnouncement, announcementDebounceMs]);

  const handleAnnouncementUpdate = useCallback(() => {
    if (announcementUpdateTimerRef.current) {
      clearTimeout(announcementUpdateTimerRef.current);
    }

    announcementUpdateTimerRef.current = setTimeout(() => {
      console.info("[Realtime] Announcement updated (debounced 300ms)");
      onAnnouncementUpdate?.();
      announcementUpdateTimerRef.current = null;
    }, announcementDebounceMs);
  }, [onAnnouncementUpdate, announcementDebounceMs]);

  const handleReactionChange = useCallback(() => {
    if (reactionChangeTimerRef.current) {
      clearTimeout(reactionChangeTimerRef.current);
    }

    reactionChangeTimerRef.current = setTimeout(() => {
      console.info("[Realtime] Reaction changed (debounced 100ms - instant!)");
      onReactionChange?.();
      reactionChangeTimerRef.current = null;
    }, interactionDebounceMs); // 100ms for instant feel!
  }, [onReactionChange, interactionDebounceMs]);

  const handleCommentChange = useCallback(() => {
    if (commentChangeTimerRef.current) {
      clearTimeout(commentChangeTimerRef.current);
    }

    commentChangeTimerRef.current = setTimeout(() => {
      console.info("[Realtime] Comment changed (debounced 100ms - instant!)");
      onCommentChange?.();
      commentChangeTimerRef.current = null;
    }, interactionDebounceMs); // 100ms for instant feel!
  }, [onCommentChange, interactionDebounceMs]);

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
        console.info(
          "[Realtime] Successfully subscribed to team announcements"
        );
      }
    });

    channelRef.current = channel;

    // Cleanup function
    return () => {
      console.info("[Realtime] Cleaning up subscriptions and timers");

      // Clear all pending timers
      if (newAnnouncementTimerRef.current) {
        clearTimeout(newAnnouncementTimerRef.current);
        newAnnouncementTimerRef.current = null;
      }
      if (announcementUpdateTimerRef.current) {
        clearTimeout(announcementUpdateTimerRef.current);
        announcementUpdateTimerRef.current = null;
      }
      if (reactionChangeTimerRef.current) {
        clearTimeout(reactionChangeTimerRef.current);
        reactionChangeTimerRef.current = null;
      }
      if (commentChangeTimerRef.current) {
        clearTimeout(commentChangeTimerRef.current);
        commentChangeTimerRef.current = null;
      }

      // Unsubscribe from channel
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
