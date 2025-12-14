import React from "react";
import { Typography } from "../../../design-system/Typography";
import Input from "../../../ui/Input/Input";
import Textarea from "../../../ui/TextArea/TextArea";
import { Button } from "../../../ui/Button/Button";
import { Icon } from "../../../ui/Icon";

interface ScriptDetailsFormProps {
  isEditing: boolean;
  scriptName: string;
  setScriptName: (name: string) => void;
  scriptDescription: string;
  setScriptDescription: (desc: string) => void;
  onEditClick: () => void;
  showEditButton: boolean;
}

export const ScriptDetailsForm: React.FC<ScriptDetailsFormProps> = ({
  isEditing,
  scriptName,
  setScriptName,
  scriptDescription,
  setScriptDescription,
  onEditClick,
  showEditButton,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-primary mb-2">
          Script Name *
        </label>
        {isEditing ? (
          <Input
            value={scriptName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setScriptName(e.target.value)
            }
            placeholder="e.g., Week 1 - Passing Fundamentals"
            className="w-full"
          />
        ) : (
          <Typography variant="headline-sm" className="text-primary">
            {scriptName}
          </Typography>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-primary mb-2">
          Description
        </label>
        {isEditing ? (
          <Textarea
            value={scriptDescription}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setScriptDescription(e.target.value)
            }
            placeholder="Describe the focus and goals of this practice script..."
            rows={3}
            className="w-full"
          />
        ) : (
          <Typography variant="body-sm" className="text-secondary">
            {scriptDescription || "No description provided"}
          </Typography>
        )}
      </div>

      {showEditButton && (
        <Button variant="outline" size="sm" onClick={onEditClick}>
          <Icon name="edit" className="h-4 w-4 mr-2" />
          Edit Details
        </Button>
      )}
    </div>
  );
};
