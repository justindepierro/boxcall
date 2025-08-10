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
import { Typography } from "../../../design-system";
import type { EditingGroup, PracticeGroup } from "../../types";
import Icon from "../../../ui/Icon/Icon";
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
      <div className="bg-white rounded-lg bc-card-padding w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Icon name="edit" size="lg" className="text-navy-700" />
            <Typography variant="headline-sm" className="text-navy-900">
              Edit Group
            </Typography>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <Icon
              name="close"
              size="md"
              className="text-gray-500 hover:text-gray-700"
            />
          </button>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Group Name *
            </label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
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
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-white bg-jade-600 rounded-md hover:bg-jade-700 transition-colors"
            >
              Update Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
