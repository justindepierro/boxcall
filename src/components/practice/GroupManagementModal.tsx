import React from "react";
import { Typography } from "../../components/design-system";
import { Button } from "../../components/ui";
import type { PracticeGroup } from "./types";

interface GroupManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  group?: PracticeGroup;
  newGroup: Partial<PracticeGroup>;
  onNewGroupChange: (updates: Partial<PracticeGroup>) => void;
  onEditGroupChange: (updates: Partial<PracticeGroup>) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export const GroupManagementModal: React.FC<GroupManagementModalProps> = ({
  isOpen,
  onClose: _onClose,
  mode,
  group,
  newGroup,
  onNewGroupChange,
  onEditGroupChange,
  onSubmit,
  onCancel,
}) => {
  if (!isOpen) return null;

  const isAddMode = mode === "add";
  const currentGroup = isAddMode ? newGroup : group;
  const onChange = isAddMode ? onNewGroupChange : onEditGroupChange;

  const isValid = isAddMode 
    ? newGroup.name?.trim() 
    : group?.name?.trim();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <Typography variant="headline-md" className="mb-4">
            {isAddMode ? "Add Group" : "Edit Group"}
          </Typography>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Group Name *
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Quarterbacks, Defensive Line..."
                value={currentGroup?.name || ""}
                onChange={(e) => onChange({ name: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Field A, Main Gym..."
                value={currentGroup?.location || ""}
                onChange={(e) => onChange({ location: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Special instructions or notes for this group..."
                value={currentGroup?.notes || ""}
                onChange={(e) => onChange({ notes: e.target.value })}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={onSubmit}
              disabled={!isValid}
            >
              {isAddMode ? "Add Group" : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
