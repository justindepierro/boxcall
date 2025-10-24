/**
 * AnnouncementEditor Component
 *
 * Modal for creating and editing team announcements with rich text support
 */

import React, { useState, useEffect } from "react";
import type {
  Announcement,
  AnnouncementCreate,
  AnnouncementUpdate,
  AnnouncementVisibility,
  Attachment,
} from "../../services/announcementsService";
import { AnnouncementsService } from "../../services/announcementsService";
import { NotificationsService } from "../../services/notificationsService";
import { supabase } from "../../lib/supabase";
import { X } from "lucide-react";
import { RichTextEditor } from "./RichTextEditor";

interface AnnouncementEditorProps {
  teamId: string;
  announcement?: Announcement | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export const AnnouncementEditor: React.FC<AnnouncementEditorProps> = ({
  teamId,
  announcement,
  isOpen,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<AnnouncementVisibility>("all");
  const [isPinned, setIsPinned] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Populate form when editing
  useEffect(() => {
    if (announcement) {
      setTitle(announcement.title);
      // Use content_json if available, otherwise fall back to content
      setContent(announcement.content_json || announcement.content);
      setVisibility(announcement.visibility);
      setIsPinned(announcement.is_pinned);
      setAttachments(announcement.attachments || []);
    } else {
      // Reset for new announcement
      setTitle("");
      setContent("");
      setVisibility("all");
      setIsPinned(false);
      setAttachments([]);
    }
    setError(null);
  }, [announcement, isOpen]);

  // Extract plain text from TipTap JSON for the content field
  const getPlainText = (jsonContent: string): string => {
    try {
      const json = JSON.parse(jsonContent);
      const extractText = (node: any): string => {
        if (node.type === "text") {
          return node.text || "";
        }
        if (node.content && Array.isArray(node.content)) {
          return node.content.map(extractText).join("");
        }
        return "";
      };
      return extractText(json).trim() || jsonContent;
    } catch {
      return jsonContent;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    if (!content.trim()) {
      setError("Content is required");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const plainTextContent = getPlainText(content);

      // Get current user info for notifications
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data: profile } = user
        ? await supabase
            .from("profiles")
            .select("display_name, full_name")
            .eq("id", user.id)
            .single()
        : { data: null };

      const authorName =
        profile?.display_name || profile?.full_name || "Someone";

      if (announcement) {
        // Update existing announcement
        const updates: AnnouncementUpdate = {
          title: title.trim(),
          content: plainTextContent, // Plain text for backward compatibility
          content_json: content, // Rich content as JSON
          visibility,
          is_pinned: isPinned,
          attachments,
        };
        await AnnouncementsService.updateAnnouncement(announcement.id, updates);

        // Process mentions for notifications
        if (user) {
          await NotificationsService.processMentions({
            contentJson: content,
            announcementId: announcement.id,
            announcementTitle: title.trim(),
            authorId: user.id,
            authorName,
            type: "announcement",
          });
        }
      } else {
        // Create new announcement
        const newAnnouncement: AnnouncementCreate = {
          team_id: teamId,
          title: title.trim(),
          content: plainTextContent, // Plain text for backward compatibility
          content_json: content, // Rich content as JSON
          visibility,
          is_pinned: isPinned,
          attachments,
        };
        const result =
          await AnnouncementsService.createAnnouncement(newAnnouncement);

        // Process mentions for notifications
        if (result.success && result.announcement && user) {
          await NotificationsService.processMentions({
            contentJson: content,
            announcementId: result.announcement.id,
            announcementTitle: title.trim(),
            authorId: user.id,
            authorName,
            type: "announcement",
          });
        }
      }

      onSave();
      onClose();
    } catch (err) {
      console.error("Error saving announcement:", err);
      setError("Failed to save announcement. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (saving) return;
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleCancel}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-surface-primary rounded-lg shadow-2xl max-w-2xl w-full p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {announcement ? "Edit Announcement" : "New Announcement"}
            </h2>
            <button
              onClick={handleCancel}
              disabled={saving}
              className="p-2 rounded-lg hover:bg-surface-muted transition-colors disabled:opacity-50"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-error-bg border border-error-200 rounded-lg text-error-600 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-1">
                Title *
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter announcement title"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={saving}
              />
            </div>

            {/* Content */}
            <div>
              <label
                htmlFor="content"
                className="block text-sm font-medium mb-1"
              >
                Content *
              </label>
              <RichTextEditor
                content={content}
                onChange={setContent}
                placeholder="Write your announcement... You can add images by dragging & dropping or pasting them!"
                disabled={saving}
                teamId={teamId}
              />
            </div>

            {/* Visibility */}
            <div>
              <label
                htmlFor="visibility"
                className="block text-sm font-medium mb-1"
              >
                Who can see this announcement?
              </label>
              <select
                id="visibility"
                value={visibility}
                onChange={(e) =>
                  setVisibility(e.target.value as AnnouncementVisibility)
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={saving}
              >
                <option value="all">Everyone</option>
                <option value="staff_only">Staff Only</option>
                <option value="players_only">Players Only</option>
                <option value="families_only">Families Only</option>
              </select>
            </div>

            {/* Pin checkbox */}
            <div className="flex items-center gap-2">
              <input
                id="isPinned"
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="rounded focus:ring-2 focus:ring-brand-primary"
                disabled={saving}
              />
              <label htmlFor="isPinned" className="text-sm font-medium">
                Pin this announcement to the top
              </label>
            </div>

            {/* Attachments placeholder */}
            <div className="pt-4 border-t">
              <p className="text-sm text-muted">
                📎 File attachments coming soon!
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-4">
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="px-4 py-2 border rounded-lg hover:bg-surface-secondary transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : announcement ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
