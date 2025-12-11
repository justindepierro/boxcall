/**
 * AnnouncementsList Component
 *
 * Displays team announcements with pinned items at the top
 * Supports filtering by visibility and date range
 * Renders rich text content with inline images
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import type {
  Announcement,
  AnnouncementFilters,
  AnnouncementVisibility,
} from "../../services/announcementsService";
import { AnnouncementsService } from "../../services/announcementsService";
import { HashtagService } from "../../services/hashtagService";
import type { HashtagCount } from "../../services/hashtagService";
import { useAnnouncementsRealtime } from "../../hooks/useAnnouncementsRealtime";
import { AnnouncementItem } from "./AnnouncementItem";
import { AnnouncementListSkeleton } from "../ui/Skeleton/AnnouncementSkeleton";
import { Hash, X, RefreshCw } from "lucide-react";
import { logError } from "../../utils/logger";
import { FormSelect, ConfirmationModal } from "../../components/ui";
import { useToast } from "../../hooks/useToast";

interface AnnouncementsListProps {
  teamId: string;
  onEdit?: (announcement: Announcement) => void;
  onDelete?: (announcementId: string) => void;
  onTogglePin?: (announcementId: string) => void;
}

export const AnnouncementsList: React.FC<AnnouncementsListProps> = ({
  teamId,
  onEdit,
  onDelete,
  onTogglePin,
}) => {
  const toast = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AnnouncementFilters>({});
  const [expandedComments, setExpandedComments] = useState<Set<string>>(
    new Set()
  );
  const [selectedHashtag, setSelectedHashtag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [hasNewContent, setHasNewContent] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteAnnouncementId, setDeleteAnnouncementId] = useState<
    string | null
  >(null);

  // Real-time subscriptions for live updates
  useAnnouncementsRealtime({
    teamId,
    onNewAnnouncement: () => setHasNewContent(true),
    onAnnouncementUpdate: () => loadAnnouncements(),
    onReactionChange: () => loadAnnouncements(),
    onCommentChange: () => loadAnnouncements(),
    enabled: true,
  });

  // Compute hashtag counts from all announcements
  const hashtagCounts = useMemo<HashtagCount[]>(() => {
    return HashtagService.getHashtagCounts(announcements);
  }, [announcements]);

  // Filter announcements by selected hashtag and search
  const filteredAnnouncements = useMemo(() => {
    let result = announcements;

    // Apply hashtag filter
    if (selectedHashtag) {
      result = HashtagService.filterByHashtag(result, selectedHashtag);
    }

    // Apply search filter (client-side for instant feedback)
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      result = result.filter((announcement) => {
        // Search in title
        if (announcement.title.toLowerCase().includes(query)) return true;

        // Search in content
        if (announcement.content?.toLowerCase().includes(query)) return true;

        return false;
      });
    }

    return result;
  }, [announcements, selectedHashtag, searchQuery]);

  const toggleComments = (announcementId: string) => {
    setExpandedComments((prev) => {
      const next = new Set(prev);
      if (next.has(announcementId)) {
        next.delete(announcementId);
      } else {
        next.add(announcementId);
      }
      return next;
    });
  };

  // Handle hashtag click in content
  const handleHashtagClick = useCallback((hashtag: string) => {
    setSelectedHashtag(hashtag);
    // Smooth scroll to top of the list
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Fetch announcements
  const loadAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await AnnouncementsService.getAnnouncements(teamId, filters);
      setAnnouncements(data);
    } catch (err) {
      logError("Error loading announcements:", err);
      setError("Failed to load announcements");
    } finally {
      setLoading(false);
    }
  }, [teamId, filters]);

  useEffect(() => {
    loadAnnouncements();
  }, [loadAnnouncements]);

  const handleTogglePin = async (id: string) => {
    try {
      await AnnouncementsService.togglePin(id);
      if (onTogglePin) onTogglePin(id);
      await loadAnnouncements();
    } catch (err) {
      logError("Error toggling pin:", err);
      toast.error("Failed to pin/unpin announcement");
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteAnnouncementId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deleteAnnouncementId) return;

    try {
      const result =
        await AnnouncementsService.deleteAnnouncement(deleteAnnouncementId);

      if (!result.success) {
        toast.error(
          result.error ||
            "Failed to delete announcement. You may not have permission."
        );
        return;
      }

      if (onDelete) onDelete(deleteAnnouncementId);
      await loadAnnouncements();
      toast.success("Announcement deleted successfully");
    } catch (err) {
      logError("Error deleting announcement:", err);
      toast.error("Failed to delete announcement. Please try again.");
    } finally {
      setShowDeleteConfirm(false);
      setDeleteAnnouncementId(null);
    }
  };

  if (loading) {
    return <AnnouncementListSkeleton count={5} />;
  }

  if (error) {
    return (
      <div className="bg-error-bg border border-error-200 rounded-lg p-4 text-error-600">
        {error}
      </div>
    );
  }

  if (announcements.length === 0) {
    return (
      <div className="text-center py-12 text-muted">
        <p className="text-lg">No announcements yet</p>
        <p className="text-sm mt-2">
          Create your first announcement to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* New content banner */}
      {hasNewContent && (
        <div
          className="bg-brand-primary-light rounded-lg p-3 flex items-center justify-between shadow-md animate-fade-in cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all"
          onClick={() => {
            setHasNewContent(false);
            loadAnnouncements();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          role="button"
          tabIndex={0}
        >
          <div className="flex items-center gap-3">
            <RefreshCw className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                New posts available
              </p>
              <p className="text-xs text-blue-700">
                Click to refresh and see the latest updates
              </p>
            </div>
          </div>
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 rounded hover:bg-blue-200 transition-colors">
            Refresh
          </button>
        </div>
      )}

      {/* Filter controls */}
      <div className="bg-primary rounded-lg shadow-md p-4 space-y-4">
        {/* Search bar */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search announcements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 rounded-md border border-border px-4 py-2 text-sm focus:border-accent focus:ring-accent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="px-3 py-2 text-sm text-secondary hover:text-primary transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Existing filters */}
        <div className="flex gap-4 items-center flex-wrap">
          <label className="text-sm font-medium text-primary">
            Filter by visibility:
          </label>
          <FormSelect
            value={filters.visibility || ""}
            onChange={(value) =>
              setFilters({
                ...filters,
                visibility: (value as AnnouncementVisibility) || undefined,
              })
            }
            options={[
              { value: "", label: "All" },
              { value: "all", label: "Everyone" },
              { value: "staff_only", label: "Staff Only" },
              { value: "players_only", label: "Players Only" },
              { value: "families_only", label: "Families Only" },
            ]}
            className="min-w-36"
          />

          <label className="text-sm font-medium ml-4">Show pinned only:</label>
          <input
            type="checkbox"
            checked={filters.pinnedOnly || false}
            onChange={(e) =>
              setFilters({
                ...filters,
                pinnedOnly: e.target.checked || undefined,
              })
            }
            className="rounded focus:ring-2 focus:ring-brand-primary"
          />
        </div>

        {/* Hashtag filter */}
        {hashtagCounts.length > 0 && (
          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Hash className="w-4 h-4 text-secondary" />
              <label className="text-sm font-medium text-primary">
                Filter by hashtag:
              </label>
              {selectedHashtag && (
                <button
                  onClick={() => setSelectedHashtag(null)}
                  className="text-xs text-secondary hover:text-primary flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Clear
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {hashtagCounts.map(({ tag, count }) => (
                <button
                  key={tag}
                  onClick={() =>
                    setSelectedHashtag(tag === selectedHashtag ? null : tag)
                  }
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    tag === selectedHashtag
                      ? "bg-green-600 text-white"
                      : "bg-green-100 text-green-800 hover:bg-green-200"
                  }`}
                >
                  #{tag}
                  <span className="ml-1.5 text-xs opacity-75">({count})</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Announcements Feed - Compact, Twitter-style */}
      <div className="bg-primary rounded-lg shadow-md overflow-hidden">
        {filteredAnnouncements.map((announcement) => (
          <AnnouncementItem
            key={announcement.id}
            announcement={announcement}
            isExpanded={expandedComments.has(announcement.id)}
            onToggleComments={() => toggleComments(announcement.id)}
            onEdit={onEdit ? () => onEdit(announcement) : undefined}
            onDelete={
              onDelete ? () => handleDelete(announcement.id) : undefined
            }
            onTogglePin={
              onTogglePin ? () => handleTogglePin(announcement.id) : undefined
            }
            onReactionChange={loadAnnouncements}
            onHashtagClick={handleHashtagClick}
            isCoach={true}
          />
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDeleteAnnouncementId(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Announcement"
        message="Are you sure you want to delete this announcement? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
};
