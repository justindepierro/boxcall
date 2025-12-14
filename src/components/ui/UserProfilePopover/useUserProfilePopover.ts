/**
 * useUserProfilePopover Hook
 *
 * Manages all state and data fetching for UserProfilePopover
 */

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabase";
import { usePopoverContext } from "../../../contexts/PopoverContext";
import { logError } from "../../../utils/logger";
import type {
  PopoverProfile,
  TeamMemberInfo,
  PlayerInfo,
  ComputedPlacement,
} from "./types";

interface UseUserProfilePopoverProps {
  userId: string;
  placement: "top" | "bottom" | "left" | "right" | "auto";
  showOnHover: boolean;
  teamId?: string;
}

export function useUserProfilePopover({
  userId,
  placement,
  showOnHover,
  teamId,
}: UseUserProfilePopoverProps) {
  const navigate = useNavigate();
  const { activePopoverId, registerPopover, unregisterPopover } =
    usePopoverContext();
  const popoverId = useMemo(
    () => `popover-${userId}-${Math.random()}`,
    [userId]
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const [isVisible, setIsVisible] = useState(false);
  const [profile, setProfile] = useState<PopoverProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [teamMember, setTeamMember] = useState<TeamMemberInfo | null>(null);
  const [playerInfo, setPlayerInfo] = useState<PlayerInfo | null>(null);
  const [closeTimeout, setCloseTimeout] = useState<NodeJS.Timeout | null>(null);
  const [computedPlacement, setComputedPlacement] =
    useState<ComputedPlacement>(placement === "auto" ? "bottom" : placement);

  const shouldBeVisible =
    isVisible && (activePopoverId === null || activePopoverId === popoverId);

  // Fetch player info helper
  const fetchPlayerInfo = async (teamIdParam: string, userIdParam: string) => {
    try {
      const { data: playerData } = await supabase
        .from("team_players")
        .select("jersey_number, position, height_inches, weight_lbs")
        .eq("team_id", teamIdParam)
        .eq("user_id", userIdParam)
        .single();

      if (playerData) {
        setPlayerInfo({
          ...playerData,
          positions: playerData.position ? [playerData.position] : null,
        });
      }
    } catch {
      // Player info not available
    }
  };

  // Fetch profile data
  useEffect(() => {
    const fetchData = async () => {
      if (isVisible && !profile && !loading) {
        setLoading(true);
        try {
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select(
              `
              id,
              full_name,
              display_name,
              avatar_url,
              role,
              bio,
              position,
              jersey_number,
              years_coaching,
              current_school,
              social_twitter,
              social_instagram,
              social_linkedin,
              personal_website,
              phone,
              email,
              created_at
            `
            )
            .eq("id", userId)
            .single();

          if (profileError) {
            logError("Error fetching profile:", profileError);
            return;
          }

          setProfile(profileData);
          setAchievements([]);

          if (teamId) {
            const { data: memberData } = await supabase
              .from("team_members")
              .select("team_role, status, assigned_at")
              .eq("team_id", teamId)
              .eq("user_id", userId)
              .single();

            if (memberData) {
              setTeamMember(memberData);
            }

            await fetchPlayerInfo(teamId, userId);
          }
        } catch (error) {
          logError("Error fetching profile data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [isVisible, userId, profile, loading, teamId]);

  // Calculate optimal placement
  useEffect(() => {
    if (shouldBeVisible && containerRef.current && popoverRef.current) {
      const triggerRect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - triggerRect.bottom;
      const spaceAbove = triggerRect.top;

      if (placement === "auto") {
        if (spaceBelow >= 450) {
          setComputedPlacement("bottom");
        } else if (spaceAbove >= 450) {
          setComputedPlacement("top");
        } else {
          setComputedPlacement(spaceBelow > spaceAbove ? "bottom" : "top");
        }
      } else {
        setComputedPlacement(placement);
      }
    } else if (placement !== "auto") {
      setComputedPlacement(placement);
    }
  }, [shouldBeVisible, placement]);

  const handleMouseEnter = useCallback(() => {
    if (showOnHover) {
      if (closeTimeout) {
        clearTimeout(closeTimeout);
        setCloseTimeout(null);
      }
      registerPopover(popoverId);
      setIsVisible(true);
    }
  }, [showOnHover, closeTimeout, registerPopover, popoverId]);

  const handleMouseLeave = useCallback(() => {
    if (showOnHover) {
      const timeout = setTimeout(() => {
        setIsVisible(false);
        unregisterPopover(popoverId);
      }, 300);
      setCloseTimeout(timeout);
    }
  }, [showOnHover, unregisterPopover, popoverId]);

  const handleClick = useCallback(() => {
    if (!showOnHover) {
      if (isVisible) {
        setIsVisible(false);
        unregisterPopover(popoverId);
      } else {
        registerPopover(popoverId);
        setIsVisible(true);
      }
    }
  }, [showOnHover, isVisible, registerPopover, unregisterPopover, popoverId]);

  const handleViewProfile = useCallback(() => {
    setIsVisible(false);
    unregisterPopover(popoverId);
    navigate(`/profile/${userId}`);
  }, [navigate, userId, unregisterPopover, popoverId]);

  return {
    // Refs
    containerRef,
    popoverRef,

    // State
    shouldBeVisible,
    profile,
    loading,
    achievements,
    teamMember,
    playerInfo,
    computedPlacement,

    // Handlers
    handleMouseEnter,
    handleMouseLeave,
    handleClick,
    handleViewProfile,
  };
}
