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
      <article className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 mb-3 overflow-hidden">
        {/* Compact Header - Twitter/LinkedIn style */}
        <div className="px-4 py-3">
          <div className="flex gap-3">
            {/* Avatar */}
            <UserProfilePopover
              userId={announcement.created_by}
              teamId={announcement.team_id}
              trigger={
                <Avatar
                  src={authorAvatarUrl}
                  name={announcement.author_name || "Unknown"}
                  size="sm"
                />
              }
              showOnHover={true}
            />

            {/* Content Column */}
            <div className="flex-1 min-w-0">
              {/* Header Row - Name, Time, Actions */}
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <UserProfilePopover
                    userId={announcement.created_by}
                    teamId={announcement.team_id}
                    trigger={
                      <span className="font-semibold text-sm text-primary hover:underline cursor-pointer truncate">
                        {announcement.author_name || "Unknown"}
                      </span>
                    }
                    showOnHover={true}
                  />
                  <span className="text-secondary text-xs">•</span>
                  <time
                    dateTime={announcement.created_at}
                    className="text-secondary text-xs whitespace-nowrap"
                    title={format(
                      new Date(announcement.created_at),
                      "MMM d, yyyy 'at' h:mm a"
                    )}
                  >
                    {format(new Date(announcement.created_at), "MMM d")}
                  </time>
                  {isPinned && (
                    <Pin className="w-3.5 h-3.5 text-brand-primary fill-current flex-shrink-0" />
                  )}
                </div>

                {/* Action Buttons - Compact */}
                {(onTogglePin || onEdit || onDelete) && (
                  <div className="flex items-center gap-1">
                    {onTogglePin && (
                      <button
                        onClick={handleTogglePin}
                        className={`p-1.5 rounded-md transition-colors ${
                          isPinned
                            ? "text-brand-primary hover:bg-brand-primary-light"
                            : "text-muted hover:text-primary hover:bg-surface-secondary"
                        }`}
                        title={isPinned ? "Unpin" : "Pin"}
                      >
                        <Pin
                          className={`w-3.5 h-3.5 ${isPinned ? "fill-current" : ""}`}
                        />
                      </button>
                    )}
                    {onEdit && (
                      <button
                        onClick={() => onEdit(announcement)}
                        className="p-1.5 text-muted hover:text-primary hover:bg-surface-secondary rounded-md transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(announcement.id)}
                        className="p-1.5 text-muted hover:text-error-600 hover:bg-error-bg rounded-md transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Title - Compact */}
              {announcement.title && (
                <h2 className="text-base font-semibold text-primary mb-2 leading-tight">
                  {announcement.title}
                </h2>
              )}

              {/* Content - Compact */}
              <div className="text-sm text-primary leading-relaxed mb-3">
                {announcement.content_json ? (
                  <RichTextDisplay
                    content={announcement.content_json}
                    onHashtagClick={onHashtagClick}
                  />
                ) : (
                  <p className="whitespace-pre-wrap">{announcement.content}</p>
                )}
              </div>

              {/* Engagement Bar - Twitter style inline actions */}
              <div className="flex items-center justify-between pt-2">
                {/* Left side - Reactions (compact inline) */}
                <div className="flex-1">
                  <AnnouncementReactions
                    announcementId={announcement.id}
                    onReactionChange={onReactionChange}
                  />
                </div>

                {/* Right side - Comments & Read Receipts */}
                <div className="flex items-center gap-4">
                  {/* Read Receipts - Compact */}
                  <div className="flex-shrink-0">
                    <ReadReceipts
                      announcementId={announcement.id}
                      teamId={announcement.team_id}
                      isCoach={isCoach}
                    />
                  </div>

                  {/* Comments Toggle - Compact */}
                  <button
                    onClick={onToggleComments}
                    className="flex items-center gap-1.5 text-xs font-medium text-secondary hover:text-brand-primary transition-colors group"
                    aria-expanded={isExpanded}
                    aria-controls={`comments-${announcement.id}`}
                  >
                    <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span>{announcement.comment_count || 0}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section - Nested within same card */}
        {isExpanded && (
          <div
            id={`comments-${announcement.id}`}
            className="border-t border-subtle bg-surface-secondary"
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
