/**
 * AnnouncementItem Component
 *
 * Memoized single announcement card for optimal performance
 * Only re-renders when announcement data actually changes
 * Automatically tracks views for read receipts
 */

import { memo, useState, useEffect } from "react";
import type { Announcement } from "../../services/announcementsService";
import { AnnouncementReactions } from "./AnnouncementReactions";
import { AnnouncementComments } from "./AnnouncementComments";
import { RichTextDisplay } from "./RichTextDisplay";
import { ReadReceipts } from "./ReadReceipts";
import { Avatar } from "../ui/Avatar";
import { UserProfilePopover } from "../ui/UserProfilePopover";
import { AnnouncementViewsService } from "../../services/announcementViewsService";
import { supabase } from "../../lib/supabase";
import { format } from "date-fns";
import {
  Pin,
  Edit2,
  Trash2,
  MessageCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// Extended type for display
interface AnnouncementWithMeta extends Announcement {
  author_name?: string;
  comment_count?: number;
}

interface AnnouncementItemProps {
  announcement: AnnouncementWithMeta;
  isExpanded: boolean;
  onToggleComments: () => void;
  onEdit?: (announcement: Announcement) => void;
  onDelete?: (id: string) => void;
  onTogglePin?: (id: string) => void;
  onReactionChange?: () => void;
  onHashtagClick?: (hashtag: string) => void;
  isCoach?: boolean;
}

export const AnnouncementItem = memo<AnnouncementItemProps>(
  ({
    announcement,
    isExpanded,
    onToggleComments,
    onEdit,
    onDelete,
    onTogglePin,
    onReactionChange,
    onHashtagClick,
    isCoach = false,
  }) => {
    const [isOptimisticPinned, setIsOptimisticPinned] = useState(
      announcement.is_pinned
    );
    const [authorAvatarUrl, setAuthorAvatarUrl] = useState<string | null>(null);

    // Load author avatar
    useEffect(() => {
      const loadAvatar = async () => {
        const { data } = await supabase
          .from("profiles")
          .select("avatar_url")
          .eq("id", announcement.created_by)
          .single();

        if (data?.avatar_url) {
          setAuthorAvatarUrl(data.avatar_url);
        }
      };
      loadAvatar();
    }, [announcement.created_by]);

    // Track view when component mounts
    useEffect(() => {
      const trackView = async () => {
        await AnnouncementViewsService.recordView(
          announcement.id,
          announcement.team_id
        );
      };
      trackView();
    }, [announcement.id, announcement.team_id]);

    const handleTogglePin = async () => {
      if (!onTogglePin) return;

      // Optimistic update
      setIsOptimisticPinned(!isOptimisticPinned);

      try {
        await onTogglePin(announcement.id);
      } catch {
        // Revert on error
        setIsOptimisticPinned(announcement.is_pinned);
      }
    };

    const isPinned = isOptimisticPinned;

    return (
      <article className="bg-surface-primary rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border">
          <div className="flex items-start justify-between">
            <div className="flex-1 flex items-start gap-3">
              {/* Avatar with Popover */}
              <UserProfilePopover
                userId={announcement.created_by}
                teamId={announcement.team_id}
                trigger={
                  <Avatar
                    src={authorAvatarUrl}
                    name={announcement.author_name || "Unknown"}
                    size="md"
                  />
                }
                showOnHover={true}
              />

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <UserProfilePopover
                    userId={announcement.created_by}
                    teamId={announcement.team_id}
                    trigger={
                      <h2 className="text-xl font-semibold text-primary hover:underline cursor-pointer">
                        {announcement.title}
                      </h2>
                    }
                    showOnHover={true}
                  />
                  {isPinned && (
                    <Pin className="w-4 h-4 text-brand-primary fill-current" />
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm text-secondary">
                  <UserProfilePopover
                    userId={announcement.created_by}
                    teamId={announcement.team_id}
                    trigger={
                      <span className="font-medium hover:underline cursor-pointer">
                        {announcement.author_name || "Unknown"}
                      </span>
                    }
                    showOnHover={true}
                  />
                  <span>•</span>
                  <time dateTime={announcement.created_at}>
                    {format(
                      new Date(announcement.created_at),
                      "MMM d, yyyy 'at' h:mm a"
                    )}
                  </time>
                  {announcement.visibility &&
                    announcement.visibility !== "all" && (
                      <>
                        <span>•</span>
                        <span className="capitalize">
                          {announcement.visibility}
                        </span>
                      </>
                    )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {onTogglePin && (
                <button
                  onClick={handleTogglePin}
                  className={`p-2 rounded-lg transition-colors ${
                    isPinned
                      ? "text-brand-primary hover:bg-brand-primary-light"
                      : "text-muted hover:bg-surface-secondary"
                  }`}
                  title={isPinned ? "Unpin" : "Pin"}
                  aria-label={
                    isPinned ? "Unpin announcement" : "Pin announcement"
                  }
                >
                  <Pin
                    className={`w-4 h-4 ${isPinned ? "fill-current" : ""}`}
                  />
                </button>
              )}
              {onEdit && (
                                <button
                  onClick={onEdit}
                  className="p-2 text-muted hover:text-brand-primary hover:bg-brand-primary-light rounded-lg transition-colors"
                  title="Edit announcement"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(announcement.id)}
                  className="p-2 text-muted hover:text-error-600 hover:bg-error-bg rounded-lg transition-colors"
                  title="Delete"
                  aria-label="Delete announcement"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="prose prose-sm max-w-none text-primary mb-4">
            {announcement.content_json ? (
              <RichTextDisplay
                content={announcement.content_json}
                onHashtagClick={onHashtagClick}
              />
            ) : (
              <p className="whitespace-pre-wrap">{announcement.content}</p>
            )}
          </div>

          {/* Reactions */}
          <div className="mb-4">
            <AnnouncementReactions
              announcementId={announcement.id}
              onReactionChange={onReactionChange}
            />
          </div>

          {/* Read Receipts */}
          <div className="mb-4">
            <ReadReceipts
              announcementId={announcement.id}
              teamId={announcement.team_id}
              isCoach={isCoach}
            />
          </div>

          {/* Comments Toggle */}
          <button
            onClick={onToggleComments}
            className="flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-brand-jade transition-colors group"
            aria-expanded={isExpanded}
            aria-controls={`comments-${announcement.id}`}
          >
            <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>
              {announcement.comment_count === 0
                ? "Be the first to comment"
                : `${announcement.comment_count} ${announcement.comment_count === 1 ? "comment" : "comments"}`}
            </span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Comments Section */}
        {isExpanded && (
          <div
            id={`comments-${announcement.id}`}
            className="pt-6 mt-4 border-t border-border-subtle"
          >
            <AnnouncementComments
              announcementId={announcement.id}
              teamId={announcement.team_id}
            />
          </div>
        )}
      </article>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison function - only re-render if these change
    return (
      prevProps.announcement.id === nextProps.announcement.id &&
      prevProps.announcement.title === nextProps.announcement.title &&
      prevProps.announcement.content === nextProps.announcement.content &&
      prevProps.announcement.content_json ===
        nextProps.announcement.content_json &&
      prevProps.announcement.is_pinned === nextProps.announcement.is_pinned &&
      prevProps.announcement.comment_count ===
        nextProps.announcement.comment_count &&
      prevProps.announcement.updated_at === nextProps.announcement.updated_at &&
      prevProps.isExpanded === nextProps.isExpanded
    );
  }
);

AnnouncementItem.displayName = "AnnouncementItem";
