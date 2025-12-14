/**
 * PersonnelSelector Component
 *
 * Personnel configuration dropdown
 */

import { Typography } from "../../../design-system/Typography";
import { FormSelect } from "../../ui/FormSelect/FormSelect";
import { Badge } from "../../ui/Badge";
import { Icon } from "../../ui/Icon";
import type { PersonnelSelectorProps } from "./types";

export function PersonnelSelector({
  personnelConfigurations,
  selectedPersonnelId,
  selectedPersonnel,
  playPersonnel,
  canEdit,
  onSelectPersonnel,
}: PersonnelSelectorProps) {
  if (personnelConfigurations.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg border border-primary">
      <Icon name="users" className="text-tertiary" />
      <div className="flex-1">
        <Typography variant="label-md" className="mb-1">
          Personnel Configuration
        </Typography>
        <FormSelect
          value={selectedPersonnelId || ""}
          onChange={(value) => onSelectPersonnel(value || null)}
          disabled={!canEdit}
          placeholder={
            playPersonnel
              ? `Default (${playPersonnel})`
              : "Default (11 Personnel)"
          }
          options={personnelConfigurations.map((config) => ({
            value: config.id,
            label: `${config.name}${config.description ? ` - ${config.description}` : ""}`,
          }))}
          className="w-full"
        />
      </div>
      {selectedPersonnel && (
        <div className="flex items-center gap-1">
          {selectedPersonnel.players
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((player) => (
              <Badge key={player.id} variant="neutral" size="sm">
                {player.label}
              </Badge>
            ))}
        </div>
      )}
    </div>
  );
}
