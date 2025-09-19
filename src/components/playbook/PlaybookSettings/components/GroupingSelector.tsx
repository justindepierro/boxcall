import React from "react";
import { Icon } from "../../../ui/Icon";
import { Button } from "../../../ui/Button/Button";
import { Input } from "../../../ui/Input";
import { InlineEdit, validateGroupingName } from "../../../ui/InlineEdit";
import type { PersonnelGrouping } from "../../../../types/personnel";

interface GroupingSelectorProps {
  groupings: PersonnelGrouping[];
  activeGroupingId: string;
  newGroupingName: string;
  onNewGroupingNameChange: (name: string) => void;
  onCreateGrouping: () => void;
  onDeleteGrouping: (groupingId: string) => void;
  onSetActiveGrouping: (groupingId: string) => void;
  onUpdateGroupingName: (groupingId: string, newName: string) => void;
}

export const GroupingSelector: React.FC<GroupingSelectorProps> = ({
  groupings,
  activeGroupingId,
  newGroupingName,
  onNewGroupingNameChange,
  onCreateGrouping,
  onDeleteGrouping,
  onSetActiveGrouping,
  onUpdateGroupingName,
}) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Personnel Groupings</h3>
      <div className="space-y-2">
        {groupings.map((grouping) => (
          <div
            key={grouping.id}
            className="flex items-center justify-between p-3 border rounded"
          >
            <div className="flex items-center space-x-3">
              <input
                type="radio"
                checked={activeGroupingId === grouping.id}
                onChange={() => onSetActiveGrouping(grouping.id)}
                className="text-blue-600"
              />
              {grouping.isDefault ? (
                <div className="flex items-center space-x-2">
                  <InlineEdit
                    value={grouping.name}
                    onChange={(value: string) =>
                      onUpdateGroupingName(grouping.id, value)
                    }
                    validate={validateGroupingName}
                    showMobileHighlight={true}
                    placeholder="Default name"
                    className="font-medium w-32"
                  />
                  <span className="text-sm text-text-muted">(Default)</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <InlineEdit
                    value={grouping.name}
                    onChange={(value: string) =>
                      onUpdateGroupingName(grouping.id, value)
                    }
                    validate={validateGroupingName}
                    showMobileHighlight={true}
                    placeholder="Grouping name"
                    className="font-medium"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteGrouping(grouping.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Icon name="delete" size="sm" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex space-x-2 mt-3">
        <Input
          placeholder="New grouping name..."
          value={newGroupingName}
          onChange={(e) => onNewGroupingNameChange(e.target.value)}
          className="flex-1"
        />
        <Button onClick={onCreateGrouping} disabled={!newGroupingName.trim()}>
          Create
        </Button>
      </div>
    </div>
  );
};
