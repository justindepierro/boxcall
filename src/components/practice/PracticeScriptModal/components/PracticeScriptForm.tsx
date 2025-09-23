import React from "react";
import { Input } from "../../../ui";
import { Typography } from "../../../design-system/Typography";

import type { PracticeScriptFormData } from "../types";

interface PracticeScriptFormProps {
  data: PracticeScriptFormData;
  onChange: (data: PracticeScriptFormData) => void;
}

export const PracticeScriptForm: React.FC<PracticeScriptFormProps> = ({
  data,
  onChange,
}) => {
  const updateField = (field: keyof PracticeScriptFormData, value: string) => {
    onChange({
      ...data,
      [field]: value,
    });
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
    </div>
  );
};
