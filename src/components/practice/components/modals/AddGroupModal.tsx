/**
 * AddGroupModal Component
 * 
 * Modal for adding new groups to practice blocks with:
 * - Group details (name, location, notes)
 * - Form validation
 * - Integration with parent block
 * 
 * @component
 * @example
 * <AddGroupModal
 *   isOpen={showAddGroupModal}
 *   blockId="block-123"
 *   onClose={() => setShowAddGroupModal(false)}
 *   onAddGroup={handleAddGroup}
 * />
 */

import React, { useState, useEffect } from "react";
import { Typography } from "../../../design-system";
import Icon from "../../../ui/Icon/Icon";
import type { PracticeGroup } from "../../types";

interface AddGroupModalProps {
  isOpen: boolean;
  blockId: string;
  onClose: () => void;
  onAddGroup: (blockId: string, group: Omit<PracticeGroup, 'id'>) => void;
}

export const AddGroupModal: React.FC<AddGroupModalProps> = ({
  isOpen,
  blockId,
  onClose,
  onAddGroup,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    notes: "",
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: "",
        location: "",
        notes: "",
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newGroup: Omit<PracticeGroup, 'id'> = {
      name: formData.name,
      location: formData.location,
      notes: formData.notes,
    };

    onAddGroup(blockId, newGroup);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Icon name="users" size="lg" className="text-jade-600" />
            <Typography variant="headline-sm" className="text-navy-900">
              Add Group
            </Typography>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <Icon name="close" size="lg" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Group Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Group Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              Add Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
