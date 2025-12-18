/**
 * UserProfilePopover Component
 *
 * Displays a rich profile popover on hover or click
 */

import React from "react";
import { useUserProfilePopover } from "./useUserProfilePopover";
import {
  PopoverHeader,
  ProfileContent,
  LoadingState,
  NotFoundState,
} from "./components";
import type { UserProfilePopoverProps } from "./types";

export const UserProfilePopover: React.FC<UserProfilePopoverProps> = ({
  userId,
  trigger,
  placement = "auto",
  showOnHover = true,
  className = "",
  teamId,
}) => {
  const {
    containerRef,
    popoverRef,
    shouldBeVisible,
    profile,
    loading,
    achievements,
    teamMember,
    playerInfo,
    computedPlacement,
    handleMouseEnter,
    handleMouseLeave,
    handleClick,
    handleViewProfile,
  } = useUserProfilePopover({
    userId,
    placement,
    showOnHover,
    teamId,
  });

  let content: React.ReactNode;
  if (loading) {
    content = <LoadingState />;
  } else if (profile) {
    content = (
      <>
        <PopoverHeader profile={profile} teamMember={teamMember} />
        <ProfileContent
          profile={profile}
          teamMember={teamMember}
          playerInfo={playerInfo}
          achievements={achievements}
          onViewProfile={handleViewProfile}
        />
      </>
    );
  } else {
    content = <NotFoundState />;
  }

  return (
    <div
      ref={containerRef}
      className={`relative inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {trigger}

      {shouldBeVisible && (
        <div
          ref={popoverRef}
          className={`
            fixed z-[9999] w-80 rounded-lg shadow-2xl border border-muted
            bg-primary/95 backdrop-blur-xl
            transform transition-all duration-200 ease-out
          `}
          style={{
            top:
              computedPlacement === "bottom"
                ? `${containerRef.current?.getBoundingClientRect().bottom ?? 0}px`
                : "auto",
            bottom:
              computedPlacement === "top"
                ? `${window.innerHeight - (containerRef.current?.getBoundingClientRect().top ?? 0)}px`
                : "auto",
            left: `${containerRef.current?.getBoundingClientRect().left ?? 0}px`,
            marginTop: computedPlacement === "bottom" ? "8px" : "0",
            marginBottom: computedPlacement === "top" ? "8px" : "0",
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {content}
        </div>
      )}
    </div>
  );
};
