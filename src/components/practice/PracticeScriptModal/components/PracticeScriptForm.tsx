import React, { useState } from "react";
import { Input } from "../../../ui";
import { Typography } from "../../../design-system/Typography";
import { Button } from "../../../ui/Button/Button";
import { Icon } from "../../../ui/Icon";

import type { PracticeScriptFormData } from "../types";

interface PracticeScriptFormProps {
  data: PracticeScriptFormData;
  onChange: (data: PracticeScriptFormData) => void;
  tags?: string[];
  onTagsChange?: (tags: string[]) => void;
}

export const PracticeScriptForm: React.FC<PracticeScriptFormProps> = ({
  data,
  onChange,
  tags = [],
  onTagsChange,
}) => {
  const [newTag, setNewTag] = useState("");

  const updateField = (field: keyof PracticeScriptFormData, value: string) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  const handleAddTag = () => {
    if (!newTag.trim() || !onTagsChange) return;
    if (tags.includes(newTag.trim())) {
      setNewTag("");
      return;
    }
    onTagsChange([...tags, newTag.trim()]);
    setNewTag("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (!onTagsChange) return;
    onTagsChange(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Typography variant="label-md" className="block mb-1">
          Script Name *
        </Typography>
        <Input
          value={data.name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            updateField("name", e.target.value)
          }
          placeholder="e.g., Week 1 Practice vs Eagles"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Typography variant="label-md" className="block mb-1">
            Date (Optional)
          </Typography>
          <Input
            type="date"
            value={data.date || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateField("date", e.target.value)
            }
          />
        </div>

        <div>
          <Typography variant="label-md" className="block mb-1">
            Opponent (Optional)
          </Typography>
          <Input
            value={data.opponent || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateField("opponent", e.target.value)
            }
            placeholder="e.g., Philadelphia Eagles"
          />
        </div>
      </div>

      {/* Tags Section */}
      {onTagsChange && (
        <div>
          <Typography variant="label-md" className="block mb-1">
            Tags (Optional)
          </Typography>

          {/* Tag Input */}
          <div className="flex gap-2 mb-2">
            <Input
              value={newTag}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNewTag(e.target.value)
              }
              onKeyPress={handleKeyPress}
              placeholder="Add a tag..."
              className="flex-1"
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={handleAddTag}
              disabled={!newTag.trim()}
            >
              <Icon name="Plus" size={16} />
              Add
            </Button>
          </div>

          {/* Tag Display */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-surface-muted text-secondary text-sm rounded-full"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-primary transition-colors"
                    type="button"
                  >
                    <Icon name="X" size={14} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
