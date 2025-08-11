import { Typography } from "../../../design-system";
/**
 * EditGroupModal Component
 *
 * Modal for editing existing groups with:
 * - Pre-populated form data
 * - Group details (name, location, notes)
 * - Script assignment display
 * - Form validation
 *
 * @component
 * @example
 * <EditGroupModal
 *   isOpen={showEditGroupModal}
 *   editingGroup={editingGroup}
 *   onClose={() => setShowEditGroupModal(false)}
 *   onUpdateGroup={handleUpdateGroup}
 * />
 */
import React, { useState, useEffect } from "react";
import type { EditingGroup, PracticeGroup } from "../../types";
import Icon from "../../../ui/Icon/Icon";
import { Button } from "../../../ui/Button";
interface EditGroupModalProps {
  isOpen: boolean;
  editingGroup: EditingGroup | null;
  onClose: () => void;
  onUpdateGroup: (blockId: string, updatedGroup: PracticeGroup) => void;
}
export const EditGroupModal: React.FC<EditGroupModalProps> = ({
  isOpen,
  editingGroup,
  onClose,
  onUpdateGroup,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    notes: "",
  });
  // Populate form when editing group changes
  useEffect(() => {
    if (isOpen && editingGroup) {
      setFormData({
        name: editingGroup.group.name,
        location: editingGroup.group.location,
        notes: editingGroup.group.notes,
      });
    }
  }, [isOpen, editingGroup]);
  if (!isOpen || !editingGroup) return null;
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedGroup: PracticeGroup = {
      ...editingGroup.group,
      name: formData.name,
      location: formData.location,
      notes: formData.notes,
    };
    onUpdateGroup(editingGroup.blockId, updatedGroup);
    onClose();
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="surface-card elevation-modal rounded-lg bc-card-padding w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Icon name="edit" size="lg" className="text-navy-700" />
            <Typography variant="headline-sm" className="text-navy-900">
              Edit Group
            </Typography>
          </div>
          <Button
            variant="link"
            size="xs"
            onClick={onClose}
            className="text-text-muted hover:text-text-primary h-auto"
            aria-label="Close edit group modal"
          >
            <Icon
              name="close"
              size="md"
              className="text-text-muted hover:text-text-primary"
            />
          </Button>
        </div>
        {/* Script Assignment Display */}
        {editingGroup.group.scriptId && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center gap-2">
              <Icon name="file" size="sm" className="text-blue-600" />
              <Typography variant="body-sm" className="text-blue-800">
                Script Assigned:{" "}
                {editingGroup.group.scriptTitle ||
                  `Script ${editingGroup.group.scriptId}`}
              </Typography>
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Group Name */}
          <div>
            <Typography variant=\"body-sm\" as=\"label\" className=\"block font-medium text-text-primary mb-1\">
              Group Name *
            </Typography>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-jade-500"
              placeholder="e.g., Offensive Line, Running Backs"
              required
            />
          </div>
          {/* Location */}
          <div>
            <Typography variant=\"body-sm\" as=\"label\" className=\"block font-medium text-text-primary mb-1\">
              Location
            </Typography>
            <input
              type="text"
              value={formData.location}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, location: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-jade-500"
              placeholder="e.g., Field A, Weight Room"
            />
          </div>
          {/* Notes */}
          <div>
            <Typography variant=\"body-sm\" as=\"label\" className=\"block font-medium text-text-primary mb-1\">
              Notes
            </Typography>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-jade-500"
              rows={3}
              placeholder="Additional notes or instructions..."
            />
          </div>
          {/* Submit Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="flex-1"
            >
              Update Group
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
