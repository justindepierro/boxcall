/**
 * Team Announcements Page
 *
 * Main page for viewing and managing team announcements
 */

import React, { useState } from "react";
import { useParams } from "react-router-dom";
import type { Announcement } from "../../services/announcementsService";
import { AnnouncementsList } from "./AnnouncementsList";
import { AnnouncementEditor } from "./AnnouncementEditor";
import { Plus } from "lucide-react";

export const TeamAnnouncements: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] =
    useState<Announcement | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  if (!teamId) {
    return <div className="p-4 text-error-600">Team ID is required</div>;
  }

  const handleNewAnnouncement = () => {
    setEditingAnnouncement(null);
    setIsEditorOpen(true);
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setIsEditorOpen(true);
  };

  const handleSave = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    setEditingAnnouncement(null);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Team Announcements</h1>
          <p className="text-sm mt-1">Share important updates with your team</p>
        </div>
        <button
          onClick={handleNewAnnouncement}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Announcement
        </button>
      </div>

      {/* Announcements List */}
      <AnnouncementsList
        key={refreshKey}
        teamId={teamId}
        onEdit={handleEdit}
        onTogglePin={handleSave}
        onDelete={handleSave}
      />

      {/* Editor Modal */}
      <AnnouncementEditor
        teamId={teamId}
        announcement={editingAnnouncement}
        isOpen={isEditorOpen}
        onClose={handleCloseEditor}
        onSave={handleSave}
      />
    </div>
  );
};
