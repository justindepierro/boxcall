/**
 * AnnouncementsList Component
 * 
 * Displays team announcements with pinned items at the top
 * Supports filtering by visibility and date range
 */

import React, { useState, useEffect, useCallback } from "react";
import type { 
  Announcement, 
  AnnouncementFilters,
  AnnouncementVisibility 
} from "../../services/announcementsService";
import { AnnouncementsService } from "../../services/announcementsService";
import { AnnouncementReactions } from "./AnnouncementReactions";
import { AnnouncementComments } from "./AnnouncementComments";
import { format } from "date-fns";
import { Pin, Edit2, Trash2, MessageCircle, ChevronDown, ChevronUp } from "lucide-react";

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
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AnnouncementFilters>({});
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());

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

  // Fetch announcements
  const loadAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await AnnouncementsService.getAnnouncements(teamId, filters);
      setAnnouncements(data);
    } catch (err) {
      console.error("Error loading announcements:", err);
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
      console.error("Error toggling pin:", err);
      alert("Failed to pin/unpin announcement");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    
    try {
      const result = await AnnouncementsService.deleteAnnouncement(id);
      
      if (!result.success) {
        alert(result.error || "Failed to delete announcement. You may not have permission.");
        return;
      }
      
      if (onDelete) onDelete(id);
      await loadAnnouncements();
    } catch (err) {
      console.error("Error deleting announcement:", err);
      alert("Failed to delete announcement. Please try again.");
    }
  };

  const getVisibilityLabel = (visibility: AnnouncementVisibility): string => {
    const labels: Record<AnnouncementVisibility, string> = {
      all: "Everyone",
      staff_only: "Staff Only",
      players_only: "Players Only",
      families_only: "Families Only",
    };
    return labels[visibility];
  };

  const getVisibilityColor = (visibility: AnnouncementVisibility): string => {
    const colors: Record<AnnouncementVisibility, string> = {
      all: "bg-blue-100 text-blue-800",
      staff_only: "bg-purple-100 text-purple-800",
      players_only: "bg-green-100 text-green-800",
      families_only: "bg-orange-100 text-orange-800",
    };
    return colors[visibility];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
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
        <p className="text-sm mt-2">Create your first announcement to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter controls */}
      <div className="bg-white rounded-lg shadow p-4 flex gap-4 items-center">
        <label className="text-sm font-medium text-primary">
          Filter by visibility:
        </label>
        <select
          value={filters.visibility || ""}
          onChange={(e) => setFilters({ ...filters, visibility: e.target.value as AnnouncementVisibility || undefined })}
          className="rounded-md border shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">All</option>
          <option value="all">Everyone</option>
          <option value="staff_only">Staff Only</option>
          <option value="players_only">Players Only</option>
          <option value="families_only">Families Only</option>
        </select>

        <label className="text-sm font-medium ml-4">
          Show pinned only:
        </label>
        <input
          type="checkbox"
          checked={filters.pinnedOnly || false}
          onChange={(e) => setFilters({ ...filters, pinnedOnly: e.target.checked || undefined })}
          className="rounded border shadow-sm"
        />
      </div>

      {/* Announcements list */}
      <div className="space-y-3">
        {announcements.map((announcement) => (
          <div
            key={announcement.id}
            className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
              announcement.is_pinned ? "border-yellow-400 bg-yellow-50" : "border-blue-400"
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {announcement.is_pinned && (
                    <Pin className="w-4 h-4 text-warning-600 fill-yellow-600" />
                  )}
                  <h3 className="text-xl font-semibold text-primary">
                    {announcement.title}
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-sm text-secondary">
                  <span>{format(new Date(announcement.created_at), "MMM d, yyyy 'at' h:mm a")}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVisibilityColor(announcement.visibility)}`}>
                    {getVisibilityLabel(announcement.visibility)}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleTogglePin(announcement.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    announcement.is_pinned
                      ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  title={announcement.is_pinned ? "Unpin" : "Pin"}
                >
                  <Pin className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onEdit?.(announcement)}
                  className="p-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(announcement.id)}
                  className="p-2 rounded-lg bg-error-bg text-error-600 hover:bg-error-bg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="prose prose-sm max-w-none text-primary mb-4">
              <p className="whitespace-pre-wrap">{announcement.content}</p>
            </div>

            {/* Attachments */}
            {announcement.attachments && announcement.attachments.length > 0 && (
              <div className="mt-4 pt-4 border-t border">
                <p className="text-sm font-medium text-primary mb-2">Attachments:</p>
                <div className="space-y-2">
                  {announcement.attachments.map((attachment, idx) => (
                    <a
                      key={idx}
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      <span>📎</span>
                      <span>{attachment.name}</span>
                      <span className="text-muted">
                        ({(attachment.size / 1024).toFixed(1)} KB)
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Reactions */}
            <div className="mt-4 pt-4 border-t border">
              <AnnouncementReactions
                announcementId={announcement.id}
                onReactionChange={loadAnnouncements}
              />
            </div>

            {/* Comments Toggle */}
            <div className="mt-4 pt-4 border-t border">
              <button
                onClick={() => toggleComments(announcement.id)}
                className="flex items-center gap-2 text-sm text-secondary hover:text-primary transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Comments</span>
                {expandedComments.has(announcement.id) ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {/* Comments Section */}
              {expandedComments.has(announcement.id) && (
                <div className="mt-4">
                  <AnnouncementComments announcementId={announcement.id} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
