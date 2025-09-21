import React, { useState } from "react";
import { Button } from "../../../ui/Button/Button";
import { Input } from "../../../ui";
import { TextArea } from "../../../ui";

import type { PracticeScriptPlay } from "../types";

interface PracticeScriptPlayFormProps {
  initialData?: PracticeScriptPlay;
  onSubmit: (play: Omit<PracticeScriptPlay, "id">) => void;
  onCancel: () => void;
}

export const PracticeScriptPlayForm: React.FC<PracticeScriptPlayFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<Omit<PracticeScriptPlay, "id">>({
    playId: initialData?.playId,
    playName: initialData?.playName || "",
    personnel: initialData?.personnel || "",
    notes: initialData?.notes || "",
    defenseFront: initialData?.defenseFront || "",
    defensiveCoverage: initialData?.defensiveCoverage || "",
    blitz: initialData?.blitz || "",
    stunt: initialData?.stunt || "",
    hash: initialData?.hash || "",
    situation: initialData?.situation || "",
  });

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.playName.trim()) {
      // TODO: Show validation error
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Play Name - with search functionality */}
      <div>
        <label className="block text-sm font-medium mb-1">Play Name *</label>
        <div className="relative">
          <Input
            value={formData.playName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateField("playName", e.target.value)
            }
            placeholder="Search playbook or enter custom play name"
            required
          />
          {/* TODO: Add playbook search dropdown with AdvancedSearchBar */}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Start typing to search existing plays, or enter a custom play name
        </p>
      </div>

      {/* Personnel */}
      <div>
        <label className="block text-sm font-medium mb-1">Personnel</label>
        <Input
          value={formData.personnel}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            updateField("personnel", e.target.value)
          }
          placeholder="e.g., 11 Personnel"
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium mb-1">Notes</label>
        <TextArea
          value={formData.notes}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            updateField("notes", e.target.value)
          }
          placeholder="Additional notes about this play"
          rows={3}
        />
      </div>

      {/* Defense Section */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Defense Front
          </label>
          <Input
            value={formData.defenseFront}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateField("defenseFront", e.target.value)
            }
            placeholder="e.g., 4-3, 3-4"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Defensive Coverage
          </label>
          <Input
            value={formData.defensiveCoverage}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateField("defensiveCoverage", e.target.value)
            }
            placeholder="e.g., Cover 2, Man"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Blitz</label>
          <Input
            value={formData.blitz}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateField("blitz", e.target.value)
            }
            placeholder="e.g., Edge Blitz"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Stunt</label>
          <Input
            value={formData.stunt}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateField("stunt", e.target.value)
            }
            placeholder="e.g., Twist"
          />
        </div>
      </div>

      {/* Hash and Situation */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Hash</label>
          <Input
            value={formData.hash}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateField("hash", e.target.value)
            }
            placeholder="e.g., Left, Right, Middle"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Situation</label>
          <Input
            value={formData.situation}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateField("situation", e.target.value)
            }
            placeholder="e.g., 3rd & 5, Red Zone"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          {initialData ? "Update Play" : "Add Play"}
        </Button>
      </div>
    </form>
  );
};
